package models

import (
	"time"

	"gorm.io/gorm"
)

type Pc struct {
	ID             uint   `gorm:"primarykey"`
	Name           string `gorm:"uniqueIndex"`
	IP             string
	OS             string
	AppVersion     string
	Nod32          string
	Nod32Version   string
	Nod32FetchedAt time.Time
	UpdatedAt      time.Time
	CreatedAt      time.Time
}

func ListPc(db *gorm.DB) ([]Pc, error) {
	var list []Pc

	err := db.Find(&list).Error

	return list, err
}

func (pc *Pc) FindPcByName(db *gorm.DB, name string) error {
	return db.Where("name = ?", name).Find(&pc).Error
}

func (pc *Pc) UpdatePc(db *gorm.DB) error {
	return db.Save(&pc).Error
}

func (pc *Pc) CreatePc(db *gorm.DB) error {
	return db.Create(&pc).Error
}

func (pc *Pc) DeletePc(db *gorm.DB) error {
	return db.Delete(&pc).Error
}
