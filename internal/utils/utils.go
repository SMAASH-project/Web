package utils

import (
	"crypto/rand"
	"encoding/base64"
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

func Must[T any](val T, err error) T {
	if err != nil {
		panic(err)
	}
	return val
}

type FileUploadKind string

const (
	PROFILE_PICTURE FileUploadKind = "pfps"
	CHARACTER_IMAGE FileUploadKind = "characters"
	LEVEL_IMAGE     FileUploadKind = "levels"
	ITEM_IMAGE      FileUploadKind = "items"
)

var (
	ErrUnsupportedMediaType = errors.New("Media type unsupported. Uploaded image can only be .png, .jpg, .jpeg, .webp or .svg")
	allowedFileTypes        = []string{".png", ".jpg", ".jpeg", ".webp", ".svg"}
)

func SaveFileToDisc(c *gin.Context, file *multipart.FileHeader, kind FileUploadKind) (*string, error) {
	extension := filepath.Ext(file.Filename)

	if !slices.Contains(allowedFileTypes, extension) {
		return nil, ErrUnsupportedMediaType
	}

	uploadDir := os.Getenv("UPLOAD_DIR")
	if uploadDir == "" {
		uploadDir = "./uploads"
	}

	path := filepath.Join(uploadDir, string(kind))

	if err := os.MkdirAll(path, 0o755); err != nil {
		return nil, err
	}

	uri := filepath.Join(path, uuid.NewString()+extension)

	if err := c.SaveUploadedFile(file, uri); err != nil {
		return nil, err
	}

	return &uri, nil
}

func GenerateSecurityKey() string {
	keyBuffer := make([]byte, 32)
	rand.Read(keyBuffer)
	return base64.StdEncoding.EncodeToString(keyBuffer)
}
