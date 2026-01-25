package controllers

import (
	"errors"
	"net/http"
	dtos "smaash-web/internal/DTOs"
	"smaash-web/internal/services"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// A phony controller for testing purposes
type UsersController struct {
	statsService services.UserStats
}

func NewUserController(statsService services.UserStats) *UsersController {
	return &UsersController{statsService: statsService}
}

func (uc *UsersController) ReadAllUsers(c *gin.Context) {
	users, err := uc.statsService.ReadAllUsers(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, dtos.NewErrResp(err.Error(), c.Request.URL.Path))
	}
	c.JSON(http.StatusOK, users)
}

func (uc *UsersController) ReadUserByID(c *gin.Context) {
	id := c.GetUint("id")
	user, err := uc.statsService.ReadUserByID(c.Request.Context(), id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, dtos.NewErrResp(err.Error(), c.Request.URL.Path))
		}
		c.JSON(http.StatusInternalServerError, dtos.NewErrResp(err.Error(), c.Request.URL.Path))
	}
	c.JSON(http.StatusOK, user)
}
