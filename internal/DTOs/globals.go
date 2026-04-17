package dtos

import "time"

type ErrResp struct {
	Timestamp string `json:"timestamp"`
	Error     string `json:"error"`
	Path      string `json:"path"`
}

type ImagesResp struct {
	FullImgURI    string `json:"full_img_uri"`
	CroppedImgURI string `json:"cropped_img_uri"`
}

func NewErrResp(err, path string) *ErrResp {
	return &ErrResp{
		Timestamp: time.Now().Format(TIMESTAMP_FORMAT),
		Error:     err,
		Path:      path,
	}
}
