package services_test

import (
	"context"
	"slices"
	"smaash-web/internal/models"
	"smaash-web/internal/services"
	"smaash-web/internal/utils"
	"testing"

	"github.com/stretchr/testify/assert"
	"gorm.io/gorm"
)

// Create(c context.Context, user *models.User) error
// 	ReadAll(context.Context) ([]models.User, error)
// 	ReadByID(c context.Context, id uint) (*models.User, error)
// 	ReadByEmail(c context.Context, email string) (*models.User, error)
// 	Update(c context.Context, user models.User) error
// 	Delete(c context.Context, id uint) error

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
	res := utils.Filter(MockUserData, func(u models.User) bool { return u.ID == id })[0]
	return &res, nil
}

func (mu *MockUserRepo) ReadByEmail(c context.Context, email string) (*models.User, error) {
	res := utils.Filter(MockUserData, func(u models.User) bool { return u.Email == email })[0]
	return &res, nil
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
	return nil
}

func (mp *MockProfilesRepo) ReadAll(context.Context) ([]models.PlayerProfile, error) {
	return MockProfilesData, nil
}

func (mp *MockProfilesRepo) ReadByID(c context.Context, id uint) (*models.PlayerProfile, error) {
	res := utils.Filter(MockProfilesData, func(p models.PlayerProfile) bool { return p.ID == id })[0]
	return &res, nil
}

func (mp *MockProfilesRepo) ReadByUserID(c context.Context, userID uint) (*models.PlayerProfile, error) {
	res := utils.Filter(MockProfilesData, func(p models.PlayerProfile) bool { return p.UserID == userID })[0]
	return &res, nil
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

var authService = services.NewAuthenticationService(&MockUserRepo{}, &MockProfilesRepo{})

func TestSignup(t *testing.T) {
	newUser := &models.User{Email: "test@example.com", PasswordHash: "test1234", RoleID: 2}
	createdUser, err := authService.SignUp(context.Background(), newUser)

	assert.Nil(t, err, "Signup shouldn't return an error")
	assert.Equal(t, createdUser.Email, newUser.Email, "Signup should return passed in user, only updated")
	assert.NotEqual(t, createdUser.ID, uint(0), "Signed up user should have a non-zero id")
	assert.Equal(t, createdUser.PasswordHash, newUser.PasswordHash, "Signed up user should have a hashed password")
}
