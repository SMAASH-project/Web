package controllers

import (
	"errors"
	"net/http"
	dtos "smaash-web/internal/DTOs"
	"smaash-web/internal/middlewares"
	"smaash-web/internal/models"
	"smaash-web/internal/repository"
	"smaash-web/internal/utils"

	"github.com/gin-gonic/gin"
	"github.com/webstradev/gin-pagination/v2/pkg/pagination"
	"gorm.io/gorm"
)

type ItemsController struct {
	itemsBaseRepo repository.BaseRepository[models.Item]
	rarityRepo    repository.RarityRepository
	categoryRepo  repository.CategoryRepository
}

func NewItemsController(
	itemsBaseRepo repository.BaseRepository[models.Item],
	rarityRepo repository.RarityRepository,
	categoryRepo repository.CategoryRepository,
) *ItemsController {
	return &ItemsController{
		itemsBaseRepo: itemsBaseRepo,
		rarityRepo:    rarityRepo,
		categoryRepo:  categoryRepo,
	}
}

func (ic ItemsController) Create(c *gin.Context) {
	path := c.Request.URL.Path
	var body dtos.ItemCreateDTO

	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, dtos.NewErrResp(err.Error(), path))
		return
	}

	newItem, err := dtos.CreateDTOToItem(body, ic.rarityRepo.ReadByName, ic.categoryRepo.ReadByName)
	if err != nil {
		c.JSON(http.StatusBadRequest, dtos.NewErrResp("Specified rarity or category doesn't exist", path))
		return
	}

	if err := ic.itemsBaseRepo.Create(c.Request.Context(), newItem); err != nil {
		if errors.Is(err, gorm.ErrDuplicatedKey) {
			c.JSON(http.StatusConflict, dtos.NewErrResp("Item with given name already exists", path))
			return
		}
		c.JSON(http.StatusInternalServerError, dtos.NewErrResp(err.Error(), path))
		return
	}

	withIncludes, _ := ic.itemsBaseRepo.ReadByID(c.Request.Context(), newItem.ID, "Rarity", "Categories")

	c.JSON(http.StatusCreated, dtos.ItemToDTO(withIncludes))
}

func (ic ItemsController) ReadAll(c *gin.Context) {
	page, _ := c.Get("page")
	size, _ := c.Get("size")
	items, err := ic.itemsBaseRepo.ReadAllPaginated(c.Request.Context(), page.(int), size.(int), "Rarity", "Categories")
	if err != nil {
		c.JSON(http.StatusInternalServerError, dtos.NewErrResp(err.Error(), c.Request.URL.Path))
		return
	}

	c.JSON(http.StatusOK, utils.Map(items, dtos.ItemToDTO))
}

func (ic ItemsController) ReadByID(c *gin.Context) {
	path := c.Request.URL.Path
	id, _ := c.Get("id")

	item, err := ic.itemsBaseRepo.ReadByID(c.Request.Context(), id.(uint), "Rarity", "Categories")
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, dtos.NewErrResp("Item with given id not found", path))
			return
		}
		c.JSON(http.StatusInternalServerError, dtos.NewErrResp(err.Error(), path))
		return
	}

	c.JSON(http.StatusOK, dtos.ItemToDTO(item))
}

func (ic ItemsController) Update(c *gin.Context) {
	path := c.Request.URL.Path
	id, _ := c.Get("id")

	var body dtos.ItemUpdateDTO
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, dtos.NewErrResp(err.Error(), path))
		return
	}

	if id.(uint) != body.ID {
		c.JSON(http.StatusBadRequest, dtos.NewErrResp("Id from request body doesn't match id from url", path))
		return
	}

	updatedItem, err := dtos.UpdateDTOToItem(body, ic.rarityRepo.ReadByName, ic.categoryRepo.ReadByName)
	if err != nil {
		c.JSON(http.StatusBadRequest, dtos.NewErrResp("Specified rarity or category doesn't exist", path))
		return
	}

	if err := ic.itemsBaseRepo.Update(c.Request.Context(), *updatedItem); err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, dtos.NewErrResp("Item with provided id not found", path))
			return
		}
		if errors.Is(err, gorm.ErrDuplicatedKey) {
			c.JSON(http.StatusConflict, dtos.NewErrResp("Item with given name already exists", path))
			return
		}
		c.JSON(http.StatusInternalServerError, dtos.NewErrResp(err.Error(), path))
		return
	}

	c.Status(http.StatusNoContent)
}

func (ic ItemsController) Delete(c *gin.Context) {
	path := c.Request.URL.Path
	id, _ := c.Get("id")

	if err := ic.itemsBaseRepo.Delete(c.Request.Context(), id.(uint)); err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, dtos.NewErrResp("Item with given id not found", path))
			return
		}
		c.JSON(http.StatusInternalServerError, dtos.NewErrResp(err.Error(), path))
		return
	}

	c.Status(http.StatusNoContent)
}

func (ic ItemsController) MountRoutes(apiGroup *gin.RouterGroup) {
	items := apiGroup.Group("/items")
	items.POST("", middlewares.Authorize(middlewares.ADMIN), ic.Create)
	items.GET("", middlewares.Authorize(middlewares.ANY), pagination.New(), ic.ReadAll)
	items.GET("/:id", middlewares.Authorize(middlewares.ANY), middlewares.ValidateUrl, ic.ReadByID)
	items.PUT("/:id", middlewares.Authorize(middlewares.ADMIN), middlewares.ValidateUrl, ic.Update)
	items.DELETE("/:id", middlewares.Authorize(middlewares.ADMIN), middlewares.ValidateUrl, ic.Delete)
}
