package main

import (
	"fmt"
	"log"

	"pc_server/config"
	"pc_server/database"
	"pc_server/routers"

	"github.com/joho/godotenv"
	"gorm.io/gorm"
)

func main() {
	godotenv.Load()

	cfg := config.New()
	db := loadDatabase(cfg.DatabaseName)

	fiber := routers.Setup(db)
	fmt.Println(fiber.Listen(cfg.ServerAddr))
}

func loadDatabase(name string) *gorm.DB {
	db, err := database.Connect(name)
	if err != nil {
		log.Fatal(err)
	}

	database.Migrate(db)

	return db
}
