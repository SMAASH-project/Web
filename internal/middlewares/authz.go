package middlewares

import (
	"net/http"
	"os"
	dtos "smaash-web/internal/DTOs"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

func Authorize(c *gin.Context) {
	var rawToken string
	path := c.Request.URL.Path

	// Check if token is sent in cookie, and prioritize it's handling over header
	rawToken, err := c.Cookie("Authorization")
	if err != nil {
		// Check authorization header, if no authorization cookie found
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			// Neither cookie, nor auth header found
			c.JSON(http.StatusUnauthorized, dtos.NewErrResp("No authorization token provided", path))
			c.Abort()
			return
		}
		rawToken = strings.TrimPrefix(authHeader, "Bearer ")
		if authHeader == rawToken {
			c.JSON(http.StatusUnauthorized, dtos.NewErrResp("Authorization header is in wrong format - Bearer prefix is required", path))
			c.Abort()
			return
		}
	}

	token, err := jwt.Parse(rawToken, func(token *jwt.Token) (any, error) {
		return []byte(os.Getenv("SECRET_KEY")), nil
	}, jwt.WithValidMethods([]string{"HS256"}))

	if err != nil {
		c.JSON(http.StatusUnauthorized, dtos.NewErrResp("Invalid token", c.Request.URL.Path))
		c.Abort()
		return
	}

	if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
		if float64(time.Now().Unix()) > claims["exp"].(float64) {
			c.JSON(http.StatusUnauthorized, dtos.NewErrResp("Authorization token expired", c.Request.URL.Path))
			c.Abort()
			return
		}

		c.Set("caller_id", uint(claims["sub"].(float64))) // ugghh go type system
		c.Next()
	} else {
		c.JSON(http.StatusUnauthorized, dtos.NewErrResp("Invalid token claims", c.Request.URL.Path))
		c.Abort()
		return
	}
}
