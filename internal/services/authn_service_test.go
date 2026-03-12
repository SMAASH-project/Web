package services_test

import (
	"context"
	"log"
	"os"
	"smaash-web/internal/database"
	"smaash-web/internal/models"
	"smaash-web/internal/repository"
	"smaash-web/internal/services"
	"smaash-web/internal/utils"
	"testing"

	"github.com/golang-jwt/jwt/v5"
	"github.com/stretchr/testify/assert"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

var (
	mockDBConn = utils.Must(
		gorm.Open(
			sqlite.Open(
				"file::memory:?cache=shared",
			),
			&gorm.Config{Logger: logger.New(
				log.New(os.Stdout, "/n", log.LstdFlags), logger.Config{LogLevel: logger.Silent})},
		),
	)
	mockUserRepo = repository.NewUserRepositoryActions(mockDBConn)
	authService  = services.NewAuthenticationService(mockUserRepo)
)

func TestSignup(t *testing.T) {
	database.AutoMigrate(mockDBConn)
	newUser := &models.User{Email: "test@example.com", PasswordHash: "test1234", RoleID: 2}
	createdUser, err := authService.SignUp(context.Background(), newUser)

	assert.Nil(t, err, "Signup shouldn't return an error")
	assert.Equal(t, createdUser.Email, newUser.Email, "Signup should return passed in user, only updated")
	assert.NotEqual(t, createdUser.ID, uint(0), "Signed up user should have a non-zero id")
	assert.Equal(t, createdUser.PasswordHash, newUser.PasswordHash, "Signed up user should have a hashed password")

	_, err = authService.SignUp(context.Background(), newUser)
	assert.NotNil(t, err, "Signing up existing user should return an error")
}

func TestLogin(t *testing.T) {
	// Non-existing user
	phonyUser := models.User{
		Email:        "doesnt@exist.com",
		PasswordHash: "secure123",
	}
	token, user, err := authService.Login(context.Background(), &phonyUser)

	assert.Nil(t, token, "Non-existing user shouldn't recieve a token")
	assert.Nil(t, user, "Logging in non-existing user should return a nil user")
	assert.NotNil(t, err, "Logging in non-existing user should produce an error")

	correctPass := "password1234"
	correctUser, err := authService.SignUp(context.Background(), &models.User{Email: "test@test.com", PasswordHash: correctPass})

	// Wrong password
	token, user, err = authService.Login(context.Background(), &models.User{Email: correctUser.Email, PasswordHash: "wrongpass1234"})
	assert.Nil(t, token, "Attempting login with wrong password shouldn't yield a token")
	assert.Nil(t, user, "Attempting login with wrong password should return a nil user")
	assert.NotNil(t, err, "Attempting login with wring password sould produce an error")

	// Correct login
	token, user, err = authService.Login(context.Background(), &models.User{Email: correctUser.Email, PasswordHash: correctPass})
	assert.NotNil(t, token, "Successful login should produce a token")
	assert.NotEqual(t, 0, user.ID, "Successful login should return a valid id")
	assert.Equal(t, utils.Must(mockUserRepo.ReadByEmail(context.Background(), correctUser.Email)).ID, user.ID, "Successful login should return the correct id")
	assert.Nil(t, err, "Successful login shouldn't produce an error")

	parsedToken, err := jwt.Parse(*token, func(token *jwt.Token) (any, error) {
		return []byte(os.Getenv("SECRET_KEY")), nil
	}, jwt.WithValidMethods([]string{"HS256"}))

	claims, ok := parsedToken.Claims.(jwt.MapClaims)

	assert.Equal(t, user.ID, uint(claims["sub"].(float64)), "Successful login should return a token with the logged is user's id in the sub field")
	assert.True(t, ok, "Successful login should return a token in valid format")
	assert.True(t, parsedToken.Valid, "Successful login should return a valid token")
}
