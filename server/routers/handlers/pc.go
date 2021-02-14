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
		reqPc := new(resources.PcRequest)
		if err := ctx.QueryParser(reqPc); err != nil {
			return err
		}

		if err := resources.RequestValidatePc(reqPc); err != nil {
			return err
		}

		pc := new(models.Pc)
		if err := pc.FindPcByName(db, reqPc.Name); err != nil {
			return err
		}

		resources.MergePc(pc, reqPc)

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
