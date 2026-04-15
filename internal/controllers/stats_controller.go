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

// @description Reads the most active players
// @tags stats
// @accept json
// @produce json
// @success 200 {array} dtos.TopPlayersDTO "returns players ordered by matches played"
// @failure 401 {object} dtos.ErrResp "unauthorized"
// @failure 500 {object} dtos.ErrResp "internal server error"
// @router /stats/top/players [get]
func (sc StatsController) ReadMostActivePlayers(c *gin.Context) {
	res, err := sc.statsRepo.ReadMostActivePlayers(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, dtos.NewErrResp(err.Error(), c.Request.URL.Path))
		return
	}

	c.JSON(http.StatusOK, utils.Map(res, dtos.TopPlayersToDTO))
}

// @description Reads the most popular items
// @tags stats
// @accept json
// @produce json
// @success 200 {array} dtos.TopCharactersDTO "returns items ordered by count of purchsases"
// @failure 401 {object} dtos.ErrResp "unauthorized"
// @failure 500 {object} dtos.ErrResp "internal server error"
// @router /stats/top/characters [get]
func (sc StatsController) ReadMostPopularCharacters(c *gin.Context) {
	res, err := sc.statsRepo.ReadMostPopularCharacters(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, dtos.NewErrResp(err.Error(), c.Request.URL.Path))
		return
	}

	c.JSON(http.StatusOK, utils.Map(res, dtos.TopCharactersToDTO))
}

// @description Reads the most popular items
// @tags stats
// @accept json
// @produce json
// @param id path int true "the id of the desired profile"
// @success 200 {array} dtos.FavouriteCharactersDTO "returns characyers ordered by matches played with said characyers by given profile"
// @failure 401 {object} dtos.ErrResp "unauthorized"
// @failure 500 {object} dtos.ErrResp "internal server error"
// @router /profiles/{id}/favourite [get]
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

// @description Reads the most played levels
// @tags stats
// @accept json
// @produce json
// @success 200 {array} dtos.TopLevelsDTO "returns levels ordered by count of matches played"
// @failure 401 {object} dtos.ErrResp "unauthorized"
// @failure 500 {object} dtos.ErrResp "internal server error"
// @router /stats/top/levels [get]
func (sc StatsController) ReadMostPlayedLevels(c *gin.Context) {
	res, err := sc.statsRepo.ReadMostPlayedLevels(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, dtos.NewErrResp(err.Error(), c.Request.URL.Path))
		return
	}

	c.JSON(http.StatusOK, utils.Map(res, dtos.TopLevelsToDTO))
}

// @description Reads profiles with most wins
// @tags stats
// @accept json
// @produce json
// @success 200 {array} dtos.BestPlayersDTO "returns profiles ordered by count of wins"
// @failure 401 {object} dtos.ErrResp "unauthorized"
// @failure 500 {object} dtos.ErrResp "internal server error"
// @router /stats/leaderboard [get]
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
	stats.GET("top/items", sc.ReadMostPopularCharacters)
	stats.GET("top/players", sc.ReadMostActivePlayers)
	stats.GET("top/levels", sc.ReadMostPlayedLevels)
	stats.GET("profiles/:id/favourite", sc.ReadFavouriteCharactersOfPlayer)
	stats.GET("leaderboard", sc.ReadPlayersWithMostWins)
}
