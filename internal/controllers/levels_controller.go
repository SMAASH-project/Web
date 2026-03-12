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

// @description Creates a new level
// @tags levels
// @accept json
// @produce json
// @param level_create_dto body dtos.LevelCreateDTO true "dto for creating a new level"
// @success 201 {object} dtos.LevelReadDTO "returns newly created level"
// @failure 400 {object} dtos.ErrResp "request body in wrong format"
// @failure 401 {object} dtos.ErrResp "unauthorized"
// @failure 409 {object} dtos.ErrResp "unique key violation"
// @failure 500 {object} dtos.ErrResp "internal server error"
// @router /levels [post]
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

// @description Reads all levels
// @tags levels
// @accept json
// @produce json
// @success 200 {array} dtos.LevelReadDTO "returns all levels"
// @failure 401 {object} dtos.ErrResp "unauthorized"
// @failure 500 {object} dtos.ErrResp "internal server error"
// @router /levels [get]
func (lc *LevelsController) ReadAll(c *gin.Context) {
	levels, err := lc.levelsBaseRepo.ReadAll(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, dtos.NewErrResp(err.Error(), c.Request.URL.Path))
		return
	}
	c.JSON(http.StatusOK, utils.Map(levels, dtos.LevelToDTO))
}

// @description Reads a level by it's id
// @tags levels
// @accept json
// @produce json
// @param id path int true "the id of the desired level"
// @success 200 {object} dtos.LevelReadDTO "returns the desired level"
// @failure 401 {object} dtos.ErrResp "unauthorized"
// @failure 404 {object} dtos.ErrResp "record not found"
// @failure 500 {object} dtos.ErrResp "internal server error"
// @router /levels/{id} [get]
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

// @description Updates the level with the given id
// @tags levels
// @accept json
// @produce json
// @param level_update_dto body dtos.LevelUpdateDTO true "dto for updating a level"
// @param id path int true "id of desired level"
// @success 204 {} nil "doesn't return anything"
// @failure 400 {object} dtos.ErrResp "request body in wrong format"
// @failure 400 {object} dtos.ErrResp "id from url and id from request body doesn't match"
// @failure 401 {object} dtos.ErrResp "unauthorized"
// @failure 404 {object} dtos.ErrResp "record not found"
// @failure 409 {object} dtos.ErrResp "unique key violation"
// @failure 500 {object} dtos.ErrResp "internal server error"
// @router /levels/{id} [put]
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

// @description Deletes a level with the given id
// @tags levels
// @accept json
// @produce json
// @param id path int true "id of desired level"
// @success 204 {} nil "doesn't return anything"
// @failure 401 {object} dtos.ErrResp "unauthorized"
// @failure 404 {object} dtos.ErrResp "record not found"
// @failure 500 {object} dtos.ErrResp "internal server error"
// @router /levels/{id} [delete]
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
