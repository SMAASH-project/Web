package initializer

import (
	"smaash-web/internal/controllers"
	"smaash-web/internal/database"
	"smaash-web/internal/models"
	"smaash-web/internal/repository"
	"smaash-web/internal/server"
	"smaash-web/internal/services"
	"time"
)

func Initialize() *server.Server {
	conn := database.NewGormDBConn()
	userRepo := repository.NewUserRepositoryActions(conn)
	profilesBaseRepo := repository.NewBaseRepositoryActions[models.PlayerProfile](conn)

	authService := services.NewAuthenticationService(userRepo)

	return server.NewServer().
		SetGracePeriod(10 * time.Second).
		AddController(controllers.NewUserController(userRepo, profilesBaseRepo)).
		AddController(controllers.NewAuthnController(authService)).
		AddController(controllers.NewGameAuthController(userRepo)).
		AddController(controllers.NewLevelsController(repository.NewBaseRepositoryActions[models.Level](conn))).
		AddController(controllers.NewPlayerProfileController(profilesBaseRepo)).
		AddController(controllers.NewRolesController(repository.NewBaseRepositoryActions[models.Role](conn))).
		AddController(controllers.NewCategoriesController(repository.NewBaseRepositoryActions[models.Category](conn)))
}
