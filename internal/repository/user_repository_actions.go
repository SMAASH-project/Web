package repository

import (
	"context"
	"smaash-web/internal/models"

	"gorm.io/gorm"
)

type UserRepositoryActions struct {
	*BaseRepositoryActions[models.User]
	ReadByEmail func(c context.Context, email string) (models.User, error)
}

func NewUserRepositoryActions(conn *gorm.DB) *UserRepositoryActions {
	return &UserRepositoryActions{
		BaseRepositoryActions: NewBaseRepositoryActions[models.User](conn),
		ReadByEmail: func(c context.Context, email string) (models.User, error) {
			return gorm.G[models.User](conn).Where("email = ?", email).First(c)
		},
	}
}
