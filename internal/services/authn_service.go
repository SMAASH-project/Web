package services

import (
	"context"
	"errors"
	"os"
	"smaash-web/internal/models"
	"smaash-web/internal/repository"
	"smaash-web/internal/utils"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

type Authentication interface {
	SignUp(context.Context, *models.User) (*string, error)
	Login(context.Context, *models.User) (*string, *models.User, error)
	ChangePassword(context.Context, uint, string, string) (*string, error)
}

type AuthenticationService struct {
	userRepo repository.UserRepository
}

func NewAuthenticationService(userRepo repository.UserRepository) Authentication {
	return AuthenticationService{userRepo: userRepo}
}

var (
	ErrPasswordIncorrect  = errors.New("Password incorrect")
	ErrUserBanned         = errors.New("User is banned")
	ErrSecurityKeyInvalid = errors.New("Provided security key is invalid")
)

func (a AuthenticationService) SignUp(c context.Context, u *models.User) (*string, error) {
	hash, err := bcrypt.GenerateFromPassword([]byte(u.PasswordHash), 10)
	if err != nil {
		return nil, err
	}

	rawKey := utils.GenerateSecurityKey()
	hashedKey, err := bcrypt.GenerateFromPassword([]byte(rawKey), 10)
	if err != nil {
		return nil, err
	}

	u.PasswordHash = string(hash)
	u.SecurityKey = string(hashedKey)
	err = a.userRepo.Create(c, u)
	if err != nil {
		return nil, err
	}
	return &rawKey, nil
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
		return nil, nil, ErrPasswordIncorrect
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

func (a AuthenticationService) ChangePassword(c context.Context, userID uint, newPass string, securityKey string) (*string, error) {
	user, err := a.userRepo.ReadByID(c, userID)
	if err != nil {
		return nil, err
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.SecurityKey), []byte(securityKey)); err != nil {
		return nil, ErrSecurityKeyInvalid
	}

	newHash, err := bcrypt.GenerateFromPassword([]byte(newPass), 10)
	if err != nil {
		return nil, err
	}

	newKey := utils.GenerateSecurityKey()
	newKeyHash, err := bcrypt.GenerateFromPassword([]byte(newKey), 10)
	if err != nil {
		return nil, err
	}

	user.PasswordHash = string(newHash)
	user.SecurityKey = string(newKeyHash)
	if err := a.userRepo.Update(c, user); err != nil {
		return nil, err
	}

	return &newKey, nil
}
