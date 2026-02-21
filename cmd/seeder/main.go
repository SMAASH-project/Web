package main

import (
	"context"
	"log"
	"os"
	"smaash-web/internal/seeder"

	_ "github.com/joho/godotenv/autoload"
)

func main() {
	if err := seeder.NewSeedManager(
		os.Getenv("SEED_DATA_URI"),
		os.Getenv("DB_URL"),
		seeder.WithContext(context.Background()),
		seeder.WithSeeder(seeder.NewRoleSeeder()),
		seeder.WithSeeder(seeder.NewUserSeeder()),
	).Seed(); err != nil {
		log.Print(err)
	}
}
