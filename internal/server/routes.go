package server

import (
	"github.com/gin-gonic/gin"
)

func (s *Server) MountRoutes() *Server {
	r := gin.Default()
	r.GET("/api/users", s.userController.ReadAllUsers)
	r.GET("/api/users/:id", s.userController.ReadUserByID)

	r.POST("/api/signup", s.authnController.SignUp)
	r.POST("/api/login", s.authnController.Login)

	s.srv.Handler = r
	return s
}
