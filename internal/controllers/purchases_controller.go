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
	"gorm.io/gorm"
)

type PurchasesController struct {
	purchasesBaseRepo repository.BaseRepository[models.Purchase]
	profilesBaseRepo  repository.BaseRepository[models.PlayerProfile]
}

func NewPurchasesController(purchasesBaseRepo repository.BaseRepository[models.Purchase], profilesBaseRepo repository.BaseRepository[models.PlayerProfile]) *PurchasesController {
	return &PurchasesController{purchasesBaseRepo: purchasesBaseRepo, profilesBaseRepo: profilesBaseRepo}
}

func (pc PurchasesController) Create(c *gin.Context) {
	path := c.Request.URL.Path

	var body dtos.PurchaseCreateDTO
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusUnprocessableEntity, dtos.NewErrResp(err.Error(), path))
		return
	}

	newPurchase, err := dtos.CreateDTOToPurchase(body)
	if errors.Is(err, dtos.ErrDateFormatIncorrect) {
		c.JSON(http.StatusUnprocessableEntity, dtos.NewErrResp(err.Error(), path))
		return
	}
	err = pc.purchasesBaseRepo.Create(c.Request.Context(), newPurchase)
	if err != nil {
		if errors.Is(err, gorm.ErrDuplicatedKey) {
			c.JSON(http.StatusConflict, dtos.NewErrResp(err.Error(), path))
			return
		}
		c.JSON(http.StatusInternalServerError, dtos.NewErrResp(err.Error(), path))
		return
	}
	currentProfile, err := pc.profilesBaseRepo.ReadByID(c.Request.Context(), newPurchase.PlayerProfileID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, dtos.NewErrResp("Player profile with given id not found", path))
			return
		}
		c.JSON(http.StatusInternalServerError, dtos.NewErrResp(err.Error(), path))
		return
	}
	result, _ := pc.purchasesBaseRepo.ReadByID(c.Request.Context(), newPurchase.ID, "Item", "PlayerProfile")
	dto := dtos.PurchaseToDTO(result)
	currentProfile.Coins -= int64(dto.Total)
	if err := pc.profilesBaseRepo.Update(c.Request.Context(), currentProfile); err != nil {
		c.JSON(http.StatusInternalServerError, dtos.NewErrResp(err.Error(), path))
		return
	}

	c.JSON(http.StatusCreated, dto)
}

func (pc PurchasesController) ReadAll(c *gin.Context) {
	purchases, err := pc.purchasesBaseRepo.ReadAll(c.Request.Context(), "Item", "PlayerProfile")
	if err != nil {
		c.JSON(http.StatusInternalServerError, dtos.NewErrResp(err.Error(), c.Request.URL.Path))
		return
	}

	c.JSON(http.StatusOK, utils.Map(purchases, dtos.PurchaseToDTO))
}

func (pc PurchasesController) ReadByID(c *gin.Context) {
	path := c.Request.URL.Path
	id, _ := c.Get("id")

	purchase, err := pc.purchasesBaseRepo.ReadByID(c.Request.Context(), id.(uint), "Item", "PlayerProfile")
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, dtos.NewErrResp("Purchase with given id not found", path))
		}
		c.JSON(http.StatusInternalServerError, dtos.NewErrResp(err.Error(), path))
		return
	}

	c.JSON(http.StatusOK, dtos.PurchaseToDTO(purchase))
}

func (pc PurchasesController) Update(c *gin.Context) {
	path := c.Request.URL.Path
	id, _ := c.Get("id")

	var body dtos.PurchaseUpdateDTO
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusUnprocessableEntity, dtos.NewErrResp(err.Error(), path))
		return
	}

	if body.ID != id.(uint) {
		c.JSON(http.StatusBadRequest, dtos.NewErrResp("Id from URL doesn't match id from request body", path))
		return
	}

	updatedPurchase, err := dtos.UpdateDTOToPurchase(body)
	if errors.Is(err, dtos.ErrDateFormatIncorrect) {
		c.JSON(http.StatusBadRequest, dtos.NewErrResp(err.Error(), path))
		return
	}

	if err := pc.purchasesBaseRepo.Update(c.Request.Context(), *updatedPurchase); err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, dtos.NewErrResp("Purchase with given id not found", path))
			return
		}
		if errors.Is(err, gorm.ErrDuplicatedKey) {
			c.JSON(http.StatusConflict, dtos.NewErrResp(err.Error(), path))
			return
		}
		c.JSON(http.StatusInternalServerError, dtos.NewErrResp(err.Error(), path))
		return
	}

	c.Status(http.StatusNoContent)
}

func (pc PurchasesController) Delete(c *gin.Context) {
	path := c.Request.URL.Path
	id, _ := c.Get("id")

	if err := pc.purchasesBaseRepo.Delete(c.Request.Context(), id.(uint)); err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, dtos.NewErrResp("Purchase with given id not found", path))
			return
		}
		c.JSON(http.StatusInternalServerError, dtos.NewErrResp(err.Error(), path))
		return
	}

	c.Status(http.StatusNoContent)
}

func (pc PurchasesController) MountRoutes(apiGroup *gin.RouterGroup) {
	purchases := apiGroup.Group("/purchases")
	purchases.POST("", middlewares.Authorize(middlewares.ANY), pc.Create)
	purchases.GET("", middlewares.Authorize(middlewares.ADMIN), pc.ReadAll)
	purchases.GET("/:id", middlewares.Authorize(middlewares.ADMIN), middlewares.ValidateUrl, pc.ReadByID)
	purchases.PUT("/:id", middlewares.Authorize(middlewares.ADMIN), middlewares.ValidateUrl, pc.Update)
	purchases.DELETE("/:id", middlewares.Authorize(middlewares.ADMIN), middlewares.ValidateUrl, pc.Delete)
}
