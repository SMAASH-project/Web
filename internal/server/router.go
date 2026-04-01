package server

import (
	"net/http"
	"os"
	"smaash-web/docs/swagger"
	"strings"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	swaggerfiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
)

func (s *Server) MountRoutes() *Server {
	appEnv := os.Getenv("APP_ENV")
	if appEnv == "" || strings.ToLower(appEnv) == "release" {
		appEnv = "release"
	} else {
		appEnv = "debug"
	}

	if appEnv == "release" {
		gin.SetMode(gin.ReleaseMode)
	}

	allowedOrigins := strings.Split(os.Getenv("ALLOWED_ORIGINS"), ",")
	if len(allowedOrigins) == 1 && allowedOrigins[0] == "" {
		allowedOrigins = []string{"http://localhost:5173"}
	}

	for i := range allowedOrigins {
		allowedOrigins[i] = strings.TrimSpace(allowedOrigins[i])
	}

	r := gin.Default()

	// NOTE: this is for develompent only, the built project is running on one server
	r.Use(cors.New(cors.Config{
		AllowOrigins:     allowedOrigins,
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"},
		AllowHeaders:     []string{"Accept", "Authorization", "Content-Type"},
		AllowCredentials: true,
	}))

	// damned gin can't serve files from root path >:(
	r.Static("/app", "./build/client")
	r.GET("/", func(c *gin.Context) {
		c.Redirect(http.StatusTemporaryRedirect, "/app/")
	})

	api := r.Group("/api")
	for _, c := range s.controllers {
		c.MountRoutes(api)
	}

	if appEnv == "debug" {
		swagger.SwaggerInfo.BasePath = "/api"
		r.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerfiles.Handler))
	}

	// SPA fallback
	r.NoRoute(func(c *gin.Context) {
		http.ServeFile(c.Writer, c.Request, "./build/client/index.html")
	})
	s.srv.Handler = r
	return s
}
