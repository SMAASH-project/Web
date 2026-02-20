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
	Login(context.Context, *models.User) (*string, uint, error)
	CreateProfile(context.Context, uint, string) (*models.PlayerProfile, error)
}

type AuthenticationService struct {
	usersRepo repository.UserRepository
	profilesRepo repository.PlayerProfileRepository
}

func NewAuthenticationService(ur repository.UserRepository, pr repository.PlayerProfileRepository) Authentication {
	return AuthenticationService{usersRepo: ur, profilesRepo: pr}
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
	err = a.usersRepo.Create(c, u)
	return u, err
}

func (a AuthenticationService) Login(c context.Context, u *models.User) (*string, uint, error) {
	user, err := a.usersRepo.ReadByEmail(c, u.Email)
	if err != nil {
		return nil, 0, err
	}

	err = bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(u.PasswordHash))
	if err != nil {
		return nil, 0, ErrPasswordComparisonFailed
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"sub": user.ID,
		"exp": time.Now().Add(time.Hour * 24).Unix(),
	})

	tokenString, err := token.SignedString([]byte(os.Getenv("SECRET_KEY")))
	if err != nil {
		return nil, 0, err
	}

	return &tokenString, user.ID, nil
}

// This endpoint should be authorized, so no authentication logic required here
func (a AuthenticationService) CreateProfile(c context.Context, userID uint, displayName string) (*models.PlayerProfile, error) {
	newProfile := &models.PlayerProfile{
		DisplayName: displayName,
		UserID: userID,
		Coins: 1000,
		LastLogin: time.Now(),
	}

	if err := a.profilesRepo.Create(c, newProfile); err != nil {
		return nil, err
	}

	return newProfile, nil
}
