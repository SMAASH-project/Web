package dtos

import (
	"smaash-web/internal/models"

	"gorm.io/gorm"
)

type PostReadDTO struct {
	ID        uint    `json:"id"`
	Title     string  `json:"title"`
	Category  string  `json:"category"`
	ImgURL    string  `json:"img_url,omitempty"`
	ImgAlt    string  `json:"img_alt,omitempty"`
	ImgPos    float64 `json:"img_pos,omitempty"`
	Content   string  `json:"content"`
	CreatedAt string  `json:"created_at"`
}

type PostCreateDTO struct {
	Title    string  `json:"title" binding:"required"`
	Category string  `json:"category" binding:"required"`
	ImgURL   string  `json:"img_url,omitempty"`
	ImgAlt   string  `json:"img_alt,omitempty"`
	ImgPos   float64 `json:"img_pos,omitempty"`
	Content  string  `json:"content" binding:"required"`
}

type PostUpdateDTO struct {
	ID       uint    `json:"id" binding:"required"`
	Title    string  `json:"title" binding:"required"`
	Category string  `json:"category" binding:"required"`
	ImgURL   string  `json:"img_url,omitempty"`
	ImgAlt   string  `json:"img_alt,omitempty"`
	ImgPos   float64 `json:"img_pos,omitempty"`
	Content  string  `json:"content" binding:"required"`
}

func PostToDTO(post models.Post) PostReadDTO {
	return PostReadDTO{
		ID:        post.ID,
		Title:     post.Title,
		Category:  post.Category,
		ImgURL:    post.ImgURL,
		ImgAlt:    post.ImgAlt,
		ImgPos:    post.ImgPos,
		Content:   post.Content,
		CreatedAt: post.CreatedAt.Format(DATE_FORMAT),
	}
}

func CreateDTOToPost(dto PostCreateDTO) *models.Post {
	return &models.Post{
		Title:    dto.Title,
		Category: dto.Category,
		ImgURL:   dto.ImgURL,
		ImgAlt:   dto.ImgAlt,
		ImgPos:   dto.ImgPos,
		Content:  dto.Content,
	}
}

func UpdateDTOToPost(dto PostUpdateDTO) models.Post {
	return models.Post{
		Model:    gorm.Model{ID: dto.ID},
		Title:    dto.Title,
		Category: dto.Category,
		ImgURL:   dto.ImgURL,
		ImgAlt:   dto.ImgAlt,
		ImgPos:   dto.ImgPos,
		Content:  dto.Content,
	}
}
