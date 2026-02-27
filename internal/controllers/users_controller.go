package controllers

import (
	"errors"
	"net/http"
	dtos "smaash-web/internal/DTOs"
	"smaash-web/internal/repository"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type UserController struct {
	userRepo    repository.UserRepository
	profileRepo repository.PlayerProfileRepository
}

func NewUserController(userRepo repository.UserRepository, profileRepo repository.PlayerProfileRepository) *UserController {
	return &UserController{userRepo: userRepo, profileRepo: profileRepo}
}

func (uc *UserController) ReadAll(c *gin.Context) {
	users, err := uc.userRepo.ReadAll(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, dtos.NewErrResp(err.Error(), c.Request.URL.Path))
		return
	}
	c.JSON(http.StatusOK, users)
}

func (uc *UserController) ReadByID(c *gin.Context) {
	id, _ := c.Get("id")
	user, err := uc.userRepo.ReadByID(c.Request.Context(), id.(uint))
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, dtos.NewErrResp(err.Error(), c.Request.URL.Path))
			return
		}
		c.JSON(http.StatusInternalServerError, dtos.NewErrResp(err.Error(), c.Request.URL.Path))
		return
	}
	c.JSON(http.StatusOK, user)
}

// NOTE: You can't change the password here, that requires separate functionality
func (uc *UserController) Update(c *gin.Context) {
	id, _ := c.Get("id")
	path := c.Request.URL.Path

	var body dtos.UserUpdateDTO
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, dtos.NewErrResp(err.Error(), path))
		return
	}

	if body.ID != id.(uint) {
		c.JSON(http.StatusBadRequest, dtos.NewErrResp("ID from URL doesn't match ID from request body", path))
		return
	}

	if err := uc.userRepo.Update(c.Request.Context(), dtos.UpdateDTOToUser(body)); err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, dtos.NewErrResp("Record not found", path))
			return
		}
		if errors.Is(err, gorm.ErrDuplicatedKey) {
			c.JSON(http.StatusConflict, dtos.NewErrResp("This email already has a user registered", path))
			return
		}
		c.JSON(http.StatusInternalServerError, dtos.NewErrResp(err.Error(), path))
		return
	}

	c.Status(http.StatusNoContent)
}

func (uc *UserController) Delete(c *gin.Context) {
	id, _ := c.Get("id")
	path := c.Request.URL.Path

	if err := uc.userRepo.Delete(c.Request.Context(), id.(uint)); err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, dtos.NewErrResp("Record not found", path))
			return
		}
		c.JSON(http.StatusInternalServerError, dtos.NewErrResp(err.Error(), path))
		return
	}

	c.Status(http.StatusNoContent)
}

func (uc *UserController) AddProfileToUser(c *gin.Context) {
	id, _ := c.Get("id")
	path := c.Request.URL.Path

	var body dtos.PlayerProfileAppendDTO
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, dtos.NewErrResp(err.Error(), path))
		return
	}

	newProfile := dtos.AppendDTOToPlayerProfile(body)
	newProfile.UserID = id.(uint)

	if err := uc.profileRepo.Create(c.Request.Context(), &newProfile); err != nil {
		if errors.Is(err, gorm.ErrDuplicatedKey) {
			c.JSON(http.StatusConflict, dtos.NewErrResp("Display name already taken", path))
			return
		}
		c.JSON(http.StatusInternalServerError, dtos.NewErrResp(err.Error(), path))
		return
	}

	c.JSON(http.StatusCreated, dtos.PlayerProfileToReadDTO(newProfile))
}
