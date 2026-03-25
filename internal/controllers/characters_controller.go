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

func (cc CharactersController) ReadAll(c *gin.Context) {
	characters, err := cc.charactersBaseRepo.ReadAll(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, dtos.NewErrResp(err.Error(), c.Request.URL.Path))
		return
	}

	c.JSON(http.StatusOK, utils.Map(characters, dtos.CharacterToDTO))
}

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
