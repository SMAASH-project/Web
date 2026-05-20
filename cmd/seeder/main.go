package main

import (
	"context"
	"log"
	"os"
	"smaash-web/internal/seeder"
	"time"

	_ "github.com/joho/godotenv/autoload"
)

func main() {
	ctx, cancel := context.WithTimeout(context.Background(), time.Second*4)
	defer cancel()

	errStream := make(chan error, 1)

	seed_data_uri := os.Getenv("SEED_DATA_URI")
	if seed_data_uri == "" {
		seed_data_uri = "./internal/seeder/test_source"
	}

	db_url := os.Getenv("DB_URL")
	log.Println("db_url: ", db_url)
	if db_url == "" {
		db_url = "test.db"
	}

	sm := seeder.NewSeedManager(
		seed_data_uri,
		db_url,
		errStream,
		seeder.WithContext(ctx),
		seeder.WithSeeder(seeder.NewRoleSeeder()),
		seeder.WithSeeder(seeder.NewUserSeeder()),
		seeder.WithSeeder(seeder.NewCharacterSeeder(), seeder.NewCategorySeeder(), seeder.NewRaritySeeder()),
		seeder.WithSeeder(seeder.NewLevelSeeder()),
	)

	go func() {
		sm.ListenForErrors()
	}()

	sm.Seed()
}
