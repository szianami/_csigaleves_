/* src/App.js */
import './index.css';

import React, { useEffect, useState } from 'react'
import Amplify, { API, graphqlOperation, Auth } from 'aws-amplify'
import { useHistory, BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";
import SpotifyPlayer from 'react-spotify-player';
import noimage from './etc/howtodisappear.jpg';
import spinner from './spinner.gif';
import smiley from './smiley.png';

import { withAuthenticator, AmplifySignOut } from '@aws-amplify/ui-react'
import { withSpotifyAuthenticator} from './AuthSpotify'
import awsExports from "./aws-exports";
import * as mutations from './graphql/mutations';
import * as queries from './graphql/queries';

import Profile from './Profile';
import Mate from './Mate';

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
	
	signOut = async () => {
		try {
			await Auth.signOut();
		} catch(err) {
			console.log(err);
		}
    }

	render() {
		return (
			<div className="body">
				<Router>
					<div className="header">
						<img className="smiley" src={smiley}/>
						<div className="header-flex-container">
						<Link to={'/'} className="header-flex-item" onClick={()=> this.signOut()}> signout </Link>
						<Link to={'/profile'} className="header-flex-item"> profile </Link>
						<Link to={'/pals'} className="header-flex-item"> pals </Link>
						<Link to={'/playlists'} className="header-flex-item"> playlists </Link>
						<Link to={'/discover'} className="header-flex-item"> discover </Link>
						</div>
					</div>

					<Switch>
						<Route
							path='/profile'
							render={(props) => (
								<Profile {...this.props} />
							)}
						/>
						<Route
							path='/mate/:id'
							render={(props) => (
								<Mate {...props} {...this.props} />
							)}
						/>
					</Switch>
				</Router>
			</div>
		)
	}

}

export default withAuthenticator(withSpotifyAuthenticator(App), false);