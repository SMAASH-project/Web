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
