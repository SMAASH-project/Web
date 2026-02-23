package server

import (
	"net/http"
	"smaash-web/internal/middlewares"

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
		auth := api.Group("/auth")
		{
			auth.POST("/signup", s.authnController.SignUp)
			auth.POST("/login", s.authnController.Login)
			auth.POST("/logout", s.authnController.Logout)
			auth.POST("/profiles", middlewares.Authorize, s.authnController.CreateProfileForUser)

			api.POST("/game-login", s.gameAuthController.GameLogin)
		}

		users := api.Group("/users")
		{
			users.GET("", s.userController.ReadAllUsers)
			users.GET("/:id", middlewares.ValidateUrl, s.userController.ReadUserByID)
		}

		levels := api.Group("/levels")
		{
			levels.GET("/levels", s.levelsController.ReadAllLevels)
			levels.GET("/levels/:id", middlewares.ValidateUrl, s.levelsController.ReadLevelByID)
			levels.POST("/levels", s.levelsController.CreateLevel)
			levels.PUT("/levels/:id", middlewares.ValidateUrl, s.levelsController.UpdateLevel)
			levels.DELETE("/levels/:id", middlewares.ValidateUrl, s.levelsController.DeleteLevel)
		}
	}

	r.NoRoute(func(c *gin.Context) {
		http.ServeFile(c.Writer, c.Request, "./build/client")
	})
	s.srv.Handler = r
	return s
}
