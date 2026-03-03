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
	baseRepoActions *repository.BaseRepositoryActions[models.Level]
}

func NewLevelsController(baseRepoActions *repository.BaseRepositoryActions[models.Level]) *LevelsController {
	return &LevelsController{baseRepoActions: baseRepoActions}
}

func (lc *LevelsController) Create(c *gin.Context) {
	var body dtos.LevelDTO
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, dtos.NewErrResp(err.Error(), c.Request.URL.Path))
		return
	}

	level := models.Level{
		Name:   body.Name,
		ImgUri: body.ImgUri,
	}

	if err := lc.baseRepoActions.Create(c.Request.Context(), &level); err != nil {
		if errors.Is(err, gorm.ErrDuplicatedKey) {
			c.JSON(http.StatusConflict, dtos.NewErrResp("Level already exists", c.Request.URL.Path))
			return
		}
		c.JSON(http.StatusInternalServerError, dtos.NewErrResp(err.Error(), c.Request.URL.Path))
		return
	}

	c.JSON(http.StatusCreated, level)
}

func (lc *LevelsController) ReadAll(c *gin.Context) {
	levels, err := lc.baseRepoActions.ReadAll(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, dtos.NewErrResp(err.Error(), c.Request.URL.Path))
		return
	}
	c.JSON(http.StatusOK, levels)
}

func (lc *LevelsController) ReadByID(c *gin.Context) {
	id, _ := c.Get("id")

	level, err := lc.baseRepoActions.ReadByID(c.Request.Context(), id.(uint))
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

	level := models.Level{
		Name:   body.Name,
		ImgUri: body.ImgUri,
	}

	if err := lc.baseRepoActions.Update(c.Request.Context(), level); err != nil {
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

	if err := lc.baseRepoActions.Delete(c.Request.Context(), id.(uint)); err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, dtos.NewErrResp("Level not found", c.Request.URL.Path))
			return
		}
		c.JSON(http.StatusInternalServerError, dtos.NewErrResp(err.Error(), c.Request.URL.Path))
		return
	}

	c.Status(http.StatusNoContent)
}
