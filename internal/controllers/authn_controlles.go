package controllers

import (
	"errors"
	"net/http"
	dtos "smaash-web/internal/DTOs"
	"smaash-web/internal/services"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type AuthnController struct {
	authService services.Authentication
}

func NewAuthnController(authService services.Authentication) *AuthnController {
	return &AuthnController{authService: authService}
}

func (a AuthnController) SignUp(c *gin.Context) {
	var body dtos.UserCreateDTO
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, dtos.NewErrResp(err.Error(), c.Request.URL.Path))
		return
	}

	_, err := a.authService.SignUp(c.Request.Context(), dtos.CreateDTOToUser(&body))
	if err != nil {
		if errors.Is(err, gorm.ErrDuplicatedKey) { // gorm returns this error when a unique constraint is violated
			c.JSON(http.StatusBadRequest, dtos.NewErrResp("User already exists", c.Request.URL.Path))
			return
		}
		c.JSON(http.StatusInternalServerError, dtos.NewErrResp(err.Error(), c.Request.URL.Path))
		return
	}

	c.Redirect(http.StatusFound, "http://localhost:8080/app/login")
}

func (a AuthnController) Login(c *gin.Context) {
	var body dtos.UserLoginDTO
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, dtos.NewErrResp(err.Error(), c.Request.URL.Path))
		return
	}

	token, err := a.authService.Login(c.Request.Context(), dtos.LoginDTOToUser(&body))
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusUnauthorized, dtos.NewErrResp("User doesn't exist", c.Request.URL.Path))
			return
		}
		if errors.Is(err, services.ErrPasswordComparisonFailed) {
			c.JSON(http.StatusUnauthorized, dtos.NewErrResp("Incorrect password", c.Request.URL.Path))
			return
		}
		c.JSON(http.StatusInternalServerError, dtos.NewErrResp(err.Error(), c.Request.URL.Path))
		return
	}

	c.SetSameSite(http.SameSiteLaxMode)
	c.SetCookie(
		"Authorization", // name
		*token,          // value
		3600*24,         // maxAge (1 day)
		"/",             // path
		"",              // domain
		false,           // secure (false for HTTP, true for HTTPS)
		true,            // httpOnly
	)

	c.Redirect(http.StatusFound, "http://localhost:8080/app/releases")
}
