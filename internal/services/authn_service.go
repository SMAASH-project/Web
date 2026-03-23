package services

import (
	"context"
	"errors"
	"os"
	"smaash-web/internal/models"
	"smaash-web/internal/repository"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

type Authentication interface {
	SignUp(context.Context, *models.User) error
	Login(context.Context, *models.User) (*string, *models.User, error)
}

type AuthenticationService struct {
	userRepo repository.UserRepository
}

func NewAuthenticationService(userRepo repository.UserRepository) Authentication {
	return AuthenticationService{userRepo: userRepo}
}

var (
	ErrPasswordComparisonFailed = errors.New("Password incorrect")
	ErrUserBanned               = errors.New("User is banned")
)

func (a AuthenticationService) SignUp(c context.Context, u *models.User) error {
	hash, err := bcrypt.GenerateFromPassword([]byte(u.PasswordHash), 10)
	if err != nil {
		return err
	}
	u.PasswordHash = string(hash)
	err = a.userRepo.Create(c, u)
	if err != nil {
		return err
	}
	return nil
}

func (a AuthenticationService) Login(c context.Context, u *models.User) (*string, *models.User, error) {
	user, err := a.userRepo.ReadByEmail(c, u.Email, "Role")
	if err != nil {
		return nil, nil, err
	}

	if user.BannedUntil != nil && user.BannedUntil.Before(time.Now()) {
		if err := a.userRepo.Unban(c, user.ID); err != nil {
			return nil, nil, err
		}
		user, err = a.userRepo.ReadByID(c, user.ID, "Role")
		if err != nil {
			return nil, nil, err
		}
	}

	if user.IsBanned {
		return nil, &user, ErrUserBanned
	}

	err = bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(u.PasswordHash))
	if err != nil {
		return nil, nil, ErrPasswordComparisonFailed
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"sub":  user.ID,
		"exp":  time.Now().Add(time.Hour * 24).Unix(),
		"role": user.Role.Name,
	})

	key := os.Getenv("SECRET_KEY")
	if key == "" {
		key = "super_secret_key"
	}
	tokenString, err := token.SignedString([]byte(key))
	if err != nil {
		return nil, nil, err
	}

	if err := a.userRepo.UpdateOne(c, user.ID, "LastLogin", time.Now()); err != nil {
		return nil, nil, err
	}

	return &tokenString, &user, nil
}
