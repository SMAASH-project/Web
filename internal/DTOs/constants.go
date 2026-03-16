package dtos

import (
	"fmt"
	"time"
)

const (
	DateFormat = time.RFC822
)

var (
	ErrDateFormatIncorrect = fmt.Errorf("Date format incorrect. it should be: %v", DateFormat)
)
