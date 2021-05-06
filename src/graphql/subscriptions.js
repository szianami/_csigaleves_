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
      user2ID
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
      user2ID
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
      user2ID
      artist
      createdAt
      updatedAt
    }
  }
`;
