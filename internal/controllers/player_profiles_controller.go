package controllers

import (
	"errors"
	"net/http"
	dtos "smaash-web/internal/DTOs"
	"smaash-web/internal/models"
	"smaash-web/internal/repository"
	"smaash-web/internal/utils"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type PlayerProfileController struct {
	profilesRepo repository.PlayerProfileRepository
}

func NewPlayerProfileController(profileRepo repository.PlayerProfileRepository) *PlayerProfileController {
	return &PlayerProfileController{profilesRepo: profileRepo}
}

func (pc PlayerProfileController) ReadAll(c *gin.Context) {
	profiles, err := pc.profilesRepo.ReadAll(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, dtos.NewErrResp(err.Error(), c.Request.URL.Path))
		return
	}

	c.JSON(http.StatusOK, utils.Map(profiles, func(p models.PlayerProfile) dtos.PlayerProfileReadDTO { return dtos.PlayerProfileToReadDTO(p) }))
}

func (pc PlayerProfileController) ReadByID(c *gin.Context) {
	id, _ := c.Get("id")
	path := c.Request.URL.Path
	profile, err := pc.profilesRepo.ReadByID(c, id.(uint))
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

func (pc PlayerProfileController) Create(c *gin.Context) {
	path := c.Request.URL.Path
	var body dtos.PlayerProfileCreateDto
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, dtos.NewErrResp(err.Error(), path))
	}

	newProfile := dtos.CreateDTOToPlayerProfile(body)
	if err := pc.profilesRepo.Create(c, &newProfile); err != nil {
		if errors.Is(err, gorm.ErrDuplicatedKey) {
			c.JSON(http.StatusConflict, dtos.NewErrResp("Display name already taken", path))
			return
		}
		c.JSON(http.StatusInternalServerError, dtos.NewErrResp(err.Error(), path))
		return
	}

	c.JSON(http.StatusCreated, newProfile)
}

func (pc PlayerProfileController) Update(c *gin.Context) {
	path := c.Request.URL.Path
	id, _ := c.Get("id")

	var body dtos.PlayerProfileUpdateDto
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, dtos.NewErrResp(err.Error(), path))
		return
	}

	if body.ID != id.(uint) {
		c.JSON(http.StatusBadRequest, dtos.NewErrResp("ID from URL doesn't match ID from request body", path))
		return
	}

	if err := pc.profilesRepo.Update(c.Request.Context(), dtos.UpdateDTOToPlayerProfile(body)); err != nil {
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

func (pc PlayerProfileController) Delete(c *gin.Context) {
	id, _ := c.Get("id")
	path := c.Request.URL.Path

	if err := pc.profilesRepo.Delete(c.Request.Context(), id.(uint)); err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, dtos.NewErrResp("Record not found", path))
			return
		}
		c.JSON(http.StatusInternalServerError, dtos.NewErrResp(err.Error(), path))
		return
	}

	c.Status(http.StatusNoContent)
}
