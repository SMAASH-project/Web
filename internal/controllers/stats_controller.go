package controllers

import (
	"net/http"
	dtos "smaash-web/internal/DTOs"
	"smaash-web/internal/repository"
	"smaash-web/internal/utils"

	"github.com/gin-gonic/gin"
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
// Most played levels
func (sc StatsController) ReadMostPlayedLevels(c *gin.Context) {
	res, err := sc.statsRepo.ReadMostPlayedLevels(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, dtos.NewErrResp(err.Error(), c.Request.URL.Path))
		return
	}

	c.JSON(http.StatusOK, utils.Map(res, dtos.TopLevelsToDTO))
}

func (sc StatsController) MountRoutes(apiGroup *gin.RouterGroup) {
	stats := apiGroup.Group("/stats")
	stats.GET("top/items", sc.ReadMostPopularItems)
	stats.GET("top/players", sc.ReadMostActivePlayers)
	stats.GET("top/levels", sc.ReadMostPlayedLevels)
}
