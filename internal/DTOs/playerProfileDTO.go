package dtos

import (
	"smaash-web/internal/models"
)

type PlayerProfileDTO struct {
	ID          uint   `json:"id"`
	DisplayName string `json:"display_name"`
	UserID      uint   `json:"user_id"`
	Coins       int64  `json:"coins"`
	LastLogin   string `json:"last_login"`
	PfpUri      string `json:"pfp_uri"`
}

func PlayerProfileToDTO(profile models.PlayerProfile) PlayerProfileDTO {
	return PlayerProfileDTO{
		ID:          profile.ID,
		DisplayName: profile.DisplayName,
		UserID:      profile.UserID,
		Coins:       profile.Coins,
		LastLogin:   profile.LastLogin.Format("2006-01-02 15:04:05"),
		PfpUri:      profile.PfpUri,
	}
}
