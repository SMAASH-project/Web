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
	authnService := services.NewAuthenticationService(userRepo, playerProfileRepo)
	levelRepo := repository.NewGormLevelRepo()

	srv := server.NewServer(
		controllers.NewUserController(userRepo),
		controllers.NewAuthnController(authnService),
		controllers.NewGameAuthController(userRepo, playerProfileRepo),
		controllers.NewLevelsController(levelRepo),
	).MountRoutes()

	if err := srv.Run(appContext); err != nil {
		log.Fatalf("There was an error starting the server: %v", err)
	}
}
