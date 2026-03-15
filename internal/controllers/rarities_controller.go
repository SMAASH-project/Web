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

type RaritiesController struct {
	raritiesBaseRepo repository.BaseRepository[models.Rarity]
}

func NewRaritiesController(raritiesBaseRepo repository.BaseRepository[models.Rarity]) *RaritiesController {
	return &RaritiesController{raritiesBaseRepo: raritiesBaseRepo}
}

func (rc RaritiesController) Create(c *gin.Context) {
	path := c.Request.URL.Path

	var body dtos.RarityCreateDTO
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, dtos.NewErrResp(err.Error(), path))
		return
	}

	newRarity := dtos.CreateDTOToRarity(body)
	if err := rc.raritiesBaseRepo.Create(c.Request.Context(), newRarity); err != nil {
		if errors.Is(err, gorm.ErrDuplicatedKey) {
			c.JSON(http.StatusConflict, dtos.NewErrResp("Rarity with given id already exists", path))
			return
		}
		c.JSON(http.StatusInternalServerError, dtos.NewErrResp(err.Error(), path))
		return
	}

	c.JSON(http.StatusCreated, dtos.RarityToDTO(*newRarity))
}

func (rc RaritiesController) ReadAll(c *gin.Context) {
	rarities, err := rc.raritiesBaseRepo.ReadAll(c)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dtos.NewErrResp(err.Error(), c.Request.URL.Path))
		return
	}

	c.JSON(http.StatusOK, utils.Map(rarities, dtos.RarityToDTO))
}

func (rc RaritiesController) ReadByID(c *gin.Context) {
	path := c.Request.URL.Path
	id, _ := c.Get("id")

	rarity, err := rc.raritiesBaseRepo.ReadByID(c.Request.Context(), id.(uint))
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, dtos.NewErrResp("Rarity with given id not found", path))
			return
		}
		c.JSON(http.StatusInternalServerError, dtos.NewErrResp(err.Error(), path))
		return
	}

	c.JSON(http.StatusOK, dtos.RarityToDTO(rarity))
}

func (rc RaritiesController) Update(c *gin.Context) {
	path := c.Request.URL.Path
	id, _ := c.Get("id")

	var body dtos.RarityUpdateDTO
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, dtos.NewErrResp(err.Error(), path))
		return
	}

	if id.(uint) != body.ID {
		c.JSON(http.StatusBadRequest, dtos.NewErrResp("Id from url doesn't match id from request body", path))
		return
	}

	if err := rc.raritiesBaseRepo.Update(c.Request.Context(), dtos.UpdateDTOToRarity(body)); err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, dtos.NewErrResp("Rarity with given id not found", path))
			return
		}
		if errors.Is(err, gorm.ErrDuplicatedKey) {
			c.JSON(http.StatusConflict, dtos.NewErrResp("Rarity with given name already exists", path))
			return
		}
		c.JSON(http.StatusInternalServerError, dtos.NewErrResp(err.Error(), path))
		return
	}

	c.Status(http.StatusNoContent)
}

func (rc RaritiesController) Delete(c *gin.Context) {
	path := c.Request.URL.Path
	id, _ := c.Get("id")

	if err := rc.raritiesBaseRepo.Delete(c.Request.Context(), id.(uint)); err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, dtos.NewErrResp("Rarity with given id not found", path))
			return
		}
		c.JSON(http.StatusInternalServerError, dtos.NewErrResp(err.Error(), path))
		return
	}

	c.Status(http.StatusNoContent)
}

func (rc RaritiesController) MountRoutes(apiGroup *gin.RouterGroup) {
	rarities := apiGroup.Group("/rarities")
	rarities.Use(middlewares.Authorize)
	rarities.POST("", rc.Create)
	rarities.GET("", rc.ReadAll)
	rarities.GET("/:id", middlewares.ValidateUrl, rc.ReadByID)
	rarities.PUT("/:id", middlewares.ValidateUrl, rc.Update)
	rarities.DELETE("/:id", middlewares.ValidateUrl, rc.Delete)
}
