package seeder

import (
	"context"
	"errors"
	"log"
	"sync"
)

type Seeder interface {
	Seed(ctx context.Context, seed_data_root string, db_url string) error
}

type SeederManager struct {
	ctx            context.Context
	seed_data_root string
	db_url         string
	seeders        []Seeder
}

type SeederOpt func(*SeederManager)

func NewSeedManager(seed_data_root string, dbUrl string, opts ...SeederOpt) *SeederManager {
	seederManager := &SeederManager{
		seed_data_root: seed_data_root,
		db_url:         dbUrl,
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

func (sm *SeederManager) Seed() error {
	errStream := make(chan error, 1)
	var errList []error
	var wg sync.WaitGroup

	for _, seeder := range sm.seeders {
		wg.Go(func() {
			if err := seeder.Seed(sm.ctx, sm.seed_data_root, sm.db_url); err != nil {
				errStream <- err
			}
		})
	}

	wg.Wait()
	close(errStream)

	for err := range errStream {
		errList = append(errList, err)
	}

	if len(errList) > 1 {
		return errors.Join(errList...)
	}
	if len(errList) == 1 {
		return errList[0]
	}

	log.Println("Seeding finished successfully")
	return nil
}
