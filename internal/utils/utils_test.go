package utils_test

import (
	"errors"
	"smaash-web/internal/utils"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
)

func TestMap(t *testing.T) {
	ints := []int{1, 2, 3, 4}
	expectedDoubled := []int{2, 4, 6, 8}
	assert.Equal(t, expectedDoubled, utils.Map(ints, func(i int) int { return i * 2 }))

	type TestUser struct {
		Name      string
		Email     string
		Coins     int
		LastLogin time.Time
	}

	users := []TestUser{
		{
			Name:  "John Doe",
			Email: "example@email.com",
			Coins: 10,
		},
		{
			Name:  "John Cena",
			Email: "john@cena.com",
			Coins: 15,
		},
		{
			Name:  "John Halo",
			Email: "john@halo.com",
			Coins: 69,
		},
	}

	expectedCoins := []int{10, 15, 69}
	assert.Equal(t, utils.Map(users, func(u TestUser) int { return u.Coins }), expectedCoins)

	expectedMutatedUsers := []TestUser{
		{
			Name:  "John Doe",
			Email: "example@email.com",
			Coins: 10,
		},
		{
			Name:  "John Cena",
			Email: "example@email.com",
			Coins: 15,
		},
		{
			Name:  "John Halo",
			Email: "example@email.com",
			Coins: 69,
		},
	}
	assert.Equal(t, utils.Map(
		users,
		func(u TestUser) TestUser { return TestUser{Name: u.Name, Email: "example@email.com", Coins: u.Coins} },
	), expectedMutatedUsers)
}

func TestMust(t *testing.T) {
	assert.Equal(t, utils.Must(3, nil), 3, "Calling must on a nil error should return the value")
	assert.Panics(t, func() { utils.Must(5, errors.New("")) }, "Calling must on a non-nill error should panic")
}
