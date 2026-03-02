package main

import (
	"context"
	"log"
	wire_gen "smaash-web/internal/wire"
)

func main() {
	appContext := context.Background()

	srv := wire_gen.InitializeServer()
	srv.MountRoutes()

	if err := srv.Run(appContext); err != nil {
		log.Fatalf("There was an error starting the server: %v", err)
	}
}
