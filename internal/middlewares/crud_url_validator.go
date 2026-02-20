package middlewares

import (
	"net/http"
	dtos "smaash-web/internal/DTOs"
	"strconv"

	"github.com/gin-gonic/gin"
)

func ValidateUrl(c *gin.Context) {
	id := c.Param("id")

	if id != "" {
		res, err := strconv.Atoi(id)
		if err != nil {
			c.JSON(http.StatusBadRequest, dtos.NewErrResp(err.Error(), c.Request.URL.Path))
			c.Abort()
			return
		}

		c.Set("id", uint(res))
		c.Next()
	}
}
