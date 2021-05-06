import React, { useEffect, useState } from "react";
import Amplify, { API, Storage } from "aws-amplify";
import { Auth } from "aws-amplify";
import SpotifyWebApi from 'spotify-web-api-js';
import { AmplifySignOut } from '@aws-amplify/ui-react'
import awsExports from "./aws-exports";
import * as mutations from "./graphql/mutations";
import * as queries from "./graphql/queries";
import config from "./config.json"
import spinner from './spinner.gif';
import smiley from './smiley.png';

Amplify.configure(awsExports);
const AWS = require("aws-sdk");
AWS.config.update({ region: "eu-central-1" });

const spotifyApi = new SpotifyWebApi();

function withSpotifyAuthenticator(WrappedComponent) {

  return class extends React.Component {
    
    constructor(props) {
      super(props);
      this.state = {
        authenticated: false,
        spinner: true,
      };
    }

    // componentDidUpdate(prevProps, prevState) {
    //   if (this.state.authenticated !== prevState.authenticated) {
    //   }
    // }

    async componentDidMount() {



      console.log("SpotifyAuth componentDidMount");
      let refreshToken = await this.getRefreshToken();
      
      if (refreshToken) {
        
        let accessToken = await this.getAccessToken(refreshToken);
        spotifyApi.setAccessToken(accessToken);

        try {
          const user = await this.fetchUserData();
          const artists = await this.fetchTopArtists();
          this.setState({authenticated: true, spinner: false, user, artists});
        } catch (err) {
          console.log(err);
        }
      } else {
        this.setState({spinner: false});
        if (window.location.search !== "") {
          // ha a querynk nem üres
          var urlParams = new URLSearchParams(window.location.search.slice(1));

          if (urlParams.get("code") !== null) {
            // 2nd stage of auth
            let code = urlParams.get("code");

            let body = new URLSearchParams();
            body.append("grant_type", "authorization_code");
            body.append("code", code);
            body.append("redirect_uri", "http://localhost:3000/callback/");
            body.append("client_id", config.clientId);
            body.append("client_secret", config.clientSecret);

            let requestOptions = {
              method: "POST",
              headers: { "Content-Type": "application/x-www-form-urlencoded" },
              body,
            };

            let res;
            try {
              res = await fetch("https://accounts.spotify.com/api/token", requestOptions);
            } catch (err) {
              console.log(err);
            }
            console.log(res);

            if (res.ok) {
              res = await res.json();
              console.log(res);
              console.log("refresh token: " + res.refresh_token);

              this.setState({accessToken: res.access_token})

              let user = await Auth.currentAuthenticatedUser();
              console.log("current user sub -- " + user.attributes.sub);

              try {
                let now = new Date().toISOString;
                let updateUser = await API.graphql({
                  query: mutations.updateUser,
                  variables: {
                    input: {
                      id: user.attributes.sub,
                      refreshToken: res.refresh_token,
                      spotifyAuthorized: 'true',
                      // musicTasteUpdatedAt: a tábla változása triggereli az updateMusicTaste lambdát
                    },
                  },
                });
                console.log(updateUser);
                
                spotifyApi.setAccessToken(res.access_token);
                try {
                  const user = await this.fetchUserData();
                  const artists = await this.fetchTopArtists();
                  this.setState({authenticated: true, spinner: false, user, artists});
                } catch (err) {
                  console.log(err);
                }

              } catch (err) {
                console.log({ err });
              }
            }
          }

          if (urlParams.get("error") !== null) {
            console.log("authorisation error - " + urlParams.get("error"));
          }
        }
      }
    }

    getRefreshToken = async () => {

      let user = await Auth.currentAuthenticatedUser();

      try {
        let userdata = await API.graphql({
          query: queries.getUser,
          variables: { id: user.attributes.sub },
        });
        
        return (userdata.data.getUser.refreshToken);
      
      } catch (err) {
        console.log({ err });
      }

    };

    getAccessToken = async (refreshToken) => {
      let body = new URLSearchParams();
      body.append("grant_type", "refresh_token");
      body.append("refresh_token", refreshToken);
      body.append("client_id", config.clientId);
      body.append("client_secret", config.clientSecret);

      let requestOptions = {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body,
      };

      let res;
      try {
        res = await fetch("https://accounts.spotify.com/api/token", requestOptions);
      } catch (err) {
        console.log(err);
      }

      if (res.ok) {
        res = await res.json();

        // if (res.refresh_token) {
        //   try {
        //     let updateUser = await API.graphql({
        //       query: mutations.updateUser,
        //       variables: {
        //         input: {
        //           id: user.attributes.sub,
        //           refreshToken: res.refresh_token,
        //         },
        //       },
        //     });
        //     console.log('refresh token updated');

        //   } catch (err) {
        //     console.log({ err });
        //   }
        // }
        console.log(res.access_token);
        return res.access_token;
        // TODO : expires in ... kezelése
      }
      console.log(res);
    }

    fetchUserData = async () => {
      const user = await spotifyApi.getMe();
      console.log('current user ', user);
      return user;

      // spotifyApi.getMe().then(
      //   (user) => {
      //     console.log('current user ', user);
      //     this.setState({user});
      //   },
      //   (err) => {
      //     console.error(err);
      //   }
      // )
    }

    fetchTopArtists = async () => {
      const artists = await spotifyApi.getMyTopArtists();
      console.log('artists ', artists);
      return artists;
    }

    render() {
      
      if (this.state.spinner) {
        return (
          <div style={{height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            <img
              src={spinner}
              style={{ margin: 'auto', display: 'block',  }}
              alt="Loading..."
            />
          </div>
        );
      }

      if (this.state.authenticated) {
        return <WrappedComponent user={this.state.user} artists={this.state.artists}/>;
      } else {
        var state = "staaate"; // generateRandomString(16);
        var scope = "user-read-private user-read-email user-top-read";

        var authorizeUrl = "https://accounts.spotify.com/authorize?";
        var params = new URLSearchParams();

        params.append("response_type", "code");
        params.append("client_id", config.clientId);
        params.append("redirect_uri", config.redirectUri);
        params.append("scope", scope);
        params.append("state", state);

        authorizeUrl = authorizeUrl + params.toString();

        return (
          <div style={styles.container}>
            <img src={smiley} style={styles.smiley_img} />
            <h1 style={styles.text}>YOU'RE ALMOST IN. SHOW ME YOUR MUSIC TASTE.</h1>
            <a href={authorizeUrl} style={styles.button}>
              Connect your spotify
            </a>
            <AmplifySignOut/>
          </div>
        );
      }
    }
  };
}

const styles = {
  container: {
    width: 400,
    margin: "0 auto",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  text: {
    "fontFamily": "Tenor Sans",
    "fontStyle": "normal",
    "fontWeight": "normal",
    "fontSize": "36px",
    "lineHeight": "40px",
    "display": "flex",
    "alignItems": "center",
    "textAlign": "center",
    "color": "#000000"
  }, 
  smiley_img: {
    "position": "absolute",
    "width": "279px",
    "height": "188px",
    "left": "541px",
    "top": "183px"
  }
};

export { withSpotifyAuthenticator };
