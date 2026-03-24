package utils

import (
	"errors"
	"mime/multipart"
	"os"
	"path/filepath"
	"slices"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

// Iterators still suck in go so we're stuck with this :((
func Map[T, U any](in []T, f func(T) U) (out []U) {
	for _, val := range in {
		out = append(out, f(val))
	}
	return out
}

func Filter[T any](in []T, f func(T) bool) (out []T) {
	for _, val := range in {
		if f(val) {
			out = append(out, val)
		}
	}
	return out
}

func MaxBy[T any, U ~int | ~uint | ~float32](in []T, f func(T) U) int {
	var highest U = 0
	var current U = 0
	for _, val := range in {
		current = f(val)
		if current > highest {
			highest = current
		}
	}

	return int(highest)
}

func Must[T any](val T, err error) T {
	if err != nil {
		panic(err)
	}
	return val
}

var (
	ErrUnsupportedMediaType = errors.New("Media type unsupported. Uploaded image can only be .png, .jpg, .jpeg, .webp or .svg")
	allowedFileTypes        = []string{".png", ".jpg", ".jpeg", ".webp", ".svg"}
)

func SaveFileToDisc(c *gin.Context, file *multipart.FileHeader) (*string, error) {
	extension := filepath.Ext(file.Filename)

	if !slices.Contains(allowedFileTypes, extension) {
		return nil, ErrUnsupportedMediaType
	}

	uploadDir := os.Getenv("UPLOAD_DIR")
	if uploadDir == "" {
		uploadDir = "./uploads/pfps"
	}

	if err := os.MkdirAll(uploadDir, 0o755); err != nil {
		return nil, err
	}

	uri := filepath.Join(uploadDir, uuid.NewString()+extension)

	if err := c.SaveUploadedFile(file, uri); err != nil {
		return nil, err
	}

	return &uri, nil
}
