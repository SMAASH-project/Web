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
	userStatsService := services.NewUserStatsService(userRepo)
	authnService := services.NewAuthenticationService(userRepo)

	srv := server.NewServer(
		controllers.NewUserController(userStatsService),
		controllers.NewAuthnController(authnService),
	).MountRoutes()

	if err := srv.Run(appContext); err != nil {
		log.Fatalf("There was an error starting the server: %v", err)
	}
}
