/* Amplify Params - DO NOT EDIT
	API_REACTAMPLIFIED_GRAPHQLAPIENDPOINTOUTPUT
	API_REACTAMPLIFIED_GRAPHQLAPIIDOUTPUT
	API_REACTAMPLIFIED_GRAPHQLAPIKEYOUTPUT
	AUTH_REACTAMPLIFIED19636619_USERPOOLID
	ENV
	REGION
Amplify Params - DO NOT EDIT */

'use strict';
const config = require('./config.json');
const AWS = require("aws-sdk");
const dynamodb = new AWS.DynamoDB();
const docClient = new AWS.DynamoDB.DocumentClient();
const https = require('https');
const querystring = require('querystring');

const SpotifyWebApi = require('spotify-web-api-node');
const spotifyApi = new SpotifyWebApi();

exports.handler = async function(event, ctx, callback) {
  console.log('event --- ', event);
  if (event.Records){
	// DynamoDB trigger: User táblában változása
	
	// --- filter azon userekre, akik most lettek spotify authorizeolva
	const usersToUpdate = event.Records.filter(({eventName, dynamodb}) => { 
		return (
			eventName === 'MODIFY' &&
			dynamodb.NewImage.spotifyAuthorized.S === 'true' &&
			dynamodb.OldImage.spotifyAuthorized.S === 'false'
		);
	}).map(item => ({
		username: item.dynamodb.NewImage.username.S,
		refreshToken: item.dynamodb.NewImage.refreshToken.S,
		id: item.dynamodb.NewImage.id.S
	}));
	// userek topArtistjainak updateelése a MusicTaste táblában
	await updateMusicTaste(usersToUpdate);
	
	callback(null, usersToUpdate);
	
  } else {
	// CloudWatch trigger minden nap 17:00-kor
	// a trigger hatására 10 user topArtistjait updateeli 
	console.log('cloudwatch trigger ---');
	var params = {
		  ExpressionAttributeValues: {
			':spotifyAuthorized': 'true',
		  },
		  IndexName: "usersByUpdateDate",
		  Limit: 10,
		 KeyConditionExpression: 'spotifyAuthorized = :spotifyAuthorized',
		 TableName: 'User-d5p6uqeierdf5jrymwu6c222aa-develop'
	};
	// query azokra a userekre (limit: 10 user), akik spotify authorizeolva vannak
	try {
		const data = await docClient.query(params).promise();
		await updateMusicTaste(data.Items);
	} catch (err) {
		console.log('usersByUpdateDate query failed ', err);
		callback(err, null);
	}
	
  }
	
}

// a kapott usereknek accessTokent generál, majd lekéri a Spotify API-ról a top artistjaikat
// updateeli a MusicTaste táblát
async function updateMusicTaste(users) {
	for (const user of users) {
		let accesstoken = await getAccessToken(user.refreshToken);
		const topArtists = await getTopArtists(accesstoken);
		
		for (const artist of topArtists) {
			var params = {
				TableName : 'MusicTaste-d5p6uqeierdf5jrymwu6c222aa-develop',
				Item: {
					username: user.username,
					artist: artist.id,
					artistName: artist.name,
				},
			};
			
			var documentClient = new AWS.DynamoDB.DocumentClient();
			try {
				await documentClient.put(params).promise();
			} catch (err) {
				console.log('MusicTaste update failed', err);
			}
			
			// match tábla frissítése az újonnan bekerülő artistok alapján
			await matchUsersByArtist(artist.id);
		}
		// musicTasteUpdatedAt frissítése
		await setMusicTasteUpdatedAt(user.id);
	}
}

// accessToken alapján lekéri a user max 50 topArtistját
function getTopArtists(accesToken){
	spotifyApi.setAccessToken(accesToken);
	return spotifyApi.getMyTopArtists({limit: 50})  // lehetséges intervallumok: alltime, utolsó 6 hónap, utolsó 4 hét
	.then(function(data) {
		let topArtists = data.body.items;
		return topArtists;
	}, function(err) {
		console.log('Spotify get top artists call failed --- ', err);
	});
}

// lekéri a paraméterként kapott, a MusicTaste táblába újonnan bekerülő artistokhoz tartozó usereket,
// majd összematcheli őket a Match táblába illesztéssel
async function matchUsersByArtist(artistID) {
	var documentClient = new AWS.DynamoDB.DocumentClient();
	var params = {
		  ExpressionAttributeValues: {
			':artistID': artistID,
		  },
		  IndexName: "byArtist",
		 KeyConditionExpression: 'artist = :artistID',
		 TableName: 'MusicTaste-d5p6uqeierdf5jrymwu6c222aa-develop'
	};
	// query azokra a userekre, akik szintén az adott artistot hallgatják
	// pl BaianaSystems.id - 5JHYuwE2n7bleXMUsmtCW5
	try {
		const data = await documentClient.query(params).promise();
		// userek topArtistjainak updateelése a MusicTaste táblában
		for (const user1 of data.Items || []) {
			for (const user2 of data.Items || []) {
				if (user1.username !== user2.username) {
					matchUsers(user1, user2, artistID);
				}
			}
		}
	} catch (err) {
		console.log('byArtist query failed --- ', err);
	}
}

// Match táblába beteszi helyes id szerint a paraméterként kapott usereket 
async function matchUsers(user1, user2, artistID) {
	var documentClient = new AWS.DynamoDB.DocumentClient();
	var id = (user1.username < user2.username) ? user1.username + user2.username : user2.username + user1.username; 
	var params = {
			TableName : 'Match-d5p6uqeierdf5jrymwu6c222aa-develop',
			Item: {
				id: id,
				user1ID: user1.username,
				user2ID: user2.username,
				artist: artistID,
			},
	};
	// put : megnézi, hogy létezik-e egy ilyen korábbi kulcsú entry és csak utána rakja bele
	try {
		await documentClient.put(params).promise();
	} catch (err) {
		console.log('put Match entry failed --- ', err);
	}
}

// https requestet állít össze és hajt végre
function request(url, method, headers, data) {
	return new Promise((resolve, reject) => {
		const options = {
			method,
			headers,
		};
		let dataString = '';
		const req = https.request(url, options, function(res) {
		  res.on('data', chunk => {
			dataString += chunk;
		  });
		  res.on('end', () => {
			resolve(JSON.parse(dataString));
		  });
		});
		
		req.on('error', (e) => {
		  reject(e);
		});
		
		if (data) req.write(data);
		
		req.end();
	});
}

// refreshTokent accessTokenre váltása
async function getAccessToken(refreshToken) {
		
	const body = querystring.stringify({ grant_type: 'refresh_token', refresh_token: refreshToken, client_id: config.clientId, client_secret: config.clientSecret });

	let headers = {"Content-Type": "application/x-www-form-urlencoded" };

	let res;
	try {
		res = await request("https://accounts.spotify.com/api/token", 'POST', headers, body);
	} catch (err) {
		console.log('accessToken error --- ',err);
	}

	if (res) {
		return res.access_token;
	}
}

// frissíti a musicTasteUpdatedAt timestampet
async function setMusicTasteUpdatedAt(userID) {
	const now = new Date().toISOString();
	var documentClient = new AWS.DynamoDB.DocumentClient();
	var params = {
		TableName: 'User-d5p6uqeierdf5jrymwu6c222aa-develop',
		Key: { id: userID },
		UpdateExpression: 'set musicTasteUpdatedAt = :now',
		ExpressionAttributeValues: { ':now': now },
	}
	try {
		await documentClient.update(params).promise();
	} catch (err) {
		console.log('musicTasteUpdatedAt error --- ',err);
	}
	
}