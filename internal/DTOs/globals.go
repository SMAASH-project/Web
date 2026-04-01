package dtos

import "time"

// TODO: implement pagination

type ErrResp struct {
	Timestamp string `json:"timestamp"`
	Error     string `json:"error"`
	Path      string `json:"path"`
}

func NewErrResp(err, path string) *ErrResp {
	return &ErrResp{
		Timestamp: time.Now().Format(TIMESTAMP_FORMAT),
		Error:     err,
		Path:      path,
	}
}
