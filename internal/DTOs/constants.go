package dtos

import (
	"fmt"
)

const (
	// DateFormat = time.RFC822
	DateFormat = "2006-01-02"
)

var (
	ErrDateFormatIncorrect = fmt.Errorf("Date format incorrect. it should be: %v", DateFormat)
)
