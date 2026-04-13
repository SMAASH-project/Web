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
	profilesRepo := repository.NewProfilesRepositoryActions(conn)
	rarityRepo := repository.NewRarityRepositoryActions(conn)
	categoriesRepo := repository.NewCategoryRepositoryActions(conn)
	charactersRepo := repository.NewCharactersRepositoryActions(conn)

	authService := services.NewAuthenticationService(userRepo)

	return server.NewServer().
		SetGracePeriod(10 * time.Second).
		AddController(controllers.NewUserController(userRepo, profilesRepo)).
		AddController(controllers.NewAuthnController(authService, repository.NewRolesRepositoryActions(conn))).
		AddController(controllers.NewGameAuthController(userRepo)).
		AddController(controllers.NewLevelsController(repository.NewBaseRepositoryActions[models.Level](conn))).
		AddController(controllers.NewPlayerProfileController(profilesRepo, charactersRepo)).
		AddController(controllers.NewRolesController(repository.NewBaseRepositoryActions[models.Role](conn))).
		AddController(controllers.NewCategoriesController(categoriesRepo)).
		AddController(controllers.NewRaritiesController(rarityRepo)).
		AddController(controllers.NewStatsController(repository.NewStatsRepositoryActions(conn))).
		AddController(controllers.NewPurchasesController(repository.NewPurchasesRepositoryActions(conn), profilesRepo)).
		AddController(controllers.NewPostsController(repository.NewBaseRepositoryActions[models.Post](conn))).
		AddController(controllers.NewMatchController(conn)).
		AddController(controllers.NewCharactersController(charactersRepo))
}
