package middlewares_test

import (
	"net/http"
	"net/http/httptest"
	"os"
	"smaash-web/internal/middlewares"
	"testing"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/stretchr/testify/assert"
)

func TestAuthorization(t *testing.T) {
	gin.SetMode(gin.TestMode)

	r := gin.New()
	r.GET("/admin", middlewares.Authorize(middlewares.ADMIN), func(ctx *gin.Context) { ctx.String(200, "Admin endpoint hit") })
	r.GET("/user", middlewares.Authorize(middlewares.USER), func(ctx *gin.Context) { ctx.String(200, "User endpoint hit") })
	r.GET("/any", middlewares.Authorize(middlewares.ANY), func(ctx *gin.Context) { ctx.String(200, "Any endpoint hit") })

	// No token
	w1 := httptest.NewRecorder()
	reqNoToken, _ := http.NewRequest("GET", "/any", nil)
	r.ServeHTTP(w1, reqNoToken)
	assert.Equal(t, 401, w1.Code)

	// Expired token
	expiredToken := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"sub":  2,
		"exp":  time.Now().Add(-5 * time.Minute).Unix(),
		"role": "user",
	})

	key := os.Getenv("SECRET_KEY")
	if key == "" {
		key = "super_secret_key"
	}
	expiredTokenString, _ := expiredToken.SignedString([]byte(key))

	reqExpired, _ := http.NewRequest("GET", "/any", nil)
	reqExpired.Header.Set("Authorization", "Bearer "+expiredTokenString)
	w2 := httptest.NewRecorder()
	r.ServeHTTP(w2, reqExpired)
	assert.Equal(t, 401, w2.Code)

	// Invalid privilage
	underprivilagedToken := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"sub":  1,
		"exp":  time.Now().Add(5 * time.Hour).Unix(),
		"role": "user",
	})
	underprivilagedTokenString, _ := underprivilagedToken.SignedString([]byte(key))

	reqNoPrivilage, _ := http.NewRequest("GET", "/admin", nil)
	reqNoPrivilage.Header.Set("Authorization", "Bearer "+underprivilagedTokenString)
	w3 := httptest.NewRecorder()
	r.ServeHTTP(w3, reqNoPrivilage)
	assert.Equal(t, 401, w3.Code)

	// No bearer field set
	reqNoBearer, _ := http.NewRequest("GET", "/user", nil)
	reqNoBearer.Header.Set("Authorization", underprivilagedTokenString)
	w4 := httptest.NewRecorder()
	r.ServeHTTP(w4, reqNoBearer)
	assert.Equal(t, 401, w4.Code)
}
