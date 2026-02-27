package controllers

import (
	"errors"
	"net/http"
	dtos "smaash-web/internal/DTOs"
	"smaash-web/internal/models"
	"smaash-web/internal/repository"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type LevelsController struct {
	levelRepo repository.LevelRepository
}

func NewLevelsController(levelRepo repository.LevelRepository) *LevelsController {
	return &LevelsController{levelRepo: levelRepo}
}

func (lc *LevelsController) CreateLevel(c *gin.Context) {
	var body dtos.LevelDTO
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, dtos.NewErrResp(err.Error(), c.Request.URL.Path))
		return
	}

	level := models.Level{
		Name:   body.Name,
		ImgUri: body.ImgUri,
	}

	if err := lc.levelRepo.Create(c.Request.Context(), &level); err != nil {
		if errors.Is(err, gorm.ErrDuplicatedKey) {
			c.JSON(http.StatusConflict, dtos.NewErrResp("Level already exists", c.Request.URL.Path))
			return
		}
		c.JSON(http.StatusInternalServerError, dtos.NewErrResp(err.Error(), c.Request.URL.Path))
		return
	}

	c.JSON(http.StatusCreated, level)
}

func (lc *LevelsController) ReadAllLevels(c *gin.Context) {
	levels, err := lc.levelRepo.ReadAll(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, dtos.NewErrResp(err.Error(), c.Request.URL.Path))
		return
	}
	c.JSON(http.StatusOK, levels)
}

func (lc *LevelsController) ReadLevelByID(c *gin.Context) {
	id, _ := c.Get("id")

	level, err := lc.levelRepo.ReadByID(c.Request.Context(), id.(uint))
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, dtos.NewErrResp("Level not found", c.Request.URL.Path))
			return
		}
		c.JSON(http.StatusInternalServerError, dtos.NewErrResp(err.Error(), c.Request.URL.Path))
		return
	}
	c.JSON(http.StatusOK, level)
}

func (lc *LevelsController) UpdateLevel(c *gin.Context) {
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

	level := models.Level{
		Name:   body.Name,
		ImgUri: body.ImgUri,
	}

	if err := lc.levelRepo.Update(c.Request.Context(), &level); err != nil {
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

func (lc *LevelsController) DeleteLevel(c *gin.Context) {
	id, _ := c.Get("id")

	if err := lc.levelRepo.Delete(c.Request.Context(), id.(uint)); err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, dtos.NewErrResp("Level not found", c.Request.URL.Path))
			return
		}
		c.JSON(http.StatusInternalServerError, dtos.NewErrResp(err.Error(), c.Request.URL.Path))
		return
	}

	c.Status(http.StatusNoContent)
}
