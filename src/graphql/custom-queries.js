export const usersByUpdateDate = `
    query UsersByUpdateDate {
        usersByUpdateDate(
        spotifyAuthorized: "true"
        sortDirection: ASC
        limit: 10
        ) {
        items {
            id
            musicTasteUpdatedAt
            refreshToken
        }
    }
  }
}`;
