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

type PostsController struct {
	postsBaseRepo repository.BaseRepository[models.Post]
}

func NewPostsController(postsBaseRepo repository.BaseRepository[models.Post]) *PostsController {
	return &PostsController{postsBaseRepo: postsBaseRepo}
}

// @description Creates a new post
// @tags posts
// @accept json
// @produce json
// @param post_create_dto body dtos.PostCreateDTO true "dto for creating a new post"
// @success 201 {object} dtos.PostReadDTO "returns newly created post"
// @failure 401 {object} dtos.ErrResp "unauthorized"
// @failure 409 {object} dtos.ErrResp "unique key violation"
// @failure 422 {object} dtos.ErrResp "request body in wrong format"
// @failure 500 {object} dtos.ErrResp "internal server error"
// @router /posts [post]
func (pc PostsController) Create(c *gin.Context) {
	path := c.Request.URL.Path

	var body dtos.PostCreateDTO
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusUnprocessableEntity, dtos.NewErrResp(err.Error(), path))
		return
	}

	newPost := dtos.CreateDTOToPost(body)
	if err := pc.postsBaseRepo.Create(c.Request.Context(), newPost); err != nil {
		c.JSON(http.StatusInternalServerError, dtos.NewErrResp(err.Error(), path))
		return
	}

	c.JSON(http.StatusCreated, dtos.PostToDTO(*newPost))
}

// @description Reads all posts
// @tags posts
// @accept json
// @produce json
// @success 200 {array} dtos.PostReadDTO "returns all posts"
// @failure 401 {object} dtos.ErrResp "unauthorized"
// @failure 500 {object} dtos.ErrResp "internal server error"
// @router /posts [get]
func (pc PostsController) ReadAll(c *gin.Context) {
	page, _ := c.Get("page")
	size, _ := c.Get("size")

	posts, err := pc.postsBaseRepo.ReadAllPaginated(c.Request.Context(), page.(int), size.(int))
	if err != nil {
		c.JSON(http.StatusInternalServerError, dtos.NewErrResp(err.Error(), c.Request.URL.Path))
		return
	}

	c.JSON(http.StatusOK, utils.Map(posts, dtos.PostToDTO))
}

// @description Reads a post by it's id
// @tags posts
// @accept json
// @produce json
// @param id path int true "the id of the desired post"
// @success 200 {object} dtos.PostReadDTO "returns the desired post"
// @failure 401 {object} dtos.ErrResp "unauthorized"
// @failure 404 {object} dtos.ErrResp "record not found"
// @failure 500 {object} dtos.ErrResp "internal server error"
// @router /posts/{id} [get]
func (pc PostsController) ReadByID(c *gin.Context) {
	path := c.Request.URL.Path
	id, _ := c.Get("id")

	post, err := pc.postsBaseRepo.ReadByID(c.Request.Context(), id.(uint))
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, dtos.NewErrResp("Post with given id not found", path))
			return
		}
		c.JSON(http.StatusInternalServerError, dtos.NewErrResp(err.Error(), path))
		return
	}

	c.JSON(http.StatusOK, dtos.PostToDTO(post))
}

// @description Updates the post with the given id
// @tags posts
// @accept json
// @produce json
// @param post_update_dto body dtos.PostUpdateDTO true "dto for updating a post"
// @param id path int true "id of desired post"
// @success 204 {} nil "doesn't return anything"
// @failure 400 {object} dtos.ErrResp "id from url and id from request body doesn't match"
// @failure 401 {object} dtos.ErrResp "unauthorized"
// @failure 404 {object} dtos.ErrResp "record not found"
// @failure 409 {object} dtos.ErrResp "unique key violation"
// @failure 422 {object} dtos.ErrResp "request body in wrong format"
// @failure 500 {object} dtos.ErrResp "internal server error"
// @router /posts/{id} [put]
func (pc PostsController) Update(c *gin.Context) {
	path := c.Request.URL.Path
	id, _ := c.Get("id")

	var body dtos.PostUpdateDTO
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusUnprocessableEntity, dtos.NewErrResp(err.Error(), path))
		return
	}

	if id.(uint) != body.ID {
		c.JSON(http.StatusBadRequest, dtos.NewErrResp("Id from URL doesnt' match id from request body", path))
		return
	}

	if err := pc.postsBaseRepo.Update(c.Request.Context(), dtos.UpdateDTOToPost(body)); err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, dtos.NewErrResp("Post with given id not found", path))
			return
		}
		c.JSON(http.StatusInternalServerError, dtos.NewErrResp(err.Error(), path))
		return
	}

	c.Status(http.StatusNoContent)
}

// @description Deletes a post with the given id
// @tags posts
// @accept json
// @produce json
// @param id path int true "id of desired post"
// @success 204 {} nil "doesn't return anything"
// @failure 401 {object} dtos.ErrResp "unauthorized"
// @failure 404 {object} dtos.ErrResp "record not found"
// @failure 500 {object} dtos.ErrResp "internal server error"
// @router /posts/{id} [delete]
func (pc PostsController) Delete(c *gin.Context) {
	path := c.Request.URL.Path
	id, _ := c.Get("id")

	if err := pc.postsBaseRepo.Delete(c.Request.Context(), id.(uint)); err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, dtos.NewErrResp("Post with given id not found", path))
			return
		}
		c.JSON(http.StatusInternalServerError, dtos.NewErrResp(err.Error(), path))
		return
	}

	c.Status(http.StatusNoContent)
}

func (pc PostsController) MountRoutes(apiGroup *gin.RouterGroup) {
	posts := apiGroup.Group("/posts")
	posts.POST("", middlewares.Authorize(middlewares.ADMIN), pc.Create)
	posts.GET("", middlewares.Authorize(middlewares.ANY), pagination.New(), pc.ReadAll)
	posts.GET("/:id", middlewares.Authorize(middlewares.ANY), middlewares.ValidateUrl, pc.ReadByID)
	posts.PUT("/:id", middlewares.Authorize(middlewares.ADMIN), middlewares.ValidateUrl, pc.Update)
}
