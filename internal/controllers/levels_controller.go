package controllers

import (
	"errors"
	"net/http"
	dtos "smaash-web/internal/DTOs"
	"smaash-web/internal/middlewares"
	"smaash-web/internal/models"
	"smaash-web/internal/repository"
	"smaash-web/internal/utils"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type LevelsController struct {
	levelsBaseRepo repository.BaseRepository[models.Level]
}

func NewLevelsController(levelsBaseRepo repository.BaseRepository[models.Level]) *LevelsController {
	return &LevelsController{levelsBaseRepo: levelsBaseRepo}
}

func (lc *LevelsController) Create(c *gin.Context) {
	var body dtos.LevelCreateDTO
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, dtos.NewErrResp(err.Error(), c.Request.URL.Path))
		return
	}

	newLevel := dtos.CreateDTOToLevel(body)
	if err := lc.levelsBaseRepo.Create(c.Request.Context(), newLevel); err != nil {
		if errors.Is(err, gorm.ErrDuplicatedKey) {
			c.JSON(http.StatusConflict, dtos.NewErrResp("Level already exists", c.Request.URL.Path))
			return
		}
		c.JSON(http.StatusInternalServerError, dtos.NewErrResp(err.Error(), c.Request.URL.Path))
		return
	}

	c.JSON(http.StatusCreated, dtos.LevelToDTO(*newLevel))
}

func (lc *LevelsController) ReadAll(c *gin.Context) {
	levels, err := lc.levelsBaseRepo.ReadAll(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, dtos.NewErrResp(err.Error(), c.Request.URL.Path))
		return
	}
	c.JSON(http.StatusOK, utils.Map(levels, dtos.LevelToDTO))
}

func (lc *LevelsController) ReadByID(c *gin.Context) {
	id, _ := c.Get("id")

	level, err := lc.levelsBaseRepo.ReadByID(c.Request.Context(), id.(uint))
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, dtos.NewErrResp("Level not found", c.Request.URL.Path))
			return
		}
		c.JSON(http.StatusInternalServerError, dtos.NewErrResp(err.Error(), c.Request.URL.Path))
		return
	}
	c.JSON(http.StatusOK, dtos.LevelToDTO(level))
}

func (lc *LevelsController) Update(c *gin.Context) {
	id, _ := c.Get("id")

	var body dtos.LevelUpdateDTO
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, dtos.NewErrResp(err.Error(), c.Request.URL.Path))
		return
	}

	if id.(uint) != body.ID {
		c.JSON(http.StatusBadRequest, dtos.NewErrResp("ID in path and body do not match", c.Request.URL.Path))
		return
	}

	if err := lc.levelsBaseRepo.Update(c.Request.Context(), dtos.UpdateDTOToLevel(body)); err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, dtos.NewErrResp("Level not found", c.Request.URL.Path))
			return
		}
		if errors.Is(err, gorm.ErrDuplicatedKey) {
			c.JSON(http.StatusConflict, dtos.NewErrResp("Level already exists", c.Request.URL.Path))
			return
		}
		c.JSON(http.StatusInternalServerError, dtos.NewErrResp(err.Error(), c.Request.URL.Path))
		return
	}

	c.Status(http.StatusNoContent)
}

func (lc *LevelsController) Delete(c *gin.Context) {
	id, _ := c.Get("id")

	if err := lc.levelsBaseRepo.Delete(c.Request.Context(), id.(uint)); err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, dtos.NewErrResp("Level not found", c.Request.URL.Path))
			return
		}
		c.JSON(http.StatusInternalServerError, dtos.NewErrResp(err.Error(), c.Request.URL.Path))
		return
	}

	c.Status(http.StatusNoContent)
}

func (lc LevelsController) MountRoutes(apiGroup *gin.RouterGroup) {
	levels := apiGroup.Group("/levels")
	levels.Use(middlewares.Authorize)
	levels.POST("", lc.Create)
	levels.GET("", lc.ReadAll)
	levels.GET("/:id", middlewares.ValidateUrl, lc.ReadByID)
	levels.PUT("/:id", middlewares.ValidateUrl, lc.Update)
	levels.DELETE("/:id", middlewares.ValidateUrl, lc.Delete)
}
