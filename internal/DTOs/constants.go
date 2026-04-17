package dtos

import (
	"fmt"
	"time"
)

const (
	DATE_TIME_FORMAT = time.RFC822
	DATE_FORMAT      = "2006-01-02"
	TIMESTAMP_FORMAT = time.StampMilli
)

var (
	ErrDateFormatIncorrect = fmt.Errorf("Date format incorrect. it should be: %v", DATE_FORMAT)
)
