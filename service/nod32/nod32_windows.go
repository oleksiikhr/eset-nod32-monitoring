//go:build windows

package nod32

import (
	"encoding/json"
	"os/exec"
)

const DefaultErmmPath = "C:\\Program Files\\ESET\\ESET Security\\eRmm.exe"

func GetApplicationInfo(ermmPath string) (*ApplicationInfo, error) {
	output, err := exec.Command(ermmPath, "get", "application-info").Output()
	if err != nil {
		return nil, err
	}

	var applicationInfo *ApplicationInfo
	if err = json.Unmarshal(output, &applicationInfo); err != nil {
		return nil, err
	}

	return applicationInfo, nil
}

func GetUpdateStatus(ermmPath string) (*UpdateStatus, error) {
	output, err := exec.Command(ermmPath, "get", "update-status").Output()
	if err != nil {
		return nil, err
	}

	var updateStatus *UpdateStatus
	if err = json.Unmarshal(output, &updateStatus); err != nil {
		return nil, err
	}

	return updateStatus, nil
}
