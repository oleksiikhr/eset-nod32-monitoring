package routers

import (
	"pc_server/routers/handlers"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"gorm.io/gorm"
)

func Setup(db *gorm.DB) *fiber.App {
	app := fiber.New()

	app.Use(logger.New())

	app.Static("/", "./public")

	handlers.HandlePc(app, db)

	return app
}
