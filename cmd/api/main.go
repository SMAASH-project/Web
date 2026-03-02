package main

import (
	"context"
	"log"
)

func main() {
	appContext := context.Background()

	srv := InitializeServer()
	srv.MountRoutes()

	if err := srv.Run(appContext); err != nil {
		log.Fatalf("There was an error starting the server: %v", err)
	}
}
