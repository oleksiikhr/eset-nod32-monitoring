package resources

import (
	"errors"
	"strings"
	"time"

	"pc_server/database/models"
)

type PcResponse struct {
	ID        uint      `gorm:"primarykey" json:"id"`
	Key       string    `gorm:"uniqueIndex" json:"key"`
	Name      string    `json:"name"`
	Ip        []string  `json:"ip"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

type PcRequest struct {
	Key  string `json:"key"`
	Name string `json:"name"`
	Ip   string `json:"ip"`
}

func RequestValidatePc(pc *PcRequest) error {
	if pc.Name == "" {
		return errors.New("name empty")
	}

	if pc.Key == "" {
		return errors.New("key empty")
	}

	return nil
}

func RequestMergePc(pc *models.Pc, reqPc *PcRequest) {
	pc.Key = reqPc.Key
	pc.Name = reqPc.Name
	pc.Ip = reqPc.Ip
}

func ResponsePcs(pcs []models.Pc) []PcResponse {
	resp := make([]PcResponse, len(pcs))

	for i, p := range pcs {
		resp[i] = ResponsePc(p)
	}

	return resp
}

func ResponsePc(pc models.Pc) PcResponse {
	var resp PcResponse

	resp.ID = pc.ID
	resp.Key = pc.Key
	resp.Name = pc.Name
	resp.Ip = encodePcIp(pc.Ip)
	resp.CreatedAt = pc.CreatedAt
	resp.UpdatedAt = pc.UpdatedAt

	return resp
}

func encodePcIp(ip string) []string {
	if ip == "" {
		return []string{}
	}

	return strings.Split(ip, ",")
}
