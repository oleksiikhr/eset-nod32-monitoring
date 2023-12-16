package resources

import (
	"errors"
	"strings"
	"time"

	"pc_server/database/models"
)

type PcResponse struct {
	ID             uint      `json:"id"`
	Name           string    `json:"name"`
	IP             []string  `json:"ip"`
	OS             string    `json:"os"`
	AppVersion     string    `json:"app_version"`
	Nod32          string    `json:"nod32"`
	Nod32Version   string    `json:"nod32_version"`
	Nod32FetchedAt time.Time `json:"nod32_fetched_at"`
	CreatedAt      time.Time `json:"created_at"`
	UpdatedAt      time.Time `json:"updated_at"`
}

type PcRequest struct {
	Name           string    `query:"name"`
	IP             string    `query:"ip"`
	OS             string    `query:"os"`
	AppVersion     string    `query:"app_version"`
	Nod32          string    `query:"nod32"`
	Nod32Version   string    `query:"nod32_version"`
	Nod32FetchedAt time.Time `query:"nod32_fetched_at"`
}

func RequestValidatePc(pc *PcRequest) error {
	if pc.Name == "" {
		return errors.New("name empty")
	}

	return nil
}

func MergePc(pc *models.Pc, reqPc *PcRequest) {
	pc.Name = reqPc.Name
	pc.IP = reqPc.IP
	pc.OS = reqPc.OS
	pc.AppVersion = reqPc.AppVersion
	pc.Nod32 = reqPc.Nod32
	pc.Nod32Version = reqPc.Nod32Version
	pc.Nod32FetchedAt = reqPc.Nod32FetchedAt
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
	resp.Name = pc.Name
	resp.IP = encodePcIp(pc.IP)
	resp.OS = pc.OS
	resp.AppVersion = pc.AppVersion
	resp.Nod32 = pc.Nod32
	resp.Nod32Version = pc.Nod32Version
	resp.Nod32FetchedAt = pc.Nod32FetchedAt
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
