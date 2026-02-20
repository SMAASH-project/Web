package server

import (
	"net/http"
	"smaash-web/internal/middlewares"
	"strings"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func (s *Server) MountRoutes() *Server {
	r := gin.Default()

	// NOTE: this is for develompent only, the built project is running on one server
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:5173"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"},
		AllowHeaders:     []string{"Accept", "Authorization", "Content-Type"},
		AllowCredentials: true,
	}))

	// damned gin can't serve files from root path >:(
	r.Static("/app", "./build/client")

	api := r.Group("/api")
	{
		api.POST("/signup", s.authnController.SignUp)
		api.POST("/login", s.authnController.Login)
		api.POST("/logout", s.authnController.Logout)

		api.POST("/auth/game-login", s.gameAuthController.GameLogin)

		api.GET("/levels", s.levelsController.ReadAllLevels)
		api.GET("/levels/:id", s.levelsController.ReadLevelByID)
		api.POST("/levels", s.levelsController.CreateLevel)
		api.PUT("/levels/:id", s.levelsController.UpdateLevel)
		api.DELETE("/levels/:id", s.levelsController.DeleteLevel)
	}
	users := api.Group("/users")
	{
		users.GET("", s.userController.ReadAllUsers)
		users.GET("/:id", middlewares.ValidateUrl ,s.userController.ReadUserByID)
	}

	r.NoRoute(func(c *gin.Context) {
		if !strings.HasPrefix(c.Request.RequestURI, "/api") {
			http.ServeFile(c.Writer, c.Request, "./build/client")
		}
		c.Status(http.StatusNotFound)
	})
	s.srv.Handler = r
	return s
}
