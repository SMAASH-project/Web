package controllers

import (
	"errors"
	"net/http"
	dtos "smaash-web/internal/DTOs"
	"smaash-web/internal/models"
	"smaash-web/internal/repository"
	"smaash-web/internal/utils"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type CategoriesController struct {
	categoryBaseRepo repository.BaseRepository[models.Category]
}

func NewCategoriesController(categoryBaseRepo repository.BaseRepository[models.Category]) *CategoriesController {
	return &CategoriesController{categoryBaseRepo: categoryBaseRepo}
}

// @description Creates a new category
// @tags categories
// @accept json
// @produce json
// @param category_create_dto body dtos.CategoryCreateDTO true "dto for creating a new category"
// @success 201 {object} dtos.CategoryReadDTO "returns newly created category"
// @failure 400 {object} dtos.ErrResp "request body in wrong format"
// @failure 401 {object} dtos.ErrResp "unauthorized"
// @failure 409 {object} dtos.ErrResp "unique key violation"
// @failure 500 {object} dtos.ErrResp "internal server error"
// @router /categories [post]
func (cc CategoriesController) Create(c *gin.Context) {
	path := c.Request.URL.Path

	var body dtos.CategoryCreateDTO
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, dtos.NewErrResp(err.Error(), path))
		return
	}

	newCategory := dtos.CreateDTOToCategory(body)
	if err := cc.categoryBaseRepo.Create(c.Request.Context(), newCategory); err != nil {
		if errors.Is(err, gorm.ErrDuplicatedKey) {
			c.JSON(http.StatusConflict, dtos.NewErrResp("A category with such name already exists", path))
			return
		}
		c.JSON(http.StatusInternalServerError, dtos.NewErrResp(err.Error(), path))
		return
	}

	c.JSON(http.StatusCreated, dtos.CategoryToDTO(*newCategory))
}

// @description Reads categories
// @tags categories
// @accept json
// @produce json
// @success 200 {array} dtos.CategoryReadDTO "returns all categories"
// @failure 401 {object} dtos.ErrResp "unauthorized"
// @failure 500 {object} dtos.ErrResp "internal server error"
// @router /categories [get]
func (rc CategoriesController) ReadAll(c *gin.Context) {
	path := c.Request.URL.Path

	res, err := rc.categoryBaseRepo.ReadAll(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, dtos.NewErrResp(err.Error(), path))
		return
	}

	c.JSON(http.StatusOK, utils.Map(res, func(c models.Category) dtos.CategoryReadDTO { return dtos.CategoryToDTO(c) }))
}

// @description Reads a category by it's id
// @tags categories
// @accept json
// @produce json
// @param id path int true "the id of the desired category"
// @success 200 {object} dtos.CategoryReadDTO "returns the desired category"
// @failure 401 {object} dtos.ErrResp "unauthorized"
// @failure 404 {object} dtos.ErrResp "record not found"
// @failure 500 {object} dtos.ErrResp "internal server error"
// @router /categories/{id} [get]
func (rc CategoriesController) ReadByID(c *gin.Context) {
	path := c.Request.URL.Path
	id, _ := c.Get("id")

	res, err := rc.categoryBaseRepo.ReadByID(c.Request.Context(), id.(uint))
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, dtos.NewErrResp("Record not found", path))
			return
		}
		c.JSON(http.StatusInternalServerError, dtos.NewErrResp(err.Error(), path))
		return
	}

	c.JSON(http.StatusOK, dtos.CategoryToDTO(res))
}

// @description Updates the category with the given id
// @tags categories
// @accept json
// @produce json
// @param category_update_dto body dtos.CategoryUpdateDTO true "dto for updating a category"
// @param id path int true "id of desired category"
// @success 204 {} nil "doesn't return anything"
// @failure 400 {object} dtos.ErrResp "request body in wrong format"
// @failure 400 {object} dtos.ErrResp "id from url and id from request body doesn't match"
// @failure 401 {object} dtos.ErrResp "unauthorized"
// @failure 404 {object} dtos.ErrResp "record not found"
// @failure 409 {object} dtos.ErrResp "unique key violation"
// @failure 500 {object} dtos.ErrResp "internal server error"
// @router /categories/{id} [put]
func (rc CategoriesController) Update(c *gin.Context) {
	path := c.Request.URL.Path
	id, _ := c.Get("id")

	var body dtos.CategoryUpdateDTO
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, dtos.NewErrResp(err.Error(), path))
		return
	}

	if body.ID != id.(uint) {
		c.JSON(http.StatusBadRequest, dtos.NewErrResp("Id from URL doesn't match id from request body", path))
		return
	}

	if err := rc.categoryBaseRepo.Update(c, dtos.UpdateDTOToCategory(body)); err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, dtos.NewErrResp("Record not found", path))
			return
		}
		if errors.Is(err, gorm.ErrDuplicatedKey) {
			c.JSON(http.StatusConflict, dtos.NewErrResp("Category with such name already exists", path))
			return
		}
		c.JSON(http.StatusInternalServerError, dtos.NewErrResp(err.Error(), path))
		return
	}

	c.Status(http.StatusNoContent)
}

// @description Deletes a category with the given id
// @tags categories
// @accept json
// @produce json
// @param id path int true "id of desired category"
// @success 204 {} nil "doesn't return anything"
// @failure 401 {object} dtos.ErrResp "unauthorized"
// @failure 404 {object} dtos.ErrResp "record not found"
// @failure 500 {object} dtos.ErrResp "internal server error"
// @router /categories/{id} [delete]
func (rc CategoriesController) Delete(c *gin.Context) {
	path := c.Request.URL.Path
	id, _ := c.Get("id")

	if err := rc.categoryBaseRepo.Delete(c, id.(uint)); err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, dtos.NewErrResp("Record not found", path))
			return
		}
		c.JSON(http.StatusInternalServerError, dtos.NewErrResp(err.Error(), path))
		return
	}

	c.Status(http.StatusNoContent)
}
