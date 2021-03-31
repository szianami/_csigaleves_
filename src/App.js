/* src/App.js */
import React, { useEffect, useState } from 'react'
import Amplify, { API, graphqlOperation } from 'aws-amplify'
import {Auth} from 'aws-amplify';

import { withAuthenticator } from '@aws-amplify/ui-react'
import awsExports from "./aws-exports";
import * as mutations from './graphql/mutations';
import * as queries from './graphql/queries';
import userEvent from '@testing-library/user-event';

Amplify.configure(awsExports);
const AWS = require("aws-sdk");
AWS.config.update({region: "eu-central-1" });

const initialState = { name: '', description: '' }

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
      counter: 0,
      page: 'main',
    };
  }

  async componentDidMount() {
    console.log('componentDidMount')
    if (window.location.search !== "") {  // ha a querynk nem üres
      // console.log('query: ' + window.location.search);
      var urlParams = new URLSearchParams(window.location.search.slice(1));

      if (urlParams.get('error') !== null) {
        console.log('authorisation error - ' + urlParams.get('error'));
      }
      if (urlParams.get('code') !== null) { 
          // 2nd stage of auth - 
          var code = urlParams.get('code')

          const body = new URLSearchParams();
          body.append('grant_type', 'authorization_code');
          body.append('code', code);
          body.append('redirect_uri', 'http://localhost:3000/callback/');
          body.append('client_id', '112749c7d49944b2b2333eb3b8ebc3df');
          body.append('client_secret', '4825b1d514e144feb6a2630857507e00');

          const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body,
          };

          let res;
          try {
            res = await fetch('https://accounts.spotify.com/api/token', requestOptions);
          } catch (err) {
            console.log(err);
          }
          console.log(res);
          if (res.ok) {
            res = await res.json();
            console.log(res);
            // console.log('-----' + res.access_token);
            console.log('refresh token: ' + res.refresh_token);
            let user = await Auth.currentAuthenticatedUser();  
            console.log('current user sub -- ' + user.attributes.sub)

            try {
              let listUsers = await API.graphql({ query: queries.listUsers });
              console.log(listUsers)
              // const newTodo = await API.graphql(graphqlOperation(queries.getUser, {input: {
              //   id: user.attributes.sub,
              //   username: 'asd' 
              //   //refreshToken: res.refresh_token
              // }})); // equivalent to above example
              
            } catch (err) {
              console.log( { err } );
            }
            
            try {
              let updateUser = await API.graphql({
                query: mutations.updateUser,
                variables: {
                  input: {
                    id: user.attributes.sub,
                    refreshToken: res.refresh_token
                  },
                }
              })
              console.log(updateUser);
            } catch (err) {
              console.log({ err });
            }
          }
      }
    }
  }
  
  asd2() {
    //
    console.log('asd2');
  }



  asd = () => {
    //
    this.asd2();
    this.setState({counter: this.state.counter + 1});
  };

  submit = async () => {
    try {
      await API.graphql({
        query: mutations.updateUser,
        variables: {
          input: {
            id: '',
            requestToken: ''
          }
        }
      })
      console.log('New contact created!');
    } catch (err) {
      console.log({ err });
    }
  }
  
  render() {

    console.log('render');
    var client_id = '112749c7d49944b2b2333eb3b8ebc3df'; 
    var client_secret = '4825b1d514e144feb6a2630857507e00'; 
    var redirect_uri = ''; 

    var state = 'staaate'; // generateRandomString(16);
    var scope = 'user-read-private user-read-email';

    var spotiurl = 'https://accounts.spotify.com/authorize?';
    var params = new URLSearchParams();

    params.append('response_type', 'code');
    params.append('client_id', client_id);
    params.append('redirect_uri', 'http://localhost:3000/callback/');
    params.append('scope', scope);
    params.append('state', state);

    spotiurl = spotiurl + params.toString();
    // console.log('spotiurl:' + spotiurl);

    return (
      <div style={styles.container}>
        <h1 style={styles.text}>Spotify Auth</h1>
        <h2 style={styles.text}>Sign in to get started</h2>
        <a href={spotiurl} style={styles.button }>Continue with Spotify</a>
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

export default withAuthenticator(App)