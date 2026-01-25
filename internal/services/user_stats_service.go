package services

import (
	"context"
	"smaash-web/internal/models"
	"smaash-web/internal/repository"
)

// Type UserStats handles only reading statistical data about users, and deleting them.
// Creating and modifying them is a task for an auth service.
// Also, this is a phony service for testing purposes.
type UserStats interface {
	ReadAllUsers(context.Context) ([]models.User, error)
	ReadUserByID(c context.Context, id uint) (*models.User, error)
	DeleteUser(c context.Context, id uint) error
}

type UserStatsService struct {
	userRepo repository.UserRepository
}

func NewUserStatsService(userRepo repository.UserRepository) UserStats {
	return &UserStatsService{userRepo: userRepo}
}

func (u UserStatsService) ReadAllUsers(c context.Context) ([]models.User, error) {
	return u.userRepo.ReadAll(c)
}

func (u UserStatsService) ReadUserByID(c context.Context, id uint) (*models.User, error) {
	return u.userRepo.ReadByID(c, id)
}

func (u UserStatsService) DeleteUser(c context.Context, id uint) error {
	return u.userRepo.Delete(c, id)
}
