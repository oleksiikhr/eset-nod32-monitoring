package config

import (
	"os"
)

type Config struct {
	ServerAddr    string
	DatabaseName  string
}

func New() *Config {
	return &Config{
		DatabaseName: env("DB_FILE", "data.db"),
		ServerAddr: env("SERVER_ADDR", ":17518"),
	}
}

func env(key, fallback string) string {
	value := os.Getenv(key)
	if len(value) == 0 {
		return fallback
	}

	return value
}
