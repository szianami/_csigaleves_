/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const getUser = /* GraphQL */ `
  query GetUser($id: ID!) {
    getUser(id: $id) {
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
export const listUsers = /* GraphQL */ `
  query ListUsers(
    $filter: ModelUserFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listUsers(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        username
        email
        refreshToken
        spotifyAuthorized
        musicTasteUpdatedAt
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;
export const getMusicTaste = /* GraphQL */ `
  query GetMusicTaste($username: String!, $artist: String!) {
    getMusicTaste(username: $username, artist: $artist) {
      id
      username
      artist
      updatedAt
      createdAt
    }
  }
`;
export const listMusicTastes = /* GraphQL */ `
  query ListMusicTastes(
    $username: String
    $artist: ModelStringKeyConditionInput
    $filter: ModelMusicTasteFilterInput
    $limit: Int
    $nextToken: String
    $sortDirection: ModelSortDirection
  ) {
    listMusicTastes(
      username: $username
      artist: $artist
      filter: $filter
      limit: $limit
      nextToken: $nextToken
      sortDirection: $sortDirection
    ) {
      items {
        id
        username
        artist
        updatedAt
        createdAt
      }
      nextToken
    }
  }
`;
export const getMatch = /* GraphQL */ `
  query GetMatch($id: ID!, $artist: String!) {
    getMatch(id: $id, artist: $artist) {
      id
      user1ID
      user2ID
      artist
      createdAt
      updatedAt
    }
  }
`;
export const listMatchs = /* GraphQL */ `
  query ListMatchs(
    $id: ID
    $artist: ModelStringKeyConditionInput
    $filter: ModelMatchFilterInput
    $limit: Int
    $nextToken: String
    $sortDirection: ModelSortDirection
  ) {
    listMatchs(
      id: $id
      artist: $artist
      filter: $filter
      limit: $limit
      nextToken: $nextToken
      sortDirection: $sortDirection
    ) {
      items {
        id
        user1ID
        user2ID
        artist
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;
export const usersByUpdateDate = /* GraphQL */ `
  query UsersByUpdateDate(
    $spotifyAuthorized: String
    $musicTasteUpdatedAt: ModelStringKeyConditionInput
    $sortDirection: ModelSortDirection
    $filter: ModelUserFilterInput
    $limit: Int
    $nextToken: String
  ) {
    usersByUpdateDate(
      spotifyAuthorized: $spotifyAuthorized
      musicTasteUpdatedAt: $musicTasteUpdatedAt
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        username
        email
        refreshToken
        spotifyAuthorized
        musicTasteUpdatedAt
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;
export const byArtist = /* GraphQL */ `
  query ByArtist(
    $artist: String
    $sortDirection: ModelSortDirection
    $filter: ModelMusicTasteFilterInput
    $limit: Int
    $nextToken: String
  ) {
    byArtist(
      artist: $artist
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        username
        artist
        updatedAt
        createdAt
      }
      nextToken
    }
  }
`;
export const byUser1 = /* GraphQL */ `
  query ByUser1(
    $user1ID: String
    $sortDirection: ModelSortDirection
    $filter: ModelMatchFilterInput
    $limit: Int
    $nextToken: String
  ) {
    byUser1(
      user1ID: $user1ID
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        user1ID
        user2ID
        artist
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;
export const byUser2 = /* GraphQL */ `
  query ByUser2(
    $user2ID: String
    $sortDirection: ModelSortDirection
    $filter: ModelMatchFilterInput
    $limit: Int
    $nextToken: String
  ) {
    byUser2(
      user2ID: $user2ID
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        user1ID
        user2ID
        artist
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;
