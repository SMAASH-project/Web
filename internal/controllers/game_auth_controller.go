package controllers

import (
	"errors"
	"net/http"
	"os"
	"time"

	dtos "smaash-web/internal/DTOs"
	"smaash-web/internal/repository"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

type GameAuthController struct {
	userRepo          repository.UserRepository
	playerProfileRepo repository.PlayerProfileRepository
}

func NewGameAuthController(
	userRepo repository.UserRepository,
	playerProfileRepo repository.PlayerProfileRepository,
) *GameAuthController {
	return &GameAuthController{
		userRepo:          userRepo,
		playerProfileRepo: playerProfileRepo,
	}
}

func (g GameAuthController) GameLogin(c *gin.Context) {
	var body dtos.UserLoginDTO
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, dtos.NewErrResp(err.Error(), c.Request.URL.Path))
		return
	}

	// Get User by email
	user, err := g.userRepo.ReadByEmail(c.Request.Context(), body.Email)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusUnauthorized, dtos.NewErrResp(
				"User doesn't exist. Please sign up on the website first.",
				c.Request.URL.Path,
			))
			return
		}
		c.JSON(http.StatusInternalServerError, dtos.NewErrResp(err.Error(), c.Request.URL.Path))
		return
	}

	// Verify password
	err = bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(body.Password))
	if err != nil {
		c.JSON(http.StatusUnauthorized, dtos.NewErrResp("Incorrect password", c.Request.URL.Path))
		return
	}

	// Get PlayerProfile directly from repository
	profile, err := g.playerProfileRepo.ReadByUserId(c.Request.Context(), user.ID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusBadRequest, dtos.NewErrResp(
				"Player profile not found. Please create your profile on the website first.",
				c.Request.URL.Path,
			))
			return
		}
		c.JSON(http.StatusInternalServerError, dtos.NewErrResp(err.Error(), c.Request.URL.Path))
		return
	}

	// Update last login directly
	profile.LastLogin = time.Now()
	if err := g.playerProfileRepo.Update(c.Request.Context(), profile); err != nil {
		c.JSON(http.StatusInternalServerError, dtos.NewErrResp(err.Error(), c.Request.URL.Path))
		return
	}

	// Generate token
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"playerProfileId": profile.ID,
		"userId":          user.ID,
		"email":           user.Email,
		"displayName":     profile.DisplayName,
		"exp":             time.Now().Add(time.Hour * 24).Unix(),
	})

	tokenString, err := token.SignedString([]byte(os.Getenv("SECRET_KEY")))
	if err != nil {
		c.JSON(http.StatusInternalServerError, dtos.NewErrResp(err.Error(), c.Request.URL.Path))
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"token":   tokenString,
		"profile": dtos.PlayerProfileToDTO(*profile),
	})
}
