package dtos

type TokenRefreshRequest struct {
	RefreshToken string `json:"refreshToken" binding:"required"`
}
