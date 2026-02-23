package seeder

import (
	"context"
	"log"
	"os"
	"smaash-web/internal/database"
	"sync"
	"time"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

type Seeder interface {
	Seed(ctx context.Context, seed_data_root string, db_url string, errStream chan error, logger logger.Interface)
}

type SeederManager struct {
	ctx            context.Context
	seed_data_root string
	db_url         string
	seeders        []Seeder
	errStream      chan error
	logger         logger.Interface
}

type SeederOpt func(*SeederManager)

func NewSeedManager(seed_data_root string, dbUrl string, errStream chan error, opts ...SeederOpt) *SeederManager {
	logger := logger.New(log.New(os.Stdout, "/r/n", log.LstdFlags), logger.Config{
		SlowThreshold: time.Second,
		LogLevel:      logger.Silent, //needs to be silent so it doesn't scream for duplicate values
	})

	seederManager := &SeederManager{
		seed_data_root: seed_data_root,
		db_url:         dbUrl,
		errStream:      errStream,
		logger:         logger,
	}

	for _, opt := range opts {
		opt(seederManager)
	}

	return seederManager
}

func WithSeeder(seeder Seeder) SeederOpt {
	return func(sm *SeederManager) {
		sm.seeders = append(sm.seeders, seeder)
	}
}

func WithContext(ctx context.Context) SeederOpt {
	return func(sm *SeederManager) {
		sm.ctx = ctx
	}
}

func (sm *SeederManager) Seed() {
	if os.Getenv("SQLITE_MODE") == "memory" {
		sm.db_url = "file::memory:?cache=shared"
	}
	conn, err := gorm.Open(sqlite.Open(sm.db_url))
	if err != nil {
		log.Panicf("Could not connect to db. Error: %v", err)
	}

	log.Println("migrating db")
	if err := database.AutoMigrate(conn); err != nil {
		log.Panicf("Could not migrate models. Error: %v", err)
	}
	log.Println("migrating finished")

	var wg sync.WaitGroup

	for _, seeder := range sm.seeders {
		wg.Go(func() {
			seeder.Seed(sm.ctx, sm.seed_data_root, sm.db_url, sm.errStream, sm.logger)
		})
	}

	wg.Wait()
	close(sm.errStream)
	log.Println("Seeding finished")
}

func (sm SeederManager) ListenForErrors() {
	for err := range sm.errStream {
		log.Println(err)
	}
}
