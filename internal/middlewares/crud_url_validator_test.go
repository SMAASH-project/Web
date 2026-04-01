package middlewares_test

import (
	"net/http"
	"net/http/httptest"
	"smaash-web/internal/middlewares"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
)

func TestUrlValidator(t *testing.T) {
	gin.SetMode(gin.TestMode)

	r := gin.New()
	r.GET("/some/:id", middlewares.ValidateUrl, func(ctx *gin.Context) { ctx.String(200, "Endpoint hit") })

	w := httptest.NewRecorder()
	req, _ := http.NewRequest("GET", "/some/2", nil)
	r.ServeHTTP(w, req)

	assert.Equal(t, 200, w.Code)
	assert.Equal(t, "Endpoint hit", w.Body.String())

	w2 := httptest.NewRecorder()
	badReq, _ := http.NewRequest("GET", "/some/asd", nil)
	r.ServeHTTP(w2, badReq)

	assert.Equal(t, 400, w2.Code)

	w3 := httptest.NewRecorder()
	badReqBinary, _ := http.NewRequest("GET", "/some/0b0101", nil)
	r.ServeHTTP(w3, badReqBinary)

	assert.Equal(t, 400, w3.Code)
}
