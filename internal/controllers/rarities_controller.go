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

// @description Creates a new rarity
// @tags rarities
// @accept json
// @produce json
// @param rarity_create_dto body dtos.RarityCreateDTO true "dto for creating a new rarity"
// @success 201 {object} dtos.RarityReadDTO "returns newly created rarity"
// @failure 401 {object} dtos.ErrResp "unauthorized"
// @failure 409 {object} dtos.ErrResp "unique key violation"
// @failure 422 {object} dtos.ErrResp "request body in wrong format"
// @failure 500 {object} dtos.ErrResp "internal server error"
// @router /rarities [post]
func (rc RaritiesController) Create(c *gin.Context) {
	path := c.Request.URL.Path

	var body dtos.RarityCreateDTO
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusUnprocessableEntity, dtos.NewErrResp(err.Error(), path))
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

// @description Reads all rarities
// @tags rarities
// @accept json
// @produce json
// @success 200 {array} dtos.RarityReadDTO "returns all rarities"
// @failure 401 {object} dtos.ErrResp "unauthorized"
// @failure 500 {object} dtos.ErrResp "internal server error"
// @router /rarities [get]
func (rc RaritiesController) ReadAll(c *gin.Context) {
	rarities, err := rc.raritiesBaseRepo.ReadAll(c)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dtos.NewErrResp(err.Error(), c.Request.URL.Path))
		return
	}

	c.JSON(http.StatusOK, utils.Map(rarities, dtos.RarityToDTO))
}

// @description Reads a rarity by it's id
// @tags rarities
// @accept json
// @produce json
// @param id path int true "the id of the desired rarity"
// @success 200 {object} dtos.RarityReadDTO "returns the desired rarity"
// @failure 401 {object} dtos.ErrResp "unauthorized"
// @failure 404 {object} dtos.ErrResp "record not found"
// @failure 500 {object} dtos.ErrResp "internal server error"
// @router /rarities/{id} [get]
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

// @description Updates the rarity with the given id
// @tags rarities
// @accept json
// @produce json
// @param rarity_update_dto body dtos.RarityUpdateDTO true "dto for updating a rarity"
// @param id path int true "id of desired rarity"
// @success 204 {} nil "doesn't return anything"
// @failure 400 {object} dtos.ErrResp "id from url and id from request body doesn't match"
// @failure 401 {object} dtos.ErrResp "unauthorized"
// @failure 404 {object} dtos.ErrResp "record not found"
// @failure 409 {object} dtos.ErrResp "unique key violation"
// @failure 422 {object} dtos.ErrResp "request body in wrong format"
// @failure 500 {object} dtos.ErrResp "internal server error"
// @router /rarities/{id} [put]
func (rc RaritiesController) Update(c *gin.Context) {
	path := c.Request.URL.Path
	id, _ := c.Get("id")

	var body dtos.RarityUpdateDTO
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusUnprocessableEntity, dtos.NewErrResp(err.Error(), path))
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

// @description Deletes a rarity with the given id
// @tags rarities
// @accept json
// @produce json
// @param id path int true "id of desired rarity"
// @success 204 {} nil "doesn't return anything"
// @failure 401 {object} dtos.ErrResp "unauthorized"
// @failure 404 {object} dtos.ErrResp "record not found"
// @failure 500 {object} dtos.ErrResp "internal server error"
// @router /rarities/{id} [delete]
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
	rarities.POST("", middlewares.Authorize(middlewares.ADMIN), rc.Create)
	rarities.GET("", middlewares.Authorize(middlewares.ANY), rc.ReadAll)
	rarities.GET("/:id", middlewares.Authorize(middlewares.ANY), middlewares.ValidateUrl, rc.ReadByID)
	rarities.PUT("/:id", middlewares.Authorize(middlewares.ADMIN), middlewares.ValidateUrl, rc.Update)
	rarities.DELETE("/:id", middlewares.Authorize(middlewares.ADMIN), middlewares.ValidateUrl, rc.Delete)
}
