package dtos

type LevelDTO struct {
	Name   string `json:"name" binding:"required,max=20"`
	ImgUri string `json:"img_uri" binding:"required"`
}
