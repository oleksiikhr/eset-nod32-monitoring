package handlers

import (
	"strconv"

	"pc_server/database/models"
	"pc_server/resources"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

func HandlePc(app *fiber.App, db *gorm.DB) {
	group := app.Group("/pc")

	group.Get("/stats", pcStats(db))
	group.Get("/send", pcSend(db))
	group.Delete("/:id", pcDelete(db))
}

func pcStats(db *gorm.DB) func(ctx *fiber.Ctx) error {
	return func(ctx *fiber.Ctx) error {
		pcs, err := models.ListPc(db)
		if err != nil {
			return err
		}

		list := resources.ResponsePcs(pcs)

		return ctx.JSON(map[string]interface{}{
			"list": list,
		})
	}
}

func pcSend(db *gorm.DB) func(ctx *fiber.Ctx) error {
	return func(ctx *fiber.Ctx) error {
		reqPc := &resources.PcRequest{
			Name: ctx.Query("name"),
			Key: ctx.Query("key"),
			Ip: ctx.Query("ip"),
		}

		if err := resources.RequestValidatePc(reqPc); err != nil {
			return err
		}

		var pc models.Pc
		if err := pc.FindByKeyPc(db, reqPc.Key); err != nil {
			return err
		}

		resources.RequestMergePc(&pc, reqPc)

		if pc.ID == 0 {
			return pc.CreatePc(db)
		}

		return pc.UpdatePc(db)
	}
}

func pcDelete(db *gorm.DB) func(ctx *fiber.Ctx) error {
	return func(ctx *fiber.Ctx) error {
		id, err := strconv.ParseUint(ctx.Params("id"), 10, 64)
		if err != nil {
			return err
		}

		pc := models.Pc{ID: uint(id)}

		if pc.DeletePc(db) != nil {
			return err
		}

		return ctx.JSON(map[string]interface{}{
			"message": "Complete",
		})
	}
}
