package seeder

import (
	"context"
	"encoding/json"
	"errors"
	"log"
	"os"
	"smaash-web/internal/models"
	"time"

	"golang.org/x/crypto/bcrypt"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

type UserSeeder struct{}

func NewUserSeeder() *UserSeeder {
	return &UserSeeder{}
}

type UserDataFormat struct {
	Email    string
	Password string
	RoleID   int
}

func (us UserSeeder) Seed(c context.Context, data_root_path string, db_url string) error {
	log.Println("Starting user seeder")
	db, err := gorm.Open(sqlite.Open(db_url))
	if err != nil {
		return err
	}

	raw, err := os.ReadFile(data_root_path + "/users.json")
	if err != nil {
		return err
	}

	var target []UserDataFormat
	if err = json.Unmarshal(raw, &target); err != nil {
		return err
	}

	errs := make([]error, len(target))
	for _, val := range target {
		passHash, err := bcrypt.GenerateFromPassword([]byte(val.Password), 10)
		if err != nil {
			return err
		}
		if err = gorm.G[models.User](db).Create(c, &models.User{
			Email:        val.Email,
			PasswordHash: string(passHash),
			RoleID:       uint(val.RoleID),
			IsBanned:     false,
			LastLogin:    time.Now(),
		}); err != nil {
			errs = append(errs, err)
		}
	}

	if len(errs) > 1 {
		return errors.Join(errs...)
	}
	if len(errs) == 1 {
		return errs[0]
	}

	return nil
}
