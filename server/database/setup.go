package database

import (
	"pc_server/database/models"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

func Connect(name string) (*gorm.DB, error) {
	return gorm.Open(sqlite.Open(name), &gorm.Config{})
}

func Migrate(db *gorm.DB) {
	db.AutoMigrate(&models.Pc{})
}
