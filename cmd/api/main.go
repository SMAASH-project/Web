package main

import (
	"context"
	"log"
	"smaash-web/internal/controllers"
	"smaash-web/internal/repository"
	"smaash-web/internal/server"
	"smaash-web/internal/services"
)

func main() {
	appContext := context.Background()
	userRepo := repository.NewGormUserRepo()
	playerProfileRepo := repository.NewGormPlayerProfileRepo()
	authnService := services.NewAuthenticationService(userRepo)
	levelRepo := repository.NewGormLevelRepo()

	srv := server.NewServer(
		controllers.NewUserController(userRepo, playerProfileRepo),
		controllers.NewAuthnController(authnService),
		controllers.NewGameAuthController(userRepo, playerProfileRepo),
		controllers.NewLevelsController(levelRepo),
		controllers.NewPlayerProfileController(playerProfileRepo),
	).MountRoutes()

	if err := srv.Run(appContext); err != nil {
		log.Fatalf("There was an error starting the server: %v", err)
	}
}
