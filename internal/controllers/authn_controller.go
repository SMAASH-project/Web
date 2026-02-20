package controllers

import (
	"errors"
	"net/http"
	dtos "smaash-web/internal/DTOs"
	"smaash-web/internal/models"
	"smaash-web/internal/repository"
	"smaash-web/internal/services"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type AuthnController struct {
	authService       services.Authentication
	playerProfileRepo repository.PlayerProfileRepository
}

func NewAuthnController(authService services.Authentication, playerProfileRepo repository.PlayerProfileRepository) *AuthnController {
	return &AuthnController{authService: authService, playerProfileRepo: playerProfileRepo}
}

func (a AuthnController) SignUp(c *gin.Context) {
	var body dtos.UserCreateDTO
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, dtos.NewErrResp(err.Error(), c.Request.URL.Path))
		return
	}

	newUser, err := a.authService.SignUp(c.Request.Context(), dtos.CreateDTOToUser(&body))
	if err != nil {
		if errors.Is(err, gorm.ErrDuplicatedKey) { // gorm returns this error when a unique constraint is violated
			c.JSON(http.StatusBadRequest, dtos.NewErrResp("User already exists", c.Request.URL.Path))
			return
		}
		c.JSON(http.StatusInternalServerError, dtos.NewErrResp(err.Error(), c.Request.URL.Path))
		return
	}

	playerProfile := &models.PlayerProfile{
		UserID:      newUser.ID,
		DisplayName: body.Username,
		Coins:       1000,
		LastLogin:   time.Now(),
	}

	err = a.playerProfileRepo.Create(c.Request.Context(), playerProfile)
	if err != nil {
		if errors.Is(err, gorm.ErrDuplicatedKey) {
			c.JSON(http.StatusBadRequest, dtos.NewErrResp(
				"Username already taken",
				c.Request.URL.Path,
			))
			return
		}
		c.JSON(http.StatusInternalServerError, dtos.NewErrResp(err.Error(), c.Request.URL.Path))
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"user":    dtos.UserToDTO(newUser),
		"profile": dtos.PlayerProfileToDTO(*playerProfile),
	})
}

func (a AuthnController) Login(c *gin.Context) {
	var body dtos.UserLoginDTO
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, dtos.NewErrResp(err.Error(), c.Request.URL.Path))
		return
	}

	token, userID, err := a.authService.Login(c.Request.Context(), dtos.LoginDTOToUser(&body))
	_ = userID

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

	c.JSON(http.StatusOK, nil)
}

func (a AuthnController) Logout(c *gin.Context) {
	c.SetSameSite(http.SameSiteLaxMode)
	c.SetCookie(
		"Authorization", // name
		"",              // value
		-1,              // maxAge
		"/",             // path
		"",              // domain
		false,           // secure (false for HTTP, true for HTTPS)
		true,            // httpOnly
	)

	c.Status(http.StatusNoContent)
}
