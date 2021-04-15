/* src/App.js */
import React, { useEffect, useState } from 'react'
import Amplify, { API, graphqlOperation } from 'aws-amplify'

import { withAuthenticator } from '@aws-amplify/ui-react'
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
    
  }
  
  render() {
    const { display_name, images } = this.props.user;
    const src = images[0] && images[0].url;

    return (
      <div style={styles.container}>
        <h1 style={styles.text}>Success, you're in</h1>
        <h1 style={styles.text}>{display_name}</h1>
        <img src={src} style={{borderRadius: '100%', border: '1px solid #dddddd'}} />
        <h3 style={styles.text}>friends: {this.props.user.followers.total}</h3>
      </div>
    )
  }
}

const styles = {
  container: { width: 400, margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 20 },
  text: { fontFamily: "sans-serif", fontWeight: "lighter"},
  input: { border: 'none', backgroundColor: '#ddd', marginBottom: 10, padding: 8, fontSize: 18 },
  todoName: { fontSize: 20, fontWeight: 'bold' },
  todoDescription: { marginBottom: 0 },
  button: { backgroundColor: '#1db954', color: 'white', outline: 'none', fontSize: 18, fontFamily: "sans-serif", fontWeight: "lighter", textDecoration: "none", padding: '0.85rem 0.65rem', borderRadius: '.52em' }
}

export default withAuthenticator(withSpotifyAuthenticator(App))