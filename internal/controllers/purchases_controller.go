package controllers

import (
	"errors"
	"log"
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
	purchasesRepo    repository.PurchasesRepository
	profilesBaseRepo repository.BaseRepository[models.PlayerProfile]
}

func NewPurchasesController(purchasesRepo repository.PurchasesRepository, profilesBaseRepo repository.BaseRepository[models.PlayerProfile]) *PurchasesController {
	return &PurchasesController{purchasesRepo: purchasesRepo, profilesBaseRepo: profilesBaseRepo}
}

// @description Creates a new purchase
// @tags purchases
// @accept json
// @produce json
// @param purchase_create_dto body dtos.PurchaseCreateDTO true "dto for creating a new purchase"
// @success 201 {object} dtos.PurchaseReadDTO "returns newly created purchase"
// @failure 401 {object} dtos.ErrResp "unauthorized"
// @failure 409 {object} dtos.ErrResp "unique key violation"
// @failure 422 {object} dtos.ErrResp "request body in wrong format"
// @failure 500 {object} dtos.ErrResp "internal server error"
// @router /purchases [post]
func (pc PurchasesController) Create(c *gin.Context) {
	path := c.Request.URL.Path

	var body dtos.PurchaseCreateDTO
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusUnprocessableEntity, dtos.NewErrResp(err.Error(), path))
		return
	}

	newPurchase, err := pc.purchasesRepo.MakePurchase(c.Request.Context(), *dtos.CreateDTOToPurchase(body))
	switch {
	case errors.Is(err, gorm.ErrRecordNotFound):
		c.JSON(http.StatusNotFound, dtos.NewErrResp("Record with given id not found", path))
		return
	case errors.Is(err, gorm.ErrDuplicatedKey):
		c.JSON(http.StatusConflict, dtos.NewErrResp(err.Error(), path))
		return
	case errors.Is(err, repository.ErrNotEnoughCoins):
		c.JSON(http.StatusForbidden, dtos.NewErrResp(err.Error(), path))
		return
	case err != nil:
		c.JSON(http.StatusInternalServerError, dtos.NewErrResp(err.Error(), path))
		return
	}

	c.JSON(http.StatusCreated, dtos.PurchaseToDTO(*newPurchase))
}

// @description Reads all purchases
// @tags purchases
// @accept json
// @produce json
// @success 200 {array} dtos.PurchaseReadDTO "returns all purchases"
// @failure 401 {object} dtos.ErrResp "unauthorized"
// @failure 500 {object} dtos.ErrResp "internal server error"
// @router /purchases [get]
func (pc PurchasesController) ReadAll(c *gin.Context) {
	log.Println("Purchase controller: ", pc)
	purchases, err := pc.purchasesRepo.ReadAll(c.Request.Context(), "Character", "PlayerProfile")
	if err != nil {
		c.JSON(http.StatusInternalServerError, dtos.NewErrResp(err.Error(), c.Request.URL.Path))
		return
	}

	c.JSON(http.StatusOK, utils.Map(purchases, dtos.PurchaseToDTO))
}

// @description Reads a purchase by it's id
// @tags purchases
// @accept json
// @produce json
// @param id path int true "the id of the desired purchase"
// @success 200 {object} dtos.PurchaseReadDTO "returns the desired purchase"
// @failure 401 {object} dtos.ErrResp "unauthorized"
// @failure 404 {object} dtos.ErrResp "record not found"
// @failure 500 {object} dtos.ErrResp "internal server error"
// @router /purchases/{id} [get]
func (pc PurchasesController) ReadByID(c *gin.Context) {
	path := c.Request.URL.Path
	id, _ := c.Get("id")

	purchase, err := pc.purchasesRepo.ReadByID(c.Request.Context(), id.(uint), "Character", "PlayerProfile")
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, dtos.NewErrResp("Purchase with given id not found", path))
		}
		c.JSON(http.StatusInternalServerError, dtos.NewErrResp(err.Error(), path))
		return
	}

	c.JSON(http.StatusOK, dtos.PurchaseToDTO(purchase))
}

// @description Updates the purchase with the given id
// @tags purchases
// @accept json
// @produce json
// @param purchase_update_dto body dtos.PurchaseUpdateDTO true "dto for updating a purchase"
// @param id path int true "id of desired purchase"
// @success 204 {} nil "doesn't return anything"
// @failure 400 {object} dtos.ErrResp "id from url and id from request body doesn't match"
// @failure 401 {object} dtos.ErrResp "unauthorized"
// @failure 404 {object} dtos.ErrResp "record not found"
// @failure 409 {object} dtos.ErrResp "unique key violation"
// @failure 422 {object} dtos.ErrResp "request body in wrong format"
// @failure 500 {object} dtos.ErrResp "internal server error"
// @router /purchases/{id} [put]
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

	updatedPurchase := dtos.UpdateDTOToPurchase(body)
	if err := pc.purchasesRepo.Update(c.Request.Context(), updatedPurchase); err != nil {
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

// @description Deletes a purchase with the given id
// @tags purchases
// @accept json
// @produce json
// @param id path int true "id of desired purchase"
// @success 204 {} nil "doesn't return anything"
// @failure 401 {object} dtos.ErrResp "unauthorized"
// @failure 404 {object} dtos.ErrResp "record not found"
// @failure 500 {object} dtos.ErrResp "internal server error"
// @router /purchases/{id} [delete]
func (pc PurchasesController) Delete(c *gin.Context) {
	path := c.Request.URL.Path
	id, _ := c.Get("id")

	if err := pc.purchasesRepo.Delete(c.Request.Context(), id.(uint)); err != nil {
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
