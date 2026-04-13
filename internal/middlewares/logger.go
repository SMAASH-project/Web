package middlewares

import (
	"context"
	"log/slog"
	"time"

	"github.com/gin-gonic/gin"
)

func Logger(logger *slog.Logger) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		start := time.Now()

		ctx.Next()

		status := ctx.Writer.Status()
		content := []slog.Attr{
			slog.String("method", ctx.Request.Method),
			slog.String("path", ctx.Request.URL.Path),
			slog.String("query", ctx.Request.URL.RawQuery),
			slog.Int("status", status),
			slog.Duration("latency", time.Since(start)),
			slog.String("client_ip", ctx.ClientIP()),
			slog.Int("body_size", ctx.Writer.Size()),
		}

		switch {
		case status > 499:
			logContent(logger, slog.LevelError, content)
		case status > 399 && status < 500:
			logContent(logger, slog.LevelWarn, content)
		default:
			logContent(logger, slog.LevelInfo, content)
		}
	}
}

func logContent(logger *slog.Logger, level slog.Level, data any) {
	logger.Log(context.Background(), level, "request", "data", data)
}
