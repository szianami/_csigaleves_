import React from 'react'
import './index.css';

import SpotifyPlayer from 'react-spotify-player';
import { API } from 'aws-amplify';

import * as queries from './graphql/queries';

import noimage from './etc/howtodisappear.jpg';
import spinner from './spinner.gif';

class Mate extends React.Component {
	constructor(props){
		super(props);
		this.state = {
			showMoreArtists: false,
		}
	}
	
	async componentDidMount() {
		try {
			const userData = await this.getUserData(this.props.match.params.id);
			this.setState({ userData });
		} catch (err) {
			console.log(err);
		}
		try {
			const friendUser = await this.getUserBySPotifyID(this.props.match.params.id);
			this.setState({ friendUser });
		} catch (err) { console.log(err) }

		try {
			const artists = await this.getMatchingArtists();
			this.setState({ artists });
			console.log(artists);
		} catch (err) { console.log(err) }

		try {
			const tracks = await this.getTopTracks(this.props.match.params.id);
			this.setState({ tracks });
			console.log('itt van igy nez ki', tracks);
		} catch (err) { console.log(err) }
		
	}

	getUserData = async (userID) => {
		const { spotifyApi } = this.props;
		console.log(spotifyApi);
		const res = await spotifyApi.getUser(userID);
		if (res) {
			return res;
		} else return null;
		
	}

	getUserBySPotifyID = async (userID) => { 
		const { data } = await API.graphql({
			query: queries.userBySpotifyUserID,
			variables: { spotifyUserID: userID},
		});
		return data.userBySpotifyUserID.items[0];
	}

	getMatchingArtists = async () => {
		let id = {};
		if (this.props.currentUser.username < this.state.friendUser) {
			id = this.props.currentUser.username + this.state.friendUser.username;
		} else {
			id = this.state.friendUser.username + this.props.currentUser.username;
		}
		const data = await API.graphql({
			query: queries.listMatchs,
			variables: { id: id }
		});
		console.log(data);
		const artistsToQuery = data.data.listMatchs.items.map(({ artist }) => ( artist ));

		const { spotifyApi } = this.props;

		const artists = [];
		while (artistsToQuery.length > 0){
			console.log('artistsToQuery.length  ',artistsToQuery.length );
			const batchArtists = artistsToQuery.splice(0, 50);
			const data = await spotifyApi.getArtists(batchArtists);
			artists.push(...data.artists);
		}
		return artists;
	}

	giveMoreArtists() {
		this.setState({showMoreArtists: true})
	}

	getTopTracks = async (userID) => {
		console.log('userid - ',userID);
		const { data } = await API.graphql({
			query: queries.tracksBySpotifyUserID,
			variables: { spotifyUserID: userID},
		});
		console.log(data);
		return data.tracksBySpotifyUserID.items;
	}

	render() {
		const { userData, artists, tracks } = this.state || {};
		const numberOfItems = this.state.showMoreArtists ? artists.length : 3

		const size = {
			width: '500px',
			height: '100px'
		}
		const view = 'coverart'; // or 'coverart'
		const theme = 'black'; // or 'white'

		if (!userData || !artists) return null;
		return (
			<div>
				<div className="container">
					<div className="user-container">
						<div className="profile-holder">
							<img src={userData.images[0].url} className="profile-img"/>
						</div>
						<div className="text uppercase">
								{userData.display_name}
								{this.props.userMatches}
						</div>
					</div>

					<div className="friends-container">
						<div className="text uppercase">
							you both listen to
						</div>

						<div className="artist-flex-container">
							{artists ? artists.slice(0, numberOfItems).map(({ name, images }) => (
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
						{(artists.length > 3) && 
							<div style={{height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
								{this.state.showMoreArtists ? '' :
									<div className="button" onClick={()=> this.giveMoreArtists()}> . . . </div>
								}
							</div>
						} 

						<div className="text uppercase">
								recent top tracks
						</div>
						<div className="track-flex-container">
								{tracks ? tracks.map(({ track }) => (
								<div className="track-flex-item">
									<SpotifyPlayer
									uri={'spotify:track:'+track}
									size={size}
									view={view}
									theme={theme}
									/>
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
						
					</div>
				</div>
				{/*<pre>
					{JSON.stringify(this.props, null, 2)}
				</pre> 
				*/}
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

export default Mate;