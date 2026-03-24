package dtos

import "time"

type MatchReadDTO struct {
	MatchID   uint   `json:"match_id"`
	StartedAt string `json:"started_at"`
	EndedAt   string `json:"ended_at"`
	LevelID   uint   `json:"level_id"`
	Players   int    `json:"players"`
}

type MatchCreateParticipationDTO struct {
	PlayerID      uint   `json:"player_id" binding:"required"`
	CharacterID   uint   `json:"character_id" binding:"required"`
	Result        string `json:"result" binding:"required,max=4"`
	NetworkStatus string `json:"network_status" binding:"required,max=12"`
}

type MatchCreateDTO struct {
	SessionID     string                      `json:"session_id" binding:"required,max=64"`
	StartedAt     string                      `json:"started_at" binding:"required"`
	EndedAt       string                      `json:"ended_at" binding:"required"`
	LevelID       uint                        `json:"level_id" binding:"required"`
	Participation MatchCreateParticipationDTO `json:"participation" binding:"required"`
}

func ParseMatchCreateTimes(dto MatchCreateDTO) (time.Time, time.Time, error) {
	startedAt, err := time.Parse(DateFormat, dto.StartedAt)
	if err != nil {
		return time.Time{}, time.Time{}, ErrDateFormatIncorrect
	}

	endedAt, err := time.Parse(DateFormat, dto.EndedAt)
	if err != nil {
		return time.Time{}, time.Time{}, ErrDateFormatIncorrect
	}

	return startedAt, endedAt, nil
}
