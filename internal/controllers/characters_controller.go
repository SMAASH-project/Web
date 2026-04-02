package controllers

import (
	"errors"
	"net/http"
	"os"
	dtos "smaash-web/internal/DTOs"
	"smaash-web/internal/middlewares"
	"smaash-web/internal/models"
	"smaash-web/internal/repository"
	"smaash-web/internal/utils"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type CharactersController struct {
	charactersBaseRepo repository.BaseRepository[models.Character]
}

func NewCharactersController(charactersBaseRepo repository.BaseRepository[models.Character]) *CharactersController {
	return &CharactersController{charactersBaseRepo: charactersBaseRepo}
}

// @description Creates a new character
// @tags characters
// @accept json
// @produce json
// @param character_create_dto body dtos.CharacterCreateDTO true "dto for creating a new character"
// @success 201 {object} dtos.CharacterReadDTO "returns newly created character"
// @failure 401 {object} dtos.ErrResp "unauthorized"
// @failure 409 {object} dtos.ErrResp "unique key violation"
// @failure 422 {object} dtos.ErrResp "request body in wrong format"
// @failure 500 {object} dtos.ErrResp "internal server error"
// @router /characters [post]
func (cc CharactersController) Create(c *gin.Context) {
	path := c.Request.URL.Path

	var body dtos.CharacterCreateDTO
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusUnprocessableEntity, dtos.NewErrResp(err.Error(), path))
		return
	}

	newCharacter := dtos.CreateDTOToCharacter(body)
	if err := cc.charactersBaseRepo.Create(c.Request.Context(), newCharacter); err != nil {
		if errors.Is(err, gorm.ErrDuplicatedKey) {
			c.JSON(http.StatusConflict, dtos.NewErrResp("Character with given name alreaddy exists", path))
			return
		}
		c.JSON(http.StatusInternalServerError, dtos.NewErrResp(err.Error(), path))
		return
	}

	c.JSON(http.StatusCreated, dtos.CharacterToDTO(*newCharacter))
}

// @description Reads characters
// @tags characters
// @accept json
// @produce json
// @success 200 {array} dtos.CharacterReadDTO "returns all characters"
// @failure 401 {object} dtos.ErrResp "unauthorized"
// @failure 500 {object} dtos.ErrResp "internal server error"
// @router /characters [get]
func (cc CharactersController) ReadAll(c *gin.Context) {
	characters, err := cc.charactersBaseRepo.ReadAll(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, dtos.NewErrResp(err.Error(), c.Request.URL.Path))
		return
	}

	c.JSON(http.StatusOK, utils.Map(characters, dtos.CharacterToDTO))
}

// @description Reads a character by it's id
// @tags characters
// @accept json
// @produce json
// @param id path int true "the id of the desired character"
// @success 200 {object} dtos.CharacterReadDTO "returns the desired character"
// @failure 401 {object} dtos.ErrResp "unauthorized"
// @failure 404 {object} dtos.ErrResp "record not found"
// @failure 500 {object} dtos.ErrResp "internal server error"
// @router /characters/{id} [get]
func (cc CharactersController) ReadByID(c *gin.Context) {
	path := c.Request.URL.Path
	id, _ := c.Get("id")

	character, err := cc.charactersBaseRepo.ReadByID(c.Request.Context(), id.(uint))
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, dtos.NewErrResp("Character with given id not found", path))
			return
		}
		c.JSON(http.StatusInternalServerError, dtos.NewErrResp(err.Error(), path))
		return
	}

	c.JSON(http.StatusOK, dtos.CharacterToDTO(character))
}

// @description Updates the character with the given id
// @tags characters
// @accept json
// @produce json
// @param character_update_dto body dtos.CharacterUpdateDTO true "dto for updating a character"
// @param id path int true "id of desired character"
// @success 204 {} nil "doesn't return anything"
// @failure 400 {object} dtos.ErrResp "id from url and id from request body doesn't match"
// @failure 401 {object} dtos.ErrResp "unauthorized"
// @failure 404 {object} dtos.ErrResp "record not found"
// @failure 409 {object} dtos.ErrResp "unique key violation"
// @failure 422 {object} dtos.ErrResp "request body in wrong format"
// @failure 500 {object} dtos.ErrResp "internal server error"
// @router /characters/{id} [put]
func (cc CharactersController) Update(c *gin.Context) {
	path := c.Request.URL.Path
	id, _ := c.Get("id")

	var body dtos.CharacterUpdateDTO
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusUnprocessableEntity, dtos.NewErrResp(err.Error(), path))
		return
	}

	if id.(uint) != body.ID {
		c.JSON(http.StatusBadRequest, dtos.NewErrResp("Id from URL doesn't match id from request body", path))
		return
	}

	if err := cc.charactersBaseRepo.Update(c.Request.Context(), dtos.UpdateDTOToCharacter(body)); err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, dtos.NewErrResp("Character with given id not found", path))
			return
		}
		if errors.Is(err, gorm.ErrDuplicatedKey) {
			c.JSON(http.StatusConflict, dtos.NewErrResp("Chracter with given name already exists", path))
			return
		}
		c.JSON(http.StatusInternalServerError, dtos.NewErrResp(err.Error(), path))
		return
	}

	c.Status(http.StatusNoContent)
}

// @description Deletes a character with the given id
// @tags characters
// @accept json
// @produce json
// @param id path int true "id of desired character"
// @success 204 {} nil "doesn't return anything"
// @failure 401 {object} dtos.ErrResp "unauthorized"
// @failure 404 {object} dtos.ErrResp "record not found"
// @failure 500 {object} dtos.ErrResp "internal server error"
// @router /characters/{id} [delete]
func (cc CharactersController) Delete(c *gin.Context) {
	path := c.Request.URL.Path
	id, _ := c.Get("id")

	if err := cc.charactersBaseRepo.Delete(c.Request.Context(), id.(uint)); err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, dtos.NewErrResp("Character with given id not found", path))
			return
		}
		c.JSON(http.StatusInternalServerError, dtos.NewErrResp(err.Error(), path))
		return
	}

	c.Status(http.StatusNoContent)
}

// @description Uploads an image for the character with given id
// @tags characters
// @accept mpfd
// @produce json
// @param id path int true "id of desired character"
// @success 201 {object} string "returns newly created image's URI"
// @failure 400 {object} dtos.ErrResp "no file sent"
// @failure 401 {object} dtos.ErrResp "unauthorized"
// @failure 415 {object} dtos.ErrResp "invalid media type"
// @failure 500 {object} dtos.ErrResp "internal server error"
// @router /characters/{id}/img [post]
func (cc CharactersController) UploadImg(c *gin.Context) {
	path := c.Request.URL.Path
	id, _ := c.Get("id")

	file, err := c.FormFile("CharacterImage")
	if err != nil {
		c.JSON(http.StatusBadRequest, dtos.NewErrResp("No file uploaded", path))
		return
	}

	uri, err := utils.SaveFileToDisc(c, file, utils.CHARACTER_IMAGE)
	if err != nil {
		if errors.Is(err, utils.ErrUnsupportedMediaType) {
			c.JSON(http.StatusUnsupportedMediaType, dtos.NewErrResp(err.Error(), path))
			return
		}
		c.JSON(http.StatusInternalServerError, dtos.NewErrResp(err.Error(), path))
		return
	}

	if err := cc.charactersBaseRepo.UpdateOne(c.Request.Context(), id.(uint), "img_uri", uri); err != nil {
		c.JSON(http.StatusInternalServerError, dtos.NewErrResp(err.Error(), path))
		return
	}

	c.String(http.StatusCreated, *uri)
}

// @description Returns an uploaded character image
// @tags characters
// @accept json
// @produce mpfd
// @param id path int true "id of desired character"
// @failure 404 {object} dtos.ErrResp "record not found"
// @failure 500 {object} dtos.ErrResp "internal server error"
// @router /characters/{id}/img [get]
func (cc CharactersController) ReadImg(c *gin.Context) {
	path := c.Request.URL.Path
	id, _ := c.Get("id")

	character, err := cc.charactersBaseRepo.ReadByID(c.Request.Context(), id.(uint))
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, dtos.NewErrResp("Character with given id not found", path))
			return
		}
		c.JSON(http.StatusInternalServerError, dtos.NewErrResp(err.Error(), path))
		return
	}

	if character.ImgURI == "" {
		c.JSON(http.StatusNotFound, dtos.NewErrResp("Given character has no uploaded image", path))
		return
	}

	if _, err := os.Stat(character.ImgURI); err != nil {
		if errors.Is(err, os.ErrNotExist) {
			c.JSON(http.StatusNotFound, dtos.NewErrResp("Image of given character cannot be found", path))
			return
		}
		c.JSON(http.StatusInternalServerError, dtos.NewErrResp("File is corrupt: "+err.Error(), path))
		return
	}

	c.File(character.ImgURI)
}

func (cc CharactersController) MountRoutes(apiGroup *gin.RouterGroup) {
	characters := apiGroup.Group("/characters")
	characters.POST("", middlewares.Authorize(middlewares.ADMIN), cc.Create)
	characters.GET("", middlewares.Authorize(middlewares.ADMIN), cc.ReadAll)
	characters.GET("/:id", middlewares.Authorize(middlewares.ANY), middlewares.ValidateUrl, cc.ReadByID)
	characters.PUT("/:id", middlewares.Authorize(middlewares.ADMIN), middlewares.ValidateUrl, cc.Update)
	characters.DELETE("/:id", middlewares.Authorize(middlewares.ADMIN), middlewares.ValidateUrl, cc.Delete)
	characters.POST("/:id/img", middlewares.Authorize(middlewares.ANY), middlewares.ValidateUrl, cc.UploadImg)
	characters.GET("/:id/img", middlewares.Authorize(middlewares.ANY), middlewares.ValidateUrl, cc.ReadImg)
}
