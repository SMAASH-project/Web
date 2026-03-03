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

type RolesController struct {
	baseRepoActions *repository.BaseRepositoryActions[models.Role]
}

func NewRolesController(baseRepoActions *repository.BaseRepositoryActions[models.Role]) *RolesController {
	return &RolesController{baseRepoActions: baseRepoActions}
}

// @description Creates a new role
// @tags roles
// @accept json
// @produce json
// @param role_create_dto body dtos.RoleCreateDTO true "dto for creating a new role"
// @success 201 {object} dtos.RoleReadDTO "returns newly created role"
// @failure 400 {object} dtos.ErrResp "request body in wrong format"
// @failure 401 {object} dtos.ErrResp "unauthorized"
// @failure 409 {object} dtos.ErrResp "unique key violation"
// @failure 500 {object} dtos.ErrResp "internal server error"
// @router /roles [post]
func (rc RolesController) Create(c *gin.Context) {
	path := c.Request.URL.Path

	var body dtos.RoleCreateDTO
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, dtos.NewErrResp(err.Error(), path))
		return
	}

	newRole := dtos.CreateDTOToRole(body)
	if err := rc.baseRepoActions.Create(c.Request.Context(), newRole); err != nil {
		if errors.Is(err, gorm.ErrDuplicatedKey) {
			c.JSON(http.StatusConflict, dtos.NewErrResp("A role with such name already exists", path))
			return
		}
		c.JSON(http.StatusInternalServerError, dtos.NewErrResp(err.Error(), path))
		return
	}

	c.JSON(http.StatusCreated, dtos.RoleToDTO(*newRole))
}

// @description Reads all roles
// @tags roles
// @accept json
// @produce json
// @success 200 {array} dtos.RoleReadDTO "returns newly created role"
// @failure 401 {object} dtos.ErrResp "unauthorized"
// @failure 500 {object} dtos.ErrResp "internal server error"
// @router /roles [get]
func (rc RolesController) ReadAll(c *gin.Context) {
	path := c.Request.URL.Path

	res, err := rc.baseRepoActions.ReadAll(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, dtos.NewErrResp(err.Error(), path))
		return
	}

	c.JSON(http.StatusOK, utils.Map(res, func(r models.Role) dtos.RoleReadDTO { return dtos.RoleToDTO(r) }))
}

// @description Reads a role by it's id
// @tags roles
// @accept json
// @produce json
// @param id path int true "the id of the desired role"
// @success 200 {object} dtos.RoleReadDTO "returns the desired role"
// @failure 401 {object} dtos.ErrResp "unauthorized"
// @failure 404 {object} dtos.ErrResp "record not found"
// @failure 500 {object} dtos.ErrResp "internal server error"
// @router /roles/{id} [get]
func (rc RolesController) ReadByID(c *gin.Context) {
	path := c.Request.URL.Path
	id, _ := c.Get("id")

	res, err := rc.baseRepoActions.ReadByID(c.Request.Context(), id.(uint))
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, dtos.NewErrResp("Record not found", path))
			return
		}
		c.JSON(http.StatusInternalServerError, dtos.NewErrResp(err.Error(), path))
		return
	}

	c.JSON(http.StatusOK, dtos.RoleToDTO(res))
}

// @description Updates the role with the given id
// @tags roles
// @accept json
// @produce json
// @param role_update_dto body dtos.RoleUpdateDTO true "dto for updating a role"
// @param id path int true "id of desired role"
// @success 204 {} nil "doesn't return anything"
// @failure 400 {object} dtos.ErrResp "request body in wrong format"
// @failure 400 {object} dtos.ErrResp "id from url and id from request body doesn't match"
// @failure 401 {object} dtos.ErrResp "unauthorized"
// @failure 404 {object} dtos.ErrResp "record not found"
// @failure 409 {object} dtos.ErrResp "unique key violation"
// @failure 500 {object} dtos.ErrResp "internal server error"
// @router /roles/{id} [put]
func (rc RolesController) Update(c *gin.Context) {
	path := c.Request.URL.Path
	id, _ := c.Get("id")

	var body dtos.RoleUpdateDTO
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, dtos.NewErrResp(err.Error(), path))
		return
	}

	if body.ID != id.(uint) {
		c.JSON(http.StatusBadRequest, dtos.NewErrResp("Id from URL doesn't match id from request body", path))
		return
	}

	if err := rc.baseRepoActions.Update(c, dtos.UpdateDTOToRole(body)); err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, dtos.NewErrResp("Record not found", path))
			return
		}
		if errors.Is(err, gorm.ErrDuplicatedKey) {
			c.JSON(http.StatusConflict, dtos.NewErrResp("Role With such name already exists", path))
			return
		}
		c.JSON(http.StatusInternalServerError, dtos.NewErrResp(err.Error(), path))
		return
	}

	c.Status(http.StatusNoContent)
}

// @description Deletes a role with the given id
// @tags roles
// @accept json
// @produce json
// @param id path int true "id of desired role"
// @success 204 {} nil "doesn't return anything"
// @failure 401 {object} dtos.ErrResp "unauthorized"
// @failure 404 {object} dtos.ErrResp "record not found"
// @failure 500 {object} dtos.ErrResp "internal server error"
// @router /roles/{id} [delete]
func (rc RolesController) Delete(c *gin.Context) {
	path := c.Request.URL.Path
	id, _ := c.Get("id")

	if err := rc.baseRepoActions.Delete(c, id.(uint)); err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, dtos.NewErrResp("Record not found", path))
			return
		}
		c.JSON(http.StatusInternalServerError, dtos.NewErrResp(err.Error(), path))
		return
	}

	c.Status(http.StatusNoContent)
}
