package seeder

import (
	"context"
	"errors"
	"sync"
)

type Seeder interface {
	Seed(seed_data_root string, ctx context.Context) error
}

type SeederManager struct {
	ctx            context.Context
	seed_data_root string
	seeders        []Seeder
}

type SeederOpt func(*SeederManager)

func NewSeedManager(seed_data_root string, opts ...SeederOpt) *SeederManager {
	seederManager := &SeederManager{
		seed_data_root: seed_data_root,
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
			if err := seeder.Seed(sm.seed_data_root, sm.ctx); err != nil {
				errStream <- err
			}
		})
	}

	wg.Wait()
	close(errStream)

	for err := range errStream {
		errList = append(errList, err)
	}

	if len(errList) < 1 {
		return errors.Join(errList...)
	}

	return nil
}
