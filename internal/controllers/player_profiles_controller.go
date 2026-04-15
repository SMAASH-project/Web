package controllers

import (
	"errors"
	"net/http"
	"os"
	dtos "smaash-web/internal/DTOs"
	"smaash-web/internal/middlewares"
	"smaash-web/internal/repository"
	"smaash-web/internal/utils"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/webstradev/gin-pagination/v2/pkg/pagination"
	"gorm.io/gorm"
)

type PlayerProfileController struct {
	profilesRepo   repository.ProfilesRepository
	charactersRepo repository.CharactersRepository
}

func NewPlayerProfileController(profilesRepo repository.ProfilesRepository, charactersRepo repository.CharactersRepository) *PlayerProfileController {
	return &PlayerProfileController{profilesRepo: profilesRepo, charactersRepo: charactersRepo}
}

// @description Reads all profile
// @tags profiles
// @accept json
// @produce json
// @success 200 {array} dtos.PlayerProfileReadDTO "returns all profiles"
// @failure 401 {object} dtos.ErrResp "unauthorized"
// @failure 500 {object} dtos.ErrResp "internal server error"
// @router /profiles [get]
func (pc PlayerProfileController) ReadAll(c *gin.Context) {
	page, _ := c.Get("page")
	size, _ := c.Get("size")
	sortBy := c.Query("sortBy")
	desc, _ := strconv.ParseBool(c.Query("desc"))

	profiles, err := pc.profilesRepo.ReadAllWithParams(c.Request.Context(), repository.QueryParams{
		Page:              page.(int),
		PageSize:          size.(int),
		SortBy:            sortBy,
		AllowedSortFileds: []string{"id", "display_name", "created_at"},
		Desc:              &desc,
	})
	if err != nil {
		c.JSON(http.StatusInternalServerError, dtos.NewErrResp(err.Error(), c.Request.URL.Path))
		return
	}

	c.JSON(http.StatusOK, utils.Map(profiles, dtos.PlayerProfileToReadDTO))
}

// @description Reads a user by it's id
// @tags profiles
// @accept json
// @produce json
// @param id path int true "the id of the desired profile"
// @success 200 {object} dtos.PlayerProfileReadDTO "returns the desired profile"
// @failure 401 {object} dtos.ErrResp "unauthorized"
// @failure 404 {object} dtos.ErrResp "record not found"
// @failure 500 {object} dtos.ErrResp "internal server error"
// @router /profiles/{id} [get]
func (pc PlayerProfileController) ReadByID(c *gin.Context) {
	id, _ := c.Get("id")
	path := c.Request.URL.Path
	profile, err := pc.profilesRepo.ReadByID(c, id.(uint))
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, dtos.NewErrResp(err.Error(), path))
			return
		}
		c.JSON(http.StatusInternalServerError, dtos.NewErrResp(err.Error(), path))
		return
	}

	c.JSON(http.StatusOK, dtos.PlayerProfileToReadDTO(profile))
}

// @description Creates a new profile
// @tags profiles
// @accept json
// @produce json
// @param profile_create_dto body dtos.PlayerProfileCreateDTO true "dto for creating a new profile"
// @success 201 {object} dtos.PlayerProfileReadDTO "returns newly created profile"
// @failure 400 {object} dtos.ErrResp "request body in wrong format"
// @failure 401 {object} dtos.ErrResp "unauthorized"
// @failure 409 {object} dtos.ErrResp "unique key violation"
// @failure 500 {object} dtos.ErrResp "internal server error"
// @router /profiles [post]
func (pc PlayerProfileController) Create(c *gin.Context) {
	path := c.Request.URL.Path
	var body dtos.PlayerProfileCreateDTO
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusUnprocessableEntity, dtos.NewErrResp(err.Error(), path))
	}

	currentProfiles, err := pc.profilesRepo.ReadByUserID(c.Request.Context(), body.UserID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dtos.NewErrResp(err.Error(), path))
		return
	}

	if len(currentProfiles) > 4 {
		c.JSON(http.StatusForbidden, dtos.NewErrResp("A user can have a maximum of five profiles", path))
		return
	}

	newProfile := dtos.CreateDTOToPlayerProfile(body)
	if err := pc.profilesRepo.CreateWithBaseCharacters(c, &newProfile); err != nil {
		if errors.Is(err, gorm.ErrDuplicatedKey) {
			c.JSON(http.StatusConflict, dtos.NewErrResp("Display name already taken", path))
			return
		}
		c.JSON(http.StatusInternalServerError, dtos.NewErrResp(err.Error(), path))
		return
	}

	c.JSON(http.StatusCreated, newProfile)
}

// @description Updates the profile with the given id
// @tags profiles
// @accept json
// @produce json
// @param profile_update_dto body dtos.PlayerProfileUpdateDTO true "dto for updating a profile"
// @param id path int true "id of desired profile"
// @success 204 {} nil "doesn't return anything"
// @failure 400 {object} dtos.ErrResp "request body in wrong format"
// @failure 400 {object} dtos.ErrResp "id from url and id from request body doesn't match"
// @failure 401 {object} dtos.ErrResp "unauthorized"
// @failure 404 {object} dtos.ErrResp "record not found"
// @failure 409 {object} dtos.ErrResp "unique key violation"
// @failure 500 {object} dtos.ErrResp "internal server error"
// @router /profiles/{id} [put]
func (pc PlayerProfileController) Update(c *gin.Context) {
	path := c.Request.URL.Path
	id, _ := c.Get("id")

	var body dtos.PlayerProfileUpdateDTO
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusUnprocessableEntity, dtos.NewErrResp(err.Error(), path))
		return
	}

	if body.ID != id.(uint) {
		c.JSON(http.StatusBadRequest, dtos.NewErrResp("ID from URL doesn't match ID from request body", path))
		return
	}

	if err := pc.profilesRepo.Update(c.Request.Context(), dtos.UpdateDTOToPlayerProfile(body)); err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, dtos.NewErrResp("Record not found", path))
			return
		}
		if errors.Is(err, gorm.ErrDuplicatedKey) {
			c.JSON(http.StatusConflict, dtos.NewErrResp("Display name already taken", path))
			return
		}
		c.JSON(http.StatusInternalServerError, dtos.NewErrResp(err.Error(), path))
		return
	}

	c.Status(http.StatusNoContent)
}

// @description Deletes a profile with the given id
// @tags profiles
// @accept json
// @produce json
// @param id path int true "id of desired profile"
// @success 204 {} nil "doesn't return anything"
// @failure 401 {object} dtos.ErrResp "unauthorized"
// @failure 404 {object} dtos.ErrResp "record not found"
// @failure 500 {object} dtos.ErrResp "internal server error"
// @router /profiles/{id} [delete]
func (pc PlayerProfileController) Delete(c *gin.Context) {
	id, _ := c.Get("id")
	path := c.Request.URL.Path

	if err := pc.profilesRepo.HardDelete(c.Request.Context(), id.(uint)); err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, dtos.NewErrResp("Record not found", path))
			return
		}
		c.JSON(http.StatusInternalServerError, dtos.NewErrResp(err.Error(), path))
		return
	}

	c.Status(http.StatusNoContent)
}

// @description Uploads a profile picture
// @tags profiles
// @accept mpfd
// @produce json
// @param id path int true "id of desired profile"
// @success 201 {object} string "returns newly created profile picture's URI"
// @failure 400 {object} dtos.ErrResp "no file sent"
// @failure 401 {object} dtos.ErrResp "unauthorized"
// @failure 415 {object} dtos.ErrResp "invalid media type"
// @failure 500 {object} dtos.ErrResp "internal server error"
// @router /profiles/{id}/pfp [post]
func (pc PlayerProfileController) UploadPFP(c *gin.Context) {
	path := c.Request.URL.Path
	id, _ := c.Get("id")

	file, err := c.FormFile("profilePicture")
	if err != nil {
		c.JSON(http.StatusBadRequest, dtos.NewErrResp("No file uploaded", path))
		return
	}

	uri, err := utils.SaveFileToDisc(c, file, utils.PROFILE_PICTURE)
	if err != nil {
		if errors.Is(err, utils.ErrUnsupportedMediaType) {
			c.JSON(http.StatusUnsupportedMediaType, dtos.NewErrResp(err.Error(), path))
			return
		}
		c.JSON(http.StatusInternalServerError, dtos.NewErrResp(err.Error(), path))
		return
	}

	if err := pc.profilesRepo.UpdateOne(c.Request.Context(), id.(uint), "pfp_uri", uri); err != nil {
		c.JSON(http.StatusInternalServerError, dtos.NewErrResp(err.Error(), path))
		return
	}

	c.String(http.StatusCreated, *uri)
}

// @description Returns an uploaded profile picture
// @tags profiles
// @accept json
// @produce mpfd
// @param id path int true "id of desired profile"
// @failure 404 {object} dtos.ErrResp "record not found"
// @failure 500 {object} dtos.ErrResp "internal server error"
// @router /profiles/{id}/pfp [get]
func (pc PlayerProfileController) GetPFP(c *gin.Context) {
	path := c.Request.URL.Path
	id, _ := c.Get("id")

	profile, err := pc.profilesRepo.ReadByID(c.Request.Context(), id.(uint))
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, dtos.NewErrResp("Profile with given id not found", path))
			return
		}
		c.JSON(http.StatusInternalServerError, dtos.NewErrResp(err.Error(), path))
		return
	}

	if profile.PfpUri == "" {
		c.JSON(http.StatusNotFound, dtos.NewErrResp("Given profile has no uploaded profile picture", path))
		return
	}

	if _, err := os.Stat(profile.PfpUri); err != nil {
		if errors.Is(err, os.ErrNotExist) {
			c.JSON(http.StatusNotFound, dtos.NewErrResp("Profile picture of given profile cannot be found", path))
			return
		}
		c.JSON(http.StatusInternalServerError, dtos.NewErrResp("File is corrupt: "+err.Error(), path))
		return
	}

	c.File(profile.PfpUri)
}

// @description Reads all purchases of given profile
// @tags profiles
// @accept json
// @produce json
// @param user_id path int true "ID of the profile whose purchases you attempt to fetch"
// @success 201 {array} dtos.PurchaseReadDTO "returns purchases of the given profile"
// @failure 404 {object} dtos.ErrResp "user with given ID not found"
// @failure 401 {object} dtos.ErrResp "unauthorized"
// @failure 409 {object} dtos.ErrResp "unique key violation"
// @failure 422 {object} dtos.ErrResp "request body in wrong format"
// @failure 500 {object} dtos.ErrResp "internal server error"
// @router /profiles/{id}/purchases [get]
func (pc PlayerProfileController) ReadPurchases(c *gin.Context) {
	path := c.Request.URL.Path
	id, _ := c.Get("id")

	profile, err := pc.profilesRepo.ReadByID(c.Request.Context(), id.(uint), "Purchases")
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, dtos.NewErrResp("Profile with given id not found", path))
			return
		}
		c.JSON(http.StatusInternalServerError, dtos.NewErrResp(err.Error(), path))
		return
	}

	c.JSON(http.StatusOK, utils.Map(profile.Purchases, dtos.PurchaseToDTO))
}

func (pc PlayerProfileController) ReadCharacters(c *gin.Context) {
	path := c.Request.URL.Path
	id, _ := c.Get("id")

	player, err := pc.profilesRepo.ReadByID(c.Request.Context(), id.(uint), "Characters")
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, dtos.NewErrResp("Player profile with given id not found", path))
			return
		}
		c.JSON(http.StatusInternalServerError, dtos.NewErrResp(err.Error(), path))
		return
	}

	c.JSON(http.StatusOK, utils.Map(player.Characters, dtos.CharacterToDTO))
}

func (pc PlayerProfileController) ReadNotOwnedCharacters(c *gin.Context) {
	path := c.Request.URL.Path
	id, _ := c.Get("id")

	player, err := pc.profilesRepo.ReadByID(c.Request.Context(), id.(uint), "Characters")
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, dtos.NewErrResp("Player profile with given id not found", path))
			return
		}
		c.JSON(http.StatusInternalServerError, dtos.NewErrResp(err.Error(), path))
		return
	}

	c.JSON(http.StatusOK, utils.Map(player.Characters, dtos.CharacterToDTO))
}

func (pc PlayerProfileController) MountRoutes(apiGroup *gin.RouterGroup) {
	profiles := apiGroup.Group("/profiles")
	profiles.GET("", middlewares.Authorize(middlewares.ADMIN), pagination.New(), pc.ReadAll)
	profiles.GET("/:id", middlewares.Authorize(middlewares.ADMIN), middlewares.ValidateUrl, pc.ReadByID)
	profiles.POST("", middlewares.Authorize(middlewares.ANY), pc.Create)
	profiles.PUT("/:id", middlewares.Authorize(middlewares.ANY), middlewares.ValidateUrl, pc.Update)
	profiles.DELETE("/:id", middlewares.Authorize(middlewares.ANY), middlewares.ValidateUrl, pc.Delete)
	profiles.POST("/:id/pfp", middlewares.Authorize(middlewares.ANY), middlewares.ValidateUrl, pc.UploadPFP)
	profiles.GET("/:id/pfp", middlewares.Authorize(middlewares.ANY), middlewares.ValidateUrl, pc.GetPFP)
	profiles.GET("/:id/purchases", middlewares.Authorize(middlewares.ANY), middlewares.ValidateUrl, pc.ReadPurchases)
	profiles.GET("/:id/characters", middlewares.Authorize(middlewares.ANY), middlewares.ValidateUrl, pc.ReadCharacters)
}
