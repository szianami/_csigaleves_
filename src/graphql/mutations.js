/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const createUser = /* GraphQL */ `
  mutation CreateUser(
    $input: CreateUserInput!
    $condition: ModelUserConditionInput
  ) {
    createUser(input: $input, condition: $condition) {
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
export const updateUser = /* GraphQL */ `
  mutation UpdateUser(
    $input: UpdateUserInput!
    $condition: ModelUserConditionInput
  ) {
    updateUser(input: $input, condition: $condition) {
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
export const deleteUser = /* GraphQL */ `
  mutation DeleteUser(
    $input: DeleteUserInput!
    $condition: ModelUserConditionInput
  ) {
    deleteUser(input: $input, condition: $condition) {
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
export const createMusicTaste = /* GraphQL */ `
  mutation CreateMusicTaste(
    $input: CreateMusicTasteInput!
    $condition: ModelMusicTasteConditionInput
  ) {
    createMusicTaste(input: $input, condition: $condition) {
      username
      spotifyUserID
      artist
      artistName
      createdAt
      updatedAt
    }
  }
`;
export const updateMusicTaste = /* GraphQL */ `
  mutation UpdateMusicTaste(
    $input: UpdateMusicTasteInput!
    $condition: ModelMusicTasteConditionInput
  ) {
    updateMusicTaste(input: $input, condition: $condition) {
      username
      spotifyUserID
      artist
      artistName
      createdAt
      updatedAt
    }
  }
`;
export const deleteMusicTaste = /* GraphQL */ `
  mutation DeleteMusicTaste(
    $input: DeleteMusicTasteInput!
    $condition: ModelMusicTasteConditionInput
  ) {
    deleteMusicTaste(input: $input, condition: $condition) {
      username
      spotifyUserID
      artist
      artistName
      createdAt
      updatedAt
    }
  }
`;
export const createMatch = /* GraphQL */ `
  mutation CreateMatch(
    $input: CreateMatchInput!
    $condition: ModelMatchConditionInput
  ) {
    createMatch(input: $input, condition: $condition) {
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
export const updateMatch = /* GraphQL */ `
  mutation UpdateMatch(
    $input: UpdateMatchInput!
    $condition: ModelMatchConditionInput
  ) {
    updateMatch(input: $input, condition: $condition) {
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
export const deleteMatch = /* GraphQL */ `
  mutation DeleteMatch(
    $input: DeleteMatchInput!
    $condition: ModelMatchConditionInput
  ) {
    deleteMatch(input: $input, condition: $condition) {
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
