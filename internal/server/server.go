package server

import (
	"context"
	"errors"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"smaash-web/internal/controllers"
	"syscall"
	"time"

	_ "github.com/joho/godotenv/autoload"
)

type Server struct {
	srv         *http.Server
	gracePeriod time.Duration
	controllers []controllers.Controller
}

func NewServer() *Server {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	return &Server{
		gracePeriod: 5 * time.Second,
		srv: &http.Server{
			Addr:              fmt.Sprintf(":%v", port),
			IdleTimeout:       time.Minute,
			ReadHeaderTimeout: 10 * time.Second,
			WriteTimeout:      30 * time.Second,
		},
	}
}

func (s *Server) AddController(c controllers.Controller) *Server {
	s.controllers = append(s.controllers, c)
	return s
}

func (s *Server) SetGracePeriod(gracePeriod time.Duration) *Server {
	s.gracePeriod = gracePeriod
	return s
}

func (s *Server) Run(c context.Context) error {
	srvErrStream := make(chan error, 1)
	quitStream := make(chan os.Signal, 1)

	go func() {
		if err := s.srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			srvErrStream <- err
		}
		close(srvErrStream)
	}()

	signal.Notify(quitStream, syscall.SIGINT, syscall.SIGTERM)

	select {
	case err := <-srvErrStream:
		return err
	case <-quitStream:
		log.Println("Shutdown signal recieved, attempting graceful shutdown. Press Ctrl+c again to force shutdown")
	case <-c.Done():
		log.Println("Application context cancelled, attempting graceful shutdown. Press Ctrl+c again to force shutdown")
	}
	signal.Stop(quitStream)

	shutdownCtx, cancel := context.WithTimeout(context.Background(), s.gracePeriod)
	defer cancel()

	if err := s.srv.Shutdown(shutdownCtx); err != nil {
		if err2 := s.srv.Close(); err2 != nil {
			return errors.Join(err, err2)
		}
		return err
	}

	log.Println("Graceful shutdown completed")
	return nil
}
