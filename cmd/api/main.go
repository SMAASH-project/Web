package main

import (
	"context"
	"log"
	wire_gen "smaash-web/internal/wire"
)

// @title SMAASH API documentation
// @version 1.0
// @license.name MIT
// @description This site documents the endpoints for the smaash web app, allowing easy testing
// @termsOfService http://swagger.io/terms/
// @BasePath /api
func main() {
	appContext := context.Background()

	srv := wire_gen.InitializeServer()
	srv.MountRoutes()

	if err := srv.Run(appContext); err != nil {
		log.Fatalf("There was an error starting the server: %v", err)
	}
}
