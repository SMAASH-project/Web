package services_test

import (
	"context"
	"errors"
	"os"
	"slices"
	"smaash-web/internal/models"
	"smaash-web/internal/services"
	"smaash-web/internal/utils"
	"testing"

	"github.com/golang-jwt/jwt/v5"
	"github.com/stretchr/testify/assert"
	"gorm.io/gorm"
)

var MockUserData = []models.User{
	{
		Model:    gorm.Model{ID: 1},
		Email:    "admin@example.com",
		RoleID:   1,
		IsBanned: false,
	},
	{
		Model:    gorm.Model{ID: 2},
		Email:    "user@example.com",
		RoleID:   2,
		IsBanned: true,
	},
	{
		Model:    gorm.Model{ID: 3},
		Email:    "support@example.com",
		RoleID:   3,
		IsBanned: false,
	},
}

var MockProfilesData = []models.PlayerProfile{
	{
		Model:       gorm.Model{ID: 1},
		DisplayName: "Name1",
		UserID:      1,
		Coins:       1000,
	},
	{
		Model:       gorm.Model{ID: 2},
		DisplayName: "Name3",
		UserID:      2,
		Coins:       2000,
	},
	{
		Model:       gorm.Model{ID: 3},
		DisplayName: "Name3",
		UserID:      3,
		Coins:       3000,
	},
}

type MockUserRepo struct {
}

func (mu *MockUserRepo) Create(c context.Context, u *models.User) error {
	u.ID = uint(utils.MaxBy(MockUserData, func(u models.User) uint { return u.ID })) + 1
	MockUserData = append(MockUserData, *u)
	u = &MockUserData[len(MockUserData)-1]
	return nil
}

func (mu *MockUserRepo) ReadAll(context.Context) ([]models.User, error) {
	return MockUserData, nil
}

func (mu *MockUserRepo) ReadByID(c context.Context, id uint) (*models.User, error) {
	res := utils.Filter(MockUserData, func(u models.User) bool { return u.ID == id })
	if len(res) == 0 {
		return nil, errors.New("Record not found")
	}
	return &res[0], nil
}

func (mu *MockUserRepo) ReadByEmail(c context.Context, email string) (*models.User, error) {
	res := utils.Filter(MockUserData, func(u models.User) bool { return u.Email == email })
	if len(res) == 0 {
		return nil, errors.New("Record not found")
	}
	return &res[0], nil
}

func (mu *MockUserRepo) Update(c context.Context, u models.User) error {
	user, _ := mu.ReadByID(c, u.ID)
	*user = u
	return nil
}

func (mu *MockUserRepo) Delete(c context.Context, id uint) error {
	MockUserData = slices.Delete(MockUserData, int(id-1), int(id))
	return nil
}

type MockProfilesRepo struct {
}

func (mp *MockProfilesRepo) Create(c context.Context, p *models.PlayerProfile) error {
	p.ID = uint(utils.MaxBy(MockProfilesData, func(p models.PlayerProfile) uint { return p.ID })) + 1
	MockProfilesData = append(MockProfilesData, *p)
	p = &MockProfilesData[len(MockProfilesData)-1]
	return nil
}

func (mp *MockProfilesRepo) ReadAll(context.Context) ([]models.PlayerProfile, error) {
	return MockProfilesData, nil
}

func (mp *MockProfilesRepo) ReadByID(c context.Context, id uint) (*models.PlayerProfile, error) {
	res := utils.Filter(MockProfilesData, func(p models.PlayerProfile) bool { return p.ID == id })
	if len(res) == 0 {
		return nil, errors.New("Record not found")
	}
	return &res[0], nil
}

func (mp *MockProfilesRepo) ReadByUserID(c context.Context, userID uint) (*models.PlayerProfile, error) {
	res := utils.Filter(MockProfilesData, func(p models.PlayerProfile) bool { return p.UserID == userID })
	if len(res) == 0 {
		return nil, errors.New("Record not found")
	}
	return &res[0], nil
}

func (mp *MockProfilesRepo) Update(c context.Context, p *models.PlayerProfile) error {
	profile, _ := mp.ReadByID(c, p.ID)
	*profile = *p
	return nil
}

func (mp *MockProfilesRepo) Delete(c context.Context, id uint) error {
	MockProfilesData = slices.Delete(MockProfilesData, int(id-1), int(id))
	return nil
}

var authService = services.NewAuthenticationService(&MockUserRepo{})

func TestSignup(t *testing.T) {
	newUser := &models.User{Email: "test@example.com", PasswordHash: "test1234", RoleID: 2}
	createdUser, err := authService.SignUp(context.Background(), newUser)

	assert.Nil(t, err, "Signup shouldn't return an error")
	assert.Equal(t, createdUser.Email, newUser.Email, "Signup should return passed in user, only updated")
	assert.NotEqual(t, createdUser.ID, uint(0), "Signed up user should have a non-zero id")
	assert.Equal(t, createdUser.PasswordHash, newUser.PasswordHash, "Signed up user should have a hashed password")
}

func TestLogin(t *testing.T) {
	// Non-existing user
	phonyUser := models.User{
		Email:        "doesnt@exist.com",
		PasswordHash: "secure123",
	}
	token, id, err := authService.Login(context.Background(), &phonyUser)

	assert.Nil(t, token, "Non-existing user shouldn't recieve a token")
	assert.Equal(t, uint(0), id, "Non-existing user shouldn't have a valid id")
	assert.NotNil(t, err, "Logging in non-existing user should produce an error")

	correctPass := "password1234"
	correctUser, err := authService.SignUp(context.Background(), &models.User{Email: "test@test.com", PasswordHash: correctPass})

	// Wrong password
	token, id, err = authService.Login(context.Background(), &models.User{Email: correctUser.Email, PasswordHash: "wrongpass1234"})
	assert.Nil(t, token, "Attempting login with wrong password shouldn't yield a token")
	assert.Equal(t, uint(0), id, "Attempting login with wrong password should return a 0 id")
	assert.NotNil(t, err, "Attempting login with wring password sould produce an error")

	// Correct login
	token, id, err = authService.Login(context.Background(), &models.User{Email: correctUser.Email, PasswordHash: correctPass})
	assert.NotNil(t, token, "Successful login should produce a token")
	assert.NotEqual(t, 0, id, "Successful login should return a valid id")
	mu := MockUserRepo{}
	assert.Equal(t, utils.Must(mu.ReadByEmail(context.Background(), correctUser.Email)).ID, id, "Successful login should return the correct id")
	assert.Nil(t, err, "Successful login shouldn't produce an error")

	parsedToken, err := jwt.Parse(*token, func(token *jwt.Token) (any, error) {
		return []byte(os.Getenv("SECRET_KEY")), nil
	}, jwt.WithValidMethods([]string{"HS256"}))

	claims, ok := parsedToken.Claims.(jwt.MapClaims)

	assert.Equal(t, id, uint(claims["sub"].(float64)), "Successful login should return a token with the logged is user's id in the sub field")
	assert.True(t, ok, "Successful login should return a token in valid format")
	assert.True(t, parsedToken.Valid, "Successful login should return a valid token")
}
