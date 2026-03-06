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

// @description Register a new user
// @tags auth
// @accept json
// @produce json
// @param user_create_dto body dtos.UserCreateDTO true "dto for creating a new user"
// @success 201 {object} dtos.UserReadDTO "returns newly created user"
// @failure 400 {object} dtos.ErrResp "request body in wrong format"
// @failure 409 {object} dtos.ErrResp "unique key violation"
// @failure 500 {object} dtos.ErrResp "internal server error"
// @router /auth/signup [post]
func (a AuthnController) SignUp(c *gin.Context) {
	var body dtos.UserCreateDTO
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, dtos.NewErrResp(err.Error(), c.Request.URL.Path))
		return
	}

	newUser, err := a.authService.SignUp(c.Request.Context(), dtos.CreateDTOToUser(&body))
	if err != nil {
		if errors.Is(err, gorm.ErrDuplicatedKey) { // gorm returns this error when a unique constraint is violated
			c.JSON(http.StatusConflict, dtos.NewErrResp("User already exists", c.Request.URL.Path))
			return
		}
		c.JSON(http.StatusInternalServerError, dtos.NewErrResp(err.Error(), c.Request.URL.Path))
		return
	}

	c.JSON(http.StatusCreated, dtos.UserToDTO(*newUser))
}

// @description Logs in a user
// @tags auth
// @accept json
// @produce json
// @param user_login_dto body dtos.UserLoginDTO true "dto for logging in a user"
// @success 200 {int} int "returns the id of the logged in user"
// @failure 400 {object} dtos.ErrResp "request body in wrong format"
// @failure 401 {object} dtos.ErrResp "unauthorized"
// @failure 404 {object} dtos.ErrResp "record not found"
// @failure 500 {object} dtos.ErrResp "internal server error"
// @router /auth/login [post]
func (a AuthnController) Login(c *gin.Context) {
	var body dtos.UserLoginDTO
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, dtos.NewErrResp(err.Error(), c.Request.URL.Path))
		return
	}

	token, id, err := a.authService.Login(c.Request.Context(), dtos.LoginDTOToUser(&body))

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

	c.JSON(http.StatusOK, gin.H{
		"id": id,
	})
}

// @description Logs out a user
// @tags auth
// @accept json
// @produce json
// @success 204 {} nil "doesn't return anything"
// @router /auth/logout [post]
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

func (a AuthnController) MountRoutes(apiGroup *gin.RouterGroup) {
	auth := apiGroup.Group("/auth")
	auth.POST("/signup", a.SignUp)
	auth.POST("/login", a.Login)
	auth.POST("/logout", a.Logout)
}
