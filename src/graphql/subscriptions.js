/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const onCreateUser = /* GraphQL */ `
  subscription OnCreateUser {
    onCreateUser {
      id
      username
      email
      refreshToken
      spotifyAuthorized
      spotifyUserID
      musicTasteUpdatedAt
      createdAt
      updatedAt
    }
  }
`;
export const onUpdateUser = /* GraphQL */ `
  subscription OnUpdateUser {
    onUpdateUser {
      id
      username
      email
      refreshToken
      spotifyAuthorized
      spotifyUserID
      musicTasteUpdatedAt
      createdAt
      updatedAt
    }
  }
`;
export const onDeleteUser = /* GraphQL */ `
  subscription OnDeleteUser {
    onDeleteUser {
      id
      username
      email
      refreshToken
      spotifyAuthorized
      spotifyUserID
      musicTasteUpdatedAt
      createdAt
      updatedAt
    }
  }
`;
export const onCreateMusicTaste = /* GraphQL */ `
  subscription OnCreateMusicTaste {
    onCreateMusicTaste {
      username
      spotifyUserID
      artist
      artistName
      createdAt
      updatedAt
    }
  }
`;
export const onUpdateMusicTaste = /* GraphQL */ `
  subscription OnUpdateMusicTaste {
    onUpdateMusicTaste {
      username
      spotifyUserID
      artist
      artistName
      createdAt
      updatedAt
    }
  }
`;
export const onDeleteMusicTaste = /* GraphQL */ `
  subscription OnDeleteMusicTaste {
    onDeleteMusicTaste {
      username
      spotifyUserID
      artist
      artistName
      createdAt
      updatedAt
    }
  }
`;
export const onCreateMatch = /* GraphQL */ `
  subscription OnCreateMatch {
    onCreateMatch {
      id
      user1ID
      user1SpotifyID
      user2ID
      user2SpotifyID
      artist
      createdAt
      updatedAt
    }
  }
`;
export const onUpdateMatch = /* GraphQL */ `
  subscription OnUpdateMatch {
    onUpdateMatch {
      id
      user1ID
      user1SpotifyID
      user2ID
      user2SpotifyID
      artist
      createdAt
      updatedAt
    }
  }
`;
export const onDeleteMatch = /* GraphQL */ `
  subscription OnDeleteMatch {
    onDeleteMatch {
      id
      user1ID
      user1SpotifyID
      user2ID
      user2SpotifyID
      artist
      createdAt
      updatedAt
    }
  }
`;
export const onCreateUserTopTracks = /* GraphQL */ `
  subscription OnCreateUserTopTracks {
    onCreateUserTopTracks {
      username
      spotifyUserID
      track
      createdAt
      updatedAt
    }
  }
`;
export const onUpdateUserTopTracks = /* GraphQL */ `
  subscription OnUpdateUserTopTracks {
    onUpdateUserTopTracks {
      username
      spotifyUserID
      track
      createdAt
      updatedAt
    }
  }
`;
export const onDeleteUserTopTracks = /* GraphQL */ `
  subscription OnDeleteUserTopTracks {
    onDeleteUserTopTracks {
      username
      spotifyUserID
      track
      createdAt
      updatedAt
    }
  }
`;
