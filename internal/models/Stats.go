package models

type TopItemsResult struct {
	Item
	CountOfPurchases uint
}

type TopPlayersResult struct {
	PlayerProfile
	CountOfMatches uint
}

type FavouriteCharacterResult struct {
	Character
	CountOfPlays uint
}

type TopLevelsResult struct {
	Level
	CountOfPlays uint
}

type BestPlayersResult struct {
	PlayerProfile
	CountOfWins uint
}

type ItemsWithOwned struct {
	Item
	Owned bool
}
