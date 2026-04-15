package seeder

import (
	"context"
	"encoding/json"
	"errors"
	"log"
	"os"
	"slices"
	"smaash-web/internal/models"
	"time"

	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

type UserSeeder struct{ children []Seeder }

func NewUserSeeder() Seeder {
	return &UserSeeder{}
}

func (us UserSeeder) GetChildren() []Seeder {
	return us.children
}

func (us UserSeeder) AppendChildren(children ...Seeder) {
	us.children = slices.Concat(us.children, children)
}

type UserDataFormat struct {
	Email    string
	Password string
	RoleID   int
}

func (us UserSeeder) Seed(c context.Context, data_root_path string, db *gorm.DB, errStream chan error, logger logger.Interface) {
	log.Println("Starting user seeder")

	raw, err := os.ReadFile(data_root_path + "/users.json")
	if err != nil {
		errStream <- err
	}

	var target []UserDataFormat
	if err = json.Unmarshal(raw, &target); err != nil {
		errStream <- err
	}

	for _, val := range target {
		passHash, err := bcrypt.GenerateFromPassword([]byte(val.Password), 10)
		if err != nil {
			errStream <- err
		}
		if err = gorm.G[models.User](db).Create(c, &models.User{
			Email:        val.Email,
			PasswordHash: string(passHash),
			RoleID:       uint(val.RoleID),
			IsBanned:     false,
			LastLogin:    time.Now(),
		}); err != nil {
			if !errors.Is(err, gorm.ErrDuplicatedKey) {
				errStream <- err
			} else {
				log.Println("Skipped creating user with email: ", val.Email)
			}
		} else {
			log.Println("Created user with email: ", val.Email)
		}
	}
}
