package controllers

import (
	"errors"
	"net/http"
	dtos "smaash-web/internal/DTOs"
	"smaash-web/internal/repository"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type UsersController struct {
	userRepo repository.UserRepository
}

func NewUserController(userRepo repository.UserRepository) *UsersController {
	return &UsersController{userRepo: userRepo}
}

func (uc *UsersController) ReadAllUsers(c *gin.Context) {
	users, err := uc.userRepo.ReadAll(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, dtos.NewErrResp(err.Error(), c.Request.URL.Path))
		return
	}
	c.JSON(http.StatusOK, users)
}

func (uc *UsersController) ReadUserByID(c *gin.Context) {
	// id, _ := strconv.Atoi(c.Param("id"))
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
