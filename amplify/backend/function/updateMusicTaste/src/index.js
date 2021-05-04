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
  console.log(event);
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
		refreshToken: item.dynamodb.NewImage.refreshToken.S
	}));
	// userek topArtistjainak updateelése a MusicTaste táblában
	await updateMusicTaste(usersToUpdate);
	
	callback(null, usersToUpdate);
	
  } else {
	// CloudWatch trigger minden nap 17:00-kor
	// a trigger hatására 10 user topArtistjait updateeli 
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
	docClient.query(params, async function(err, data){
		if(err) {
			callback(err, null);
		} else {
			// userek topArtistjainak updateelése a MusicTaste táblában
			console.log(data.Items);
			await updateMusicTaste(data.Items);
			callback(null, data.Items);
		}
	});
  }
	
	
}

// a kapott usereknek accessTokent generál, majd lekéri a Spotify API-ról a top artistjaikat
// updateeli a MusicTaste táblát
async function updateMusicTaste(users) {
	for (const user of users) {
		console.log(user);
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
			
			documentClient.put(params, function(err, data) {
				if (err) console.log(err);
				else console.log(data);
			});
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
		// console.log(topArtists);
		return topArtists;
	}, function(err) {
		console.log('Something went wrong!', err);
	});
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
		console.log(err);
	}

	if (res) {
		console.log(res.access_token);
		return res.access_token;
	}
	console.log(res);
}

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
		console.log(err);
	}
	
}