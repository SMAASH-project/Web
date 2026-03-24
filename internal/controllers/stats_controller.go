package controllers

import (
	"errors"
	"net/http"
	dtos "smaash-web/internal/DTOs"
	"smaash-web/internal/repository"
	"smaash-web/internal/utils"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type StatsController struct {
	statsRepo repository.StatsRepository
}

func NewStatsController(statsRepo repository.StatsRepository) *StatsController {
	return &StatsController{statsRepo: statsRepo}
}

// Most active players
func (sc StatsController) ReadMostActivePlayers(c *gin.Context) {
	res, err := sc.statsRepo.ReadMostActivePlayers(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, dtos.NewErrResp(err.Error(), c.Request.URL.Path))
		return
	}

	c.JSON(http.StatusOK, utils.Map(res, dtos.TopPlayersToDTO))
}

// Most popular Items in store
func (sc StatsController) ReadMostPopularItems(c *gin.Context) {
	res, err := sc.statsRepo.ReadMostPopularItems(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, dtos.NewErrResp(err.Error(), c.Request.URL.Path))
		return
	}

	c.JSON(http.StatusOK, utils.Map(res, dtos.TopItemsToDTO))
}

// Players favourite characters
func (sc StatsController) ReadFavouriteCharactersOfPlayer(c *gin.Context) {
	path := c.Request.URL.Path
	id, _ := c.Get("id")
	res, err := sc.statsRepo.ReadFavouriteCharactersOfPlayer(c.Request.Context(), id.(uint))
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, dtos.NewErrResp("Player with given id not found", path))
			return
		}
		c.JSON(http.StatusInternalServerError, dtos.NewErrResp(err.Error(), path))
		return
	}

	c.JSON(http.StatusOK, utils.Map(res, dtos.FavouriteCharacterToDTO))
}

// Most played levels
func (sc StatsController) ReadMostPlayedLevels(c *gin.Context) {
	res, err := sc.statsRepo.ReadMostPlayedLevels(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, dtos.NewErrResp(err.Error(), c.Request.URL.Path))
		return
	}

	c.JSON(http.StatusOK, utils.Map(res, dtos.TopLevelsToDTO))
}

func (sc StatsController) ReadPlayersWithMostWins(c *gin.Context) {
	res, err := sc.statsRepo.ReadPlayersWithMostWins(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, dtos.NewErrResp(err.Error(), c.Request.URL.Path))
		return
	}

	c.JSON(http.StatusOK, utils.Map(res, dtos.BestPlayersToDTO))
}

func (sc StatsController) MountRoutes(apiGroup *gin.RouterGroup) {
	stats := apiGroup.Group("/stats")
	stats.GET("top/items", sc.ReadMostPopularItems)
	stats.GET("top/players", sc.ReadMostActivePlayers)
	stats.GET("top/levels", sc.ReadMostPlayedLevels)
	stats.GET("profiles/:id/favourite", sc.ReadFavouriteCharactersOfPlayer)
	stats.GET("leaderboard", sc.ReadPlayersWithMostWins)
}
