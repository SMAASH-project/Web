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

type PlayerProfileController struct {
	profilesBaseRepo repository.BaseRepository[models.PlayerProfile]
}

func NewPlayerProfileController(profilesBaseRepo repository.BaseRepository[models.PlayerProfile]) *PlayerProfileController {
	return &PlayerProfileController{profilesBaseRepo: profilesBaseRepo}
}

// @description Reads all profile
// @tags profiles
// @accept json
// @produce json
// @success 200 {array} dtos.PlayerProfileReadDTO "returns all profiles"
// @failure 401 {object} dtos.ErrResp "unauthorized"
// @failure 500 {object} dtos.ErrResp "internal server error"
// @router /profiles [get]
func (pc PlayerProfileController) ReadAll(c *gin.Context) {
	profiles, err := pc.profilesBaseRepo.ReadAll(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, dtos.NewErrResp(err.Error(), c.Request.URL.Path))
		return
	}

	c.JSON(http.StatusOK, utils.Map(profiles, dtos.PlayerProfileToReadDTO))
}

// @description Reads a user by it's id
// @tags profiles
// @accept json
// @produce json
// @param id path int true "the id of the desired profile"
// @success 200 {object} dtos.PlayerProfileReadDTO "returns the desired profile"
// @failure 401 {object} dtos.ErrResp "unauthorized"
// @failure 404 {object} dtos.ErrResp "record not found"
// @failure 500 {object} dtos.ErrResp "internal server error"
// @router /profiles/{id} [get]
func (pc PlayerProfileController) ReadByID(c *gin.Context) {
	id, _ := c.Get("id")
	path := c.Request.URL.Path
	profile, err := pc.profilesBaseRepo.ReadByID(c, id.(uint))
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, dtos.NewErrResp(err.Error(), path))
			return
		}
		c.JSON(http.StatusInternalServerError, dtos.NewErrResp(err.Error(), path))
		return
	}

	c.JSON(http.StatusOK, dtos.PlayerProfileToReadDTO(profile))
}

// @description Creates a new profile
// @tags profiles
// @accept json
// @produce json
// @param profile_create_dto body dtos.PlayerProfileCreateDTO true "dto for creating a new profile"
// @success 201 {object} dtos.PlayerProfileReadDTO "returns newly created profile"
// @failure 400 {object} dtos.ErrResp "request body in wrong format"
// @failure 401 {object} dtos.ErrResp "unauthorized"
// @failure 409 {object} dtos.ErrResp "unique key violation"
// @failure 500 {object} dtos.ErrResp "internal server error"
// @router /profiles [post]
func (pc PlayerProfileController) Create(c *gin.Context) {
	path := c.Request.URL.Path
	var body dtos.PlayerProfileCreateDTO
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, dtos.NewErrResp(err.Error(), path))
	}

	newProfile := dtos.CreateDTOToPlayerProfile(body)
	if err := pc.profilesBaseRepo.Create(c, &newProfile); err != nil {
		if errors.Is(err, gorm.ErrDuplicatedKey) {
			c.JSON(http.StatusConflict, dtos.NewErrResp("Display name already taken", path))
			return
		}
		c.JSON(http.StatusInternalServerError, dtos.NewErrResp(err.Error(), path))
		return
	}

	c.JSON(http.StatusCreated, newProfile)
}

// @description Updates the profile with the given id
// @tags profiles
// @accept json
// @produce json
// @param profile_update_dto body dtos.PlayerProfileUpdateDTO true "dto for updating a profile"
// @param id path int true "id of desired profile"
// @success 204 {} nil "doesn't return anything"
// @failure 400 {object} dtos.ErrResp "request body in wrong format"
// @failure 400 {object} dtos.ErrResp "id from url and id from request body doesn't match"
// @failure 401 {object} dtos.ErrResp "unauthorized"
// @failure 404 {object} dtos.ErrResp "record not found"
// @failure 409 {object} dtos.ErrResp "unique key violation"
// @failure 500 {object} dtos.ErrResp "internal server error"
// @router /profiles/{id} [put]
func (pc PlayerProfileController) Update(c *gin.Context) {
	path := c.Request.URL.Path
	id, _ := c.Get("id")

	var body dtos.PlayerProfileUpdateDTO
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, dtos.NewErrResp(err.Error(), path))
		return
	}

	if body.ID != id.(uint) {
		c.JSON(http.StatusBadRequest, dtos.NewErrResp("ID from URL doesn't match ID from request body", path))
		return
	}

	if err := pc.profilesBaseRepo.Update(c.Request.Context(), dtos.UpdateDTOToPlayerProfile(body)); err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, dtos.NewErrResp("Record not found", path))
			return
		}
		if errors.Is(err, gorm.ErrDuplicatedKey) {
			c.JSON(http.StatusConflict, dtos.NewErrResp("Display name already taken", path))
			return
		}
		c.JSON(http.StatusInternalServerError, dtos.NewErrResp(err.Error(), path))
		return
	}

	c.Status(http.StatusNoContent)
}

// @description Deletes a profile with the given id
// @tags profiles
// @accept json
// @produce json
// @param id path int true "id of desired profile"
// @success 204 {} nil "doesn't return anything"
// @failure 401 {object} dtos.ErrResp "unauthorized"
// @failure 404 {object} dtos.ErrResp "record not found"
// @failure 500 {object} dtos.ErrResp "internal server error"
// @router /profiles/{id} [delete]
func (pc PlayerProfileController) Delete(c *gin.Context) {
	id, _ := c.Get("id")
	path := c.Request.URL.Path

	if err := pc.profilesBaseRepo.Delete(c.Request.Context(), id.(uint)); err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, dtos.NewErrResp("Record not found", path))
			return
		}
		c.JSON(http.StatusInternalServerError, dtos.NewErrResp(err.Error(), path))
		return
	}

	c.Status(http.StatusNoContent)
}

func (pc PlayerProfileController) MountRoutes(apiGroup *gin.RouterGroup) {
	profiles := apiGroup.Group("/profiles")
	profiles.Use(middlewares.Authorize)
	profiles.GET("", pc.ReadAll)
	profiles.GET("/:id", middlewares.ValidateUrl, pc.ReadByID)
	profiles.POST("", pc.Create)
	profiles.PUT("/:id", middlewares.ValidateUrl, pc.Update)
	profiles.DELETE("/:id", middlewares.ValidateUrl, pc.Delete)
}
