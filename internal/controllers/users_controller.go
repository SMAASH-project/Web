package controllers

import (
	"errors"
	"net/http"
	dtos "smaash-web/internal/DTOs"
	"smaash-web/internal/middlewares"
	"smaash-web/internal/models"
	"smaash-web/internal/repository"
	"smaash-web/internal/utils"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/webstradev/gin-pagination/v2/pkg/pagination"
	"gorm.io/gorm"
)

type UserController struct {
	userRepo        repository.UserRepository
	profileBaseRepo repository.BaseRepository[models.PlayerProfile]
}

func NewUserController(
	userRepo repository.UserRepository,
	profilesBaseRepo repository.BaseRepository[models.PlayerProfile],
) *UserController {
	return &UserController{userRepo: userRepo, profileBaseRepo: profilesBaseRepo}
}

// @description Reads all users
// @tags users
// @accept json
// @produce json
// @success 200 {array} dtos.UserReadDTO "returns all users"
// @failure 401 {object} dtos.ErrResp "unauthorized"
// @failure 500 {object} dtos.ErrResp "internal server error"
// @router /users [get]
func (uc *UserController) ReadAll(c *gin.Context) {
	page, _ := c.Get("page")
	size, _ := c.Get("size")
	users, err := uc.userRepo.ReadAllPaginated(c.Request.Context(), page.(int), size.(int), "Role")
	if err != nil {
		c.JSON(http.StatusInternalServerError, dtos.NewErrResp(err.Error(), c.Request.URL.Path))
		return
	}
	c.JSON(http.StatusOK, utils.Map(users, dtos.UserToDTO))
}

// @description Reads a user by id
// @tags users
// @accept json
// @produce json
// @param user_id path int true "ID of desired user"
// @success 200 {object} dtos.UserReadDTO "returns the user with the given id"
// @failure 401 {object} dtos.ErrResp "unauthorized"
// @failure 404 {object} dtos.ErrResp "User with given ID not found"
// @failure 500 {object} dtos.ErrResp "internal server error"
// @router /users/{id} [get]
func (uc *UserController) ReadByID(c *gin.Context) {
	id, _ := c.Get("id")
	user, err := uc.userRepo.ReadByID(c.Request.Context(), id.(uint), "Role")
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, dtos.NewErrResp(err.Error(), c.Request.URL.Path))
			return
		}
		c.JSON(http.StatusInternalServerError, dtos.NewErrResp(err.Error(), c.Request.URL.Path))
		return
	}
	c.JSON(http.StatusOK, dtos.UserToDTO(user))
}

// SMAASH godoc
// NOTE: You can't change the password here, that requires separate functionality
// @description Updates the user with the given id. (Cannot modify the users password)
// @tags users
// @accept json
// @produce json
// @param user_update_dto body dtos.UserUpdateDTO true "dto for updating a user"
// @param id path int true "id of desired user"
// @success 204 {} nil "doesn't return anything"
// @failure 400 {object} dtos.ErrResp "request body in wrong format"
// @failure 400 {object} dtos.ErrResp "id from url and id from request body doesn't match"
// @failure 401 {object} dtos.ErrResp "unauthorized"
// @failure 404 {object} dtos.ErrResp "record not found"
// @failure 409 {object} dtos.ErrResp "unique key violation"
// @failure 500 {object} dtos.ErrResp "internal server error"
// @router /users/{id} [put]
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

// @description Deletes a user with the given id
// @tags users
// @accept json
// @produce json
// @param id path int true "id of desired user"
// @success 204 {} nil "doesn't return anything"
// @failure 401 {object} dtos.ErrResp "unauthorized"
// @failure 404 {object} dtos.ErrResp "record not found"
// @failure 500 {object} dtos.ErrResp "internal server error"
// @router /users/{id} [delete]
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

// @description Creates a new profile for a given user
// @tags users
// @accept json
// @produce json
// @param profile_append_dto body dtos.PlayerProfileAppendDTO true "dto for creating a new profile for a given user"
// @param user_id path int true "ID of the user to whose profiles you attempt to append"
// @success 201 {object} dtos.PlayerProfileReadDTO "returns newly created profile"
// @failure 400 {object} dtos.ErrResp "request body in wrong format"
// @failure 404 {object} dtos.ErrResp "user with given ID not found"
// @failure 401 {object} dtos.ErrResp "unauthorized"
// @failure 409 {object} dtos.ErrResp "unique key violation"
// @failure 500 {object} dtos.ErrResp "internal server error"
// @router /users/{id}/profiles [post]
func (uc *UserController) AddProfileToUser(c *gin.Context) {
	id, _ := c.Get("id")
	path := c.Request.URL.Path

	var body dtos.PlayerProfileAppendDTO
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, dtos.NewErrResp(err.Error(), path))
		return
	}

	_, err := uc.userRepo.ReadByID(c.Request.Context(), id.(uint))
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, dtos.NewErrResp("User with given ID not found", path))
			return
		}
		c.JSON(http.StatusInternalServerError, dtos.NewErrResp(err.Error(), path))
	}

	newProfile := dtos.AppendDTOToPlayerProfile(body)
	newProfile.UserID = id.(uint)

	if err := uc.profileBaseRepo.Create(c.Request.Context(), &newProfile); err != nil {
		if errors.Is(err, gorm.ErrDuplicatedKey) {
			c.JSON(http.StatusConflict, dtos.NewErrResp("Display name already taken", path))
			return
		}
		c.JSON(http.StatusInternalServerError, dtos.NewErrResp(err.Error(), path))
		return
	}

	c.JSON(http.StatusCreated, dtos.PlayerProfileToReadDTO(newProfile))
}

// @description Reads all profiles of a given user
// @tags users
// @accept json
// @produce json
// @param user_id path int true "ID of the user whose profiles you attempt to fetch"
// @success 201 {array} dtos.PlayerProfileReadDTO "returns profiles of the given user"
// @failure 400 {object} dtos.ErrResp "request body in wrong format"
// @failure 404 {object} dtos.ErrResp "user with given ID not found"
// @failure 401 {object} dtos.ErrResp "unauthorized"
// @failure 409 {object} dtos.ErrResp "unique key violation"
// @failure 500 {object} dtos.ErrResp "internal server error"
// @router /users/{id}/profiles [get]
func (uc *UserController) ReadUsersProfiles(c *gin.Context) {
	id, _ := c.Get("id")
	path := c.Request.URL.Path

	_, err := uc.userRepo.ReadByID(c.Request.Context(), id.(uint))
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, dtos.NewErrResp("User with given ID not found", path))
			return
		}
		c.JSON(http.StatusInternalServerError, dtos.NewErrResp(err.Error(), path))
	}

	profiles, err := uc.userRepo.ReadUsersProfiles(c.Request.Context(), id.(uint))
	if err != nil {
		c.JSON(http.StatusInternalServerError, dtos.NewErrResp(err.Error(), path))
		return
	}

	c.JSON(http.StatusOK, utils.Map(profiles, dtos.PlayerProfileToReadDTO))
}

func (uc UserController) WhoAmI(c *gin.Context) {
	caller_id, _ := c.Get("caller_id")
	user, err := uc.userRepo.ReadByID(c.Request.Context(), caller_id.(uint), "Role")
	path := c.Request.URL.Path
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, dtos.NewErrResp("user with id provided in token doesn't exist", path))
			return
		}
		c.JSON(http.StatusInternalServerError, dtos.NewErrResp(err.Error(), path))
		return
	}

	c.JSON(http.StatusOK, dtos.UserToDTO(user))
}

func (uc UserController) Ban(c *gin.Context) {
	path := c.Request.URL.Path
	id, _ := c.Get("id")

	var body dtos.UserBanDTO
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusUnprocessableEntity, dtos.NewErrResp(err.Error(), path))
		return
	}

	if id.(uint) != body.ID {
		c.JSON(http.StatusBadRequest, dtos.NewErrResp("Id from url doesn't match id from request body", path))
		return
	}

	bannedUntil := time.Now().Add(time.Duration(body.Period) * time.Minute)
	if err := uc.userRepo.Update(c.Request.Context(), models.User{
		Model:       gorm.Model{ID: body.ID},
		IsBanned:    true,
		BannedUntil: &bannedUntil,
	}); err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, dtos.NewErrResp("User with given id not found", path))
			return
		}
		c.JSON(http.StatusInternalServerError, dtos.NewErrResp(err.Error(), path))
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"period": body.Period,
	})
}

func (uc UserController) Unban(c *gin.Context) {
	path := c.Request.URL.Path
	id, _ := c.Get("id")

	if err := uc.userRepo.Unban(c.Request.Context(), id.(uint)); err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, dtos.NewErrResp("User with given id not found", path))
			return
		}
		c.JSON(http.StatusInternalServerError, dtos.NewErrResp(err.Error(), path))
		return
	}

	c.Status(http.StatusNoContent)
}

func (uc UserController) MountRoutes(apiGroup *gin.RouterGroup) {
	users := apiGroup.Group("/users")
	// no creation, that happens on /auth/signup. No updating password either.
	users.GET("", middlewares.Authorize(middlewares.ADMIN), pagination.New(), uc.ReadAll)
	users.GET("/:id", middlewares.Authorize(middlewares.ANY), middlewares.ValidateUrl, uc.ReadByID)
	users.PUT("/:id", middlewares.Authorize(middlewares.ANY), middlewares.ValidateUrl, uc.Update)
	users.DELETE("/:id", middlewares.Authorize(middlewares.ANY), middlewares.ValidateUrl, uc.Delete)
	users.POST("/:id/profiles", middlewares.Authorize(middlewares.ANY), middlewares.ValidateUrl, uc.AddProfileToUser)
	users.GET("/:id/profiles", middlewares.Authorize(middlewares.ANY), middlewares.ValidateUrl, uc.ReadUsersProfiles)
	users.GET("/whoami", middlewares.Authorize(middlewares.ANY), uc.WhoAmI)
	users.POST("/:id/ban", middlewares.Authorize(middlewares.ADMIN), middlewares.ValidateUrl, uc.Ban)
	users.POST("/:id/unban", middlewares.Authorize(middlewares.ADMIN), middlewares.ValidateUrl, uc.Unban)
}
