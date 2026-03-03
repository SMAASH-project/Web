package initializer

import (
	"smaash-web/internal/controllers"
	"smaash-web/internal/database"
	"smaash-web/internal/models"
	"smaash-web/internal/repository"
	"smaash-web/internal/server"
	"smaash-web/internal/services"
)

func Initialize() *server.Server {
	conn := database.NewGormDBConn()
	userRepo := repository.NewUserRepositoryActions(conn)
	profilesBaseRepo := repository.NewBaseRepositoryActions[models.PlayerProfile](conn)

	authService := services.NewAuthenticationService(userRepo)

	return server.NewServer(
		controllers.NewUserController(userRepo, profilesBaseRepo),
		controllers.NewAuthnController(authService),
		controllers.NewGameAuthController(userRepo),
		controllers.NewLevelsController(repository.NewBaseRepositoryActions[models.Level](conn)),
		controllers.NewPlayerProfileController(profilesBaseRepo),
		controllers.NewRolesController(repository.NewBaseRepositoryActions[models.Role](conn)),
		controllers.NewCategoriesController(repository.NewBaseRepositoryActions[models.Category](conn)),
	)
}
