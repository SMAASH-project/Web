package controllers

import (
	"errors"
	"net/http"
	dtos "smaash-web/internal/DTOs"
	"smaash-web/internal/middlewares"
	"smaash-web/internal/models"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

type MatchController struct {
	conn *gorm.DB
}

func NewMatchController(conn *gorm.DB) *MatchController {
	return &MatchController{conn: conn}
}

func (mc *MatchController) Create(c *gin.Context) {
	path := c.Request.URL.Path

	var body dtos.MatchCreateDTO
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, dtos.NewErrResp(err.Error(), path))
		return
	}

	startedAt, endedAt, err := dtos.ParseMatchCreateTimes(body)
	if errors.Is(err, dtos.ErrDateFormatIncorrect) {
		c.JSON(http.StatusUnprocessableEntity, dtos.NewErrResp(err.Error(), path))
		return
	}

	if endedAt.Before(startedAt) {
		c.JSON(http.StatusBadRequest, dtos.NewErrResp("ended_at cannot be earlier than started_at", path))
		return
	}

	var createdMatch models.Match

	err = mc.conn.Transaction(func(tx *gorm.DB) error {
		createdMatch = models.Match{
			SessionID: body.SessionID,
			StartedAt: startedAt,
			EndedAt:   endedAt,
			LevelID:   body.LevelID,
		}
		if err := tx.Where(models.Match{SessionID: body.SessionID}).Attrs(models.Match{StartedAt: startedAt, EndedAt: endedAt, LevelID: body.LevelID}).FirstOrCreate(&createdMatch).Error; err != nil {
			return err
		}

		if err := tx.Model(&models.Match{}).
			Where("id = ?", createdMatch.ID).
			Updates(map[string]any{"started_at": startedAt, "ended_at": endedAt, "level_id": body.LevelID}).Error; err != nil {
			return err
		}

		participation := body.Participation
		newParticipation := models.MatchParticipation{
			MatchID:         createdMatch.ID,
			PlayerProfileID: participation.PlayerID,
			CharacterID:     participation.CharacterID,
			Result:          participation.Result,
			NetworkStatus:   participation.NetworkStatus,
		}

		if err := tx.Clauses(clause.OnConflict{
			Columns: []clause.Column{{Name: "match_id"}, {Name: "player_profile_id"}},
			DoUpdates: clause.Assignments(map[string]any{
				"character_id":   newParticipation.CharacterID,
				"result":         newParticipation.Result,
				"network_status": newParticipation.NetworkStatus,
			}),
		}).Create(&newParticipation).Error; err != nil {
			return err
		}

		return nil
	})
	if err != nil {
		if errors.Is(err, gorm.ErrDuplicatedKey) {
			c.JSON(http.StatusConflict, dtos.NewErrResp(err.Error(), path))
			return
		}
		c.JSON(http.StatusInternalServerError, dtos.NewErrResp(err.Error(), path))
		return
	}

	c.JSON(http.StatusCreated, gin.H{"match_id": createdMatch.ID})
}

func (mc MatchController) MountRoutes(apiGroup *gin.RouterGroup) {
	matches := apiGroup.Group("/matches")
	matches.POST("", middlewares.Authorize(middlewares.ANY), mc.Create)
}
