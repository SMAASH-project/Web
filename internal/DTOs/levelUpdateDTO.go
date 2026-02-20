package dtos

type LevelUpdateDTO struct {
	ID     uint   `json:"id" binding:"required"`
	Name   string `json:"name" binding:"required,max=20"`
	ImgUri string `json:"img_uri" binding:"required"`
}
