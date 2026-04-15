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
	userRepo repository.UserRepository
}

func NewGameAuthController(
	userRepo repository.UserRepository,
) *GameAuthController {
	return &GameAuthController{
		userRepo: userRepo,
	}
}

// @description Logs a user into the game
// @tags game-auth
// @accept json
// @produce json
// @param user_login_dto body dtos.UserLoginDTO true "dto for logging in a user"
// @success 200 {int} int "returns the id of the logged in user"
// @failure 400 {object} dtos.ErrResp "request body in wrong format"
// @failure 401 {object} dtos.ErrResp "unauthorized"
// @failure 500 {object} dtos.ErrResp "internal server error"
// @router /game-login [post]
func (g GameAuthController) GameLogin(c *gin.Context) {
	var body dtos.UserLoginDTO
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusUnprocessableEntity, dtos.NewErrResp(err.Error(), c.Request.URL.Path))
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

	// Update last login time for the user
	user.LastLogin = time.Now()
	if err := g.userRepo.Update(c.Request.Context(), user); err != nil {
		c.JSON(http.StatusInternalServerError, dtos.NewErrResp(err.Error(), c.Request.URL.Path))
		return
	}

	// Issue JWT tokens
	accessToken, refreshToken, err := g.issueGameTokens(user.ID, user.Email)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dtos.NewErrResp(err.Error(), c.Request.URL.Path))
		return
	}

	// Return tokens in response
	c.JSON(http.StatusOK, gin.H{
		"accessToken":  accessToken,
		"refreshToken": refreshToken,
	})
}

// @description Asks for a refresh token
// @tags game-auth
// @accept json
// @produce json
// @param user_login_dto body dtos.TokenRefreshRequest true "dto for asking fo a refresh token"
// @success 200 {int} int "returns the new access and refresh tokens"
// @failure 400 {object} dtos.ErrResp "request body in wrong format"
// @failure 401 {object} dtos.ErrResp "unauthorized"
// @failure 500 {object} dtos.ErrResp "internal server error"
// @router /game-refresh [post]
func (g GameAuthController) Refresh(c *gin.Context) {
	var body dtos.TokenRefreshRequest
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusUnprocessableEntity, dtos.NewErrResp(err.Error(), c.Request.URL.Path))
		return
	}

	secret := os.Getenv("SECRET_KEY")
	if secret == "" {
		c.JSON(http.StatusInternalServerError, dtos.NewErrResp("SECRET_KEY is not set", c.Request.URL.Path))
		return
	}

	parsedToken, err := jwt.Parse(body.RefreshToken, func(token *jwt.Token) (any, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, errors.New("unexpected signing method")
		}
		return []byte(secret), nil
	})

	if err != nil || !parsedToken.Valid {
		c.JSON(http.StatusUnauthorized, dtos.NewErrResp("Invalid or expired refresh token", c.Request.URL.Path))
		return
	}

	claims, ok := parsedToken.Claims.(jwt.MapClaims)
	if !ok {
		c.JSON(http.StatusUnauthorized, dtos.NewErrResp("Invalid token claims", c.Request.URL.Path))
		return
	}

	tokenType, ok := claims["type"].(string)
	if !ok || tokenType != "refresh" {
		c.JSON(http.StatusUnauthorized, dtos.NewErrResp("Invalid token type", c.Request.URL.Path))
		return
	}

	email, ok := claims["email"].(string)
	if !ok || email == "" {
		c.JSON(http.StatusUnauthorized, dtos.NewErrResp("Invalid token claims", c.Request.URL.Path))
		return
	}

	// Ensure user still exists
	user, err := g.userRepo.ReadByEmail(c.Request.Context(), email)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusUnauthorized, dtos.NewErrResp("User no longer exists", c.Request.URL.Path))
			return
		}
		c.JSON(http.StatusInternalServerError, dtos.NewErrResp(err.Error(), c.Request.URL.Path))
		return
	}

	// Issue new tokens
	accessToken, refreshToken, err := g.issueGameTokens(user.ID, user.Email)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dtos.NewErrResp(err.Error(), c.Request.URL.Path))
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"accessToken":  accessToken,
		"refreshToken": refreshToken,
	})
}

func (g GameAuthController) issueGameTokens(userID uint, email string) (string, string, error) {
	secret := os.Getenv("SECRET_KEY")
	if secret == "" {
		return "", "", errors.New("SECRET_KEY is not set")
	}

	now := time.Now()

	accessToken := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"sub":   userID,
		"email": email,
		"type":  "access",
		"iat":   now.Unix(),
		"exp":   now.Add(15 * time.Minute).Unix(),
	})

	accessTokenString, err := accessToken.SignedString([]byte(secret))
	if err != nil {
		return "", "", err
	}

	refreshToken := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"sub":   userID,
		"email": email,
		"type":  "refresh",
		"iat":   now.Unix(),
		"exp":   now.Add(7 * 24 * time.Hour).Unix(),
	})

	refreshTokenString, err := refreshToken.SignedString([]byte(secret))
	if err != nil {
		return "", "", err
	}

	return accessTokenString, refreshTokenString, nil
}

func (gc GameAuthController) MountRoutes(apiGroup *gin.RouterGroup) {
	apiGroup.POST("/game-login", gc.GameLogin)
	apiGroup.POST("/game-refresh", gc.Refresh)
}
