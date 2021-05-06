/* src/App.js */
import React, { useEffect, useState } from 'react'
import Amplify, { API, graphqlOperation, Auth } from 'aws-amplify'

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

class App extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
		};
	}

	async componentDidMount() {
		try {
			const topArtists = await this.getTopArtists();
			const userMatches = await this.getUserMatches();
			this.setState({ topArtists, userMatches });
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

			return [
				...data1.byUser1.items,
				...data2.byUser2.items,
			].map(({ user1ID, user2ID, artist }) => ({
				user: (user1ID === this.props.currentUser.username) ? user2ID : user1ID,
				artist,
			}));

			// jó lenne eltárolni valahogy a spotify userid-kat is :( :( :(
		
		} catch (err) {
			console.log({ err });
		}
	}

	getTopArtists = async () => {
		try {
			console.log(this.props.currentUser.username);
			const { data } = await API.graphql({
				query: queries.listMusicTastes,
				variables: { username: this.props.currentUser.username},
			});

			const { spotifyApi } = this.props;
			const { items } = data.listMusicTastes;
			const { artists } = await spotifyApi.getArtists(items.map(({ artist }) => artist));
			return artists;
		
		} catch (err) {
			console.log({ err });
		}
	}

	
	render() {
		const { display_name, images } = this.props.currentSpotifyUser;
		const src = images[0] && images[0].url;
		const { topArtists } = this.state;
		const { userMatches} = this.state;

		return (
			<div style={styles.container}>
				<h1 style={styles.text}>Success, you're in</h1>
				<h1 style={styles.text}>{display_name}</h1>
				<img src={src} style={styles.profilePic} />
				<h3 style={styles.text}>friends: {this.props.currentSpotifyUser.followers.total}</h3>

				<h3 style={styles.text}>YOUR MUSIC BUDDIES</h3>
				<div>
					{userMatches ? userMatches.map(({ user, artist }) => (
						<p key={user}>
							{/* <img src={getImageUrl(artist)} style={styles.artistPic} /> */}
							{user} - {artist}
						</p>
					)) : 'pillanat'}
				</div>
				<h3 style={styles.text}>YOUR TOP ARTISTS</h3>
				<div>
					{topArtists ? topArtists.map(({ name, images }) => (
						<p key={name}>
							<img src={getImageUrl(images)} style={styles.artistPic} />
							{name}
						</p>
					)) : 'pillanat'}
				</div>
				
				
				<AmplifySignOut/>
			</div>
		)
	}

}

function getImageUrl(images) {
	return images.sort((a, b) => a.height - b.height).find(
		({ height }) => (height > 200)
	).url;
}


const styles = {
	container: { width: 400, margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 20 },
	text: { fontFamily: "sans-serif", fontWeight: "lighter"},
	input: { border: 'none', backgroundColor: '#ddd', marginBottom: 10, padding: 8, fontSize: 18 },
	todoName: { fontSize: 20, fontWeight: 'bold' },
	todoDescription: { marginBottom: 0 },
	button: { backgroundColor: '#1db954', color: 'white', outline: 'none', fontSize: 18, fontFamily: "sans-serif", fontWeight: "lighter", textDecoration: "none", padding: '0.85rem 0.65rem', borderRadius: '.52em' },
	artistPic: {width: '10rem'},
	profilePic: {borderRadius: '100%', border: '1px solid #dddddd'},
}

export default withAuthenticator(withSpotifyAuthenticator(App))