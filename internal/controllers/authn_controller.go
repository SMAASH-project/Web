package controllers

import (
	"errors"
	"net/http"
	dtos "smaash-web/internal/DTOs"
	"smaash-web/internal/middlewares"
	"smaash-web/internal/repository"
	"smaash-web/internal/services"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type AuthnController struct {
	authService services.Authentication
	rolesRepo   repository.RolesRepository
}

func NewAuthnController(authService services.Authentication, rolesRepo repository.RolesRepository) *AuthnController {
	return &AuthnController{authService: authService, rolesRepo: rolesRepo}
}

// @description Register a new user
// @tags auth
// @accept json
// @produce json
// @param user_create_dto body dtos.UserCreateDTO true "dto for creating a new user"
// @success 201 {object} dtos.UserReadDTO "returns newly created user"
// @failure 409 {object} dtos.ErrResp "unique key violation"
// @failure 422 {object} dtos.ErrResp "request body in wrong format"
// @failure 500 {object} dtos.ErrResp "internal server error"
// @router /auth/signup [post]
func (a AuthnController) SignUp(c *gin.Context) {
	path := c.Request.URL.Path
	var body dtos.UserCreateDTO
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusUnprocessableEntity, dtos.NewErrResp(err.Error(), c.Request.URL.Path))
		return
	}

	newUser, err := dtos.CreateDTOToUser(&body, a.rolesRepo.ReadByName)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusInternalServerError, dtos.NewErrResp("Role 'user' doesn't exist", path))
			return
		}
		c.JSON(http.StatusInternalServerError, dtos.NewErrResp(err.Error(), path))
	}

	securityKey, err := a.authService.SignUp(c.Request.Context(), newUser)
	if err != nil {
		if errors.Is(err, gorm.ErrDuplicatedKey) {
			c.JSON(http.StatusConflict, dtos.NewErrResp("User already exists", path))
			return
		}
		c.JSON(http.StatusInternalServerError, dtos.NewErrResp(err.Error(), path))
		return
	}

	c.JSON(http.StatusCreated, dtos.UserToSignupRespDTO(*newUser, *securityKey))
}

// @description Logs in a user
// @tags auth
// @accept json
// @produce json
// @param user_login_dto body dtos.UserLoginDTO true "dto for logging in a user"
// @success 200 {int} int "returns the id of the logged in user"
// @failure 401 {object} dtos.ErrResp "unauthorized"
// @failure 404 {object} dtos.ErrResp "record not found"
// @failure 422 {object} dtos.ErrResp "request body in wrong format"
// @failure 500 {object} dtos.ErrResp "internal server error"
// @router /auth/login [post]
func (a AuthnController) Login(c *gin.Context) {
	var body dtos.UserLoginDTO
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusUnprocessableEntity, dtos.NewErrResp(err.Error(), c.Request.URL.Path))
		return
	}

	token, user, err := a.authService.Login(c.Request.Context(), dtos.LoginDTOToUser(&body))

	if err != nil {
		switch {
		case errors.Is(err, gorm.ErrRecordNotFound):
			c.JSON(http.StatusUnauthorized, dtos.NewErrResp("User doesn't exist", c.Request.URL.Path))
			return
		case errors.Is(err, services.ErrPasswordIncorrect):
			c.JSON(http.StatusUnauthorized, dtos.NewErrResp("Incorrect password", c.Request.URL.Path))
			return
		case errors.Is(err, services.ErrUserBanned):
			c.JSON(http.StatusUnauthorized, gin.H{
				"error":        dtos.NewErrResp("User is banned", c.Request.URL.Path),
				"banned_until": user.BannedUntil,
			})
			return
		default:
			c.JSON(http.StatusInternalServerError, dtos.NewErrResp(err.Error(), c.Request.URL.Path))
			return
		}
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
		"id":   user.ID,
		"role": user.Role.Name,
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

func (a AuthnController) ChangePassword(c *gin.Context) {
	path := c.Request.URL.Path
	id, _ := c.Get("id")

	var body dtos.PasswordChangeDTO
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusUnprocessableEntity, dtos.NewErrResp(err.Error(), path))
		return
	}

	if id.(uint) != body.ID {
		c.JSON(http.StatusBadRequest, dtos.NewErrResp("ID from url doesn't match ID from request body", path))
		return
	}

	if err := a.authService.ChangePassword(c.Request.Context(), id.(uint), body.NewPassword, body.SecurityKey); err != nil {
		if errors.Is(err, services.ErrSecurityKeyInvalid) {
			c.JSON(http.StatusUnauthorized, dtos.NewErrResp(err.Error(), path))
			return
		}
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, dtos.NewErrResp("Profile with given id not found", path))
			return
		}
		c.JSON(http.StatusInternalServerError, dtos.NewErrResp(err.Error(), path))
		return
	}

	c.Status(http.StatusNoContent)
}

func (a AuthnController) MountRoutes(apiGroup *gin.RouterGroup) {
	auth := apiGroup.Group("/auth")
	auth.POST("/signup", a.SignUp)
	auth.POST("/login", a.Login)
	auth.POST("/logout", a.Logout)
	auth.PUT("/change-password", middlewares.Authorize(middlewares.ANY), a.ChangePassword)
}
