/* src/App.js */
import './index.css';

import React, { useEffect, useState } from 'react'
import Amplify, { API, graphqlOperation, Auth } from 'aws-amplify';
import { Link } from 'react-router-dom';
import SpotifyPlayer from 'react-spotify-player';
import noimage from './etc/howtodisappear.jpg';
import spinner from './spinner.gif';

import { withAuthenticator, AmplifySignOut } from '@aws-amplify/ui-react'
import { withSpotifyAuthenticator} from './AuthSpotify'
import awsExports from "./aws-exports";
import * as mutations from './graphql/mutations';
import * as queries from './graphql/queries';

Amplify.configure(awsExports);
const AWS = require("aws-sdk");
AWS.config.update({region: "eu-central-1" });

// 1. lépés: a gombra kattintva egy, a client_id-mmal felparaméterezett linkre irányítom a usert, ami a spotify 
// autorizációs felülete - ha itt sikeresen belépett, a spotify visszairányít a callback url-emre, valamint a hash-ben 
// visszaküldi a code-ot, ami szükséges az első request_token lekéréséhez - ezt a componentDidMount-ban figyelem
// 2. lépés:  a componentDidMount-ban, ha a hash-ben a code paraméter szerepel, elindítjuk a post requestet a tokenkérő 
// urljére, majd ha minden jól ment, visszakapunk egy json-t, amiből kiszedjük az access_tokent és request_tokent
// a request_tokent ez esetben fel is küldjük az adatbázisba a felhasználóhoz rendelve

class Profile extends React.Component {
	
	constructor(props) {
		super(props);
		this.state = {
		};
		this.state = {
	  		showMoreArtists: false,
		}
	}
	
	giveMoreArtists() {
	this.setState({showMoreArtists: true})
  	}

	async componentDidMount() {
		try {
			const topArtists = await this.getTopArtists();
			const userMatches = await this.getUserMatches();
			const userData = await this.getUserData(userMatches);
			this.setState({ topArtists, userMatches, userData });
		} catch (err) {
			console.log('getMusicTaste failed --- ', err);
		}
	}
	

	getUserMatches = async () => {
		try {
			console.log(this.props.currentUser.username);

			const { data: data1 } = await API.graphql({
				query: queries.byUser1,
				variables: { user1ID: this.props.currentUser.username},
			});

	//		console.log('databyuser1 - ',data);

			const { data : data2 } = await API.graphql({
				query: queries.byUser2,
				variables: { user2ID: this.props.currentUser.username},
			});

			// const a = [1,2,3];
			// const b = [4,5, ...a, 55];

			const allItems = [
				...data1.byUser1.items,
				...data2.byUser2.items,
			];

			const matches = {};
			const artists = {};
			for (const { user1ID, user1SpotifyID, user2ID, user2SpotifyID, artist } of allItems) {
				// ha a vizsgált user a user1, akkor a vele matchelt user a user2
				const user = (user1ID === this.props.currentUser.username) ? user2SpotifyID : user1SpotifyID;
				// ha már van match az adott userrel, hozzáfűzzük a tömbhöz az új közös artistot
				if (matches[user]) {
					matches[user].push(artist);
				} else {
				// ha még nincs match, akkor létrehozzuk
					matches[user] = [artist];
				}
				// minden felmerülő artist behelyezése egy artists objectbe a későbbi tömbösített queryhez, egyelőre null értékkel
				artists[artist] = null;
			}
			console.log('matches - ', matches);
			const { spotifyApi } = this.props;

			// az artists-ban lévő artistok adatainak tömbösített lekérése
			const res = await spotifyApi.getArtists(Object.keys(artists));

			// artists-ba az artist id key mellé behelyezni a kapott adatokat 
			for (const artist of res.artists) {
				artists[artist.id] = artist;
			}

			const asd = Object.keys(matches).map(user => ({
				user,
				artists: matches[user].map(artistId => artists[artistId]),
			}));

			return asd;
		} catch (err) {
			console.log({ err });
		}
	}

	getUserData = async (userMatches) => {
		const allUsers = userMatches.map(({ user }) => ( user ));
		console.log('allusers', allUsers);
		const users = {};
		const { spotifyApi } = this.props;
		for (const user of allUsers) {
			const userData = await spotifyApi.getUser(user);
			console.log('userdata ', userData);
			// if (users[user]) {
				users[user] = userData;
			// } else {
			// ha még nincs, akkor létrehozzuk
			//	users[user] = [userData];
			//}
		}
		console.log(users);
		return users;
	}

	// a currentUserről lekéri a tárolt topArtistjait, majd lekéri őket a SpotifyAPI-tól
	getTopArtists = async () => {
		try {
			console.log('-------- gettopartists --------');
			console.log(this.props.currentUser.username);
			const { data } = await API.graphql({
				query: queries.listMusicTastes,
				variables: { username: this.props.currentUser.username},
			});
			console.log('lefutott a query');
			const { spotifyApi } = this.props;
			const { items } = data.listMusicTastes;
			const artistsToQuery = items.map(({ artist }) => artist);

			// felbontani 50 elemes szeletekre az artistsToQuery-t
			const artists = [];
			while (artistsToQuery.length > 0){
				
				console.log('artistsToQuery.length  ',artistsToQuery.length );
				const batchArtists = artistsToQuery.splice(0, 50);
				const data = await spotifyApi.getArtists(batchArtists);
				artists.push(...data.artists);
			}
			
			// const { artists } = await spotifyApi.getArtists();
			return artists;
			
		} catch (err) {
			console.log('what the hell', err);
		}
	}

	signOut = async () => {
		try {
			await Auth.signOut();
		} catch(err) {
			console.log(err);
		}
	}

	render() {
		const { display_name, images } = this.props.currentSpotifyUser;
		const src = (images[0] ? images[0].url : noimage);
		const { topArtists } = this.state;
		const { userMatches} = this.state;
		const { userData } = this.state;
		const numberOfItems = this.state.showMoreArtists ? topArtists.length : 6

		return (
			<div className="body">
				<div className="container">

					<div className="user-container">
						<div className="profile-holder">
							<img src={src} className="profile-img"/>
						</div>
						<div className="text uppercase">
								{display_name}
						</div>
					</div>

					<div className="friends-container">
						<div className="text uppercase">
								your music buddies
						</div>

						<div className="friend-flex-container">
							{userMatches ? userMatches.map(({ user, artists }) => (
								<Link key={user} to={'/mate/' + user}>
									<div className="friend-flex-item">
										<div className="padding-bottom"><img className="user-img" src={userData[user].images[0].url}/></div>
										<div>{userData[user].display_name}</div>
									</div>
								</Link>
							)) : <div style={{height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
									<img
										src={spinner}
										style={{ margin: 'auto', display: 'block',  }}
										alt="Loading..."
									/>
								</div>
							}
						</div>

						{/*
						<div>
							{userMatches ? userMatches.map(({ user, artists }) => (
								<div key={user}>
									<div>
									<img className="user-img" src={userData[user].images[0].url}/>
										{userData[user].display_name}
									</div>
									
									<div>
										You both seem to be hardcore
												{artists.map(({ name }) => (
													<span> {name} </span>
												))}
										fans.
									</div>
									
									{/*
									<div style={styles.center}>
										{artists.map(({ images, name }) => (
											<div key={name}>
												<img src={getImageUrl(images)} style={styles.artistPic} />
												<div style={styles.center}> {name} </div>
											</div>
										))}
									</div>
									
								</div>
							)) : 'pillanat'}
						</div> 
						*/}
					</div>
			
					
					<div className="friends-container">
						<div className="text uppercase">
							your top artists
						</div>
						<div className="artist-flex-container">
							{topArtists ? topArtists.slice(0, numberOfItems).map(({ name, images }) => (
								<div key={name} className='artist-flex-item'>
									<div className="padding-bottom"><img src={getImageUrl(images)} className="artist-img" /></div>
									<div>{name}</div>
								</div>
							)) : <div style={{height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
									<img
										src={spinner}
										style={{ margin: 'auto', display: 'block',  }}
										alt="Loading..."
									/>
								</div>
							}
						</div>
						<div style={{height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
							{this.state.showMoreArtists ? '' :
								<div className="button" onClick={()=> this.giveMoreArtists()}> . . . </div>
							}
						</div>
					</div>
					
					
					<AmplifySignOut/>
				</div>
			</div>
			
		)
	}

}

function getImageUrl(images) {
	console.log('images hogy néz ki', images);
	if (images.length !== 0) {
		return images.sort((a, b) => a.height - b.height).find(
			({ height }) => (height > 200)
		).url;
	} else return noimage;
}


export default Profile;