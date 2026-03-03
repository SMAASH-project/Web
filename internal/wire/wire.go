//go:build wireinject

package wire_gen

import (
	"smaash-web/internal/controllers"
	"smaash-web/internal/database"
	"smaash-web/internal/repository"
	"smaash-web/internal/server"
	"smaash-web/internal/services"

	"github.com/google/wire"
)

func InitializeServer() *server.Server {
	wire.Build(
		server.NewServer,
		controllers.NewUserController,
		controllers.NewAuthnController,
		controllers.NewGameAuthController,
		controllers.NewLevelsController,
		controllers.NewPlayerProfileController,
		controllers.NewRolesController,
		controllers.NewCategoriesController,
		services.NewAuthenticationService,
		repository.NewGormUserRepo,
		repository.NewGormLevelRepo,
		repository.NewGormPlayerProfileRepo,
		repository.NewGormRoleRepo,
		repository.NewGormCategoryRepo,
		database.NewGormDBConn,
	)
	return &server.Server{}
}
