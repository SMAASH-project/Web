package main

import (
	"context"
	"os"
	"smaash-web/internal/seeder"
	"time"

	_ "github.com/joho/godotenv/autoload"
)

func main() {
	ctx, cancel := context.WithTimeout(context.Background(), time.Second*4)
	defer cancel()

	errStream := make(chan error, 1)

	sm := seeder.NewSeedManager(
		os.Getenv("SEED_DATA_URI"),
		os.Getenv("DB_URL"),
		errStream,
		seeder.WithContext(ctx),
		seeder.WithSeeder(seeder.NewRoleSeeder()),
		seeder.WithSeeder(seeder.NewUserSeeder()),
	)

	go func() {
		sm.ListenForErrors()
	}()

	sm.Seed()
}
