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
	SignUp(context.Context, *models.User) (*models.User, error)
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
)

func (a AuthenticationService) SignUp(c context.Context, u *models.User) (*models.User, error) {
	hash, err := bcrypt.GenerateFromPassword([]byte(u.PasswordHash), 10)
	if err != nil {
		return nil, err
	}
	u.PasswordHash = string(hash)
	err = a.userRepo.Create(c, u)
	return u, err
}

func (a AuthenticationService) Login(c context.Context, u *models.User) (*string, *models.User, error) {
	user, err := a.userRepo.ReadByEmail(c, u.Email, "Role")
	if err != nil {
		return nil, nil, err
	}

	err = bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(u.PasswordHash))
	if err != nil {
		return nil, nil, ErrPasswordComparisonFailed
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"sub": user.ID,
		"exp": time.Now().Add(time.Hour * 24).Unix(),
	})

	tokenString, err := token.SignedString([]byte(os.Getenv("SECRET_KEY")))
	if err != nil {
		return nil, nil, err
	}

	return &tokenString, &user, nil
}
