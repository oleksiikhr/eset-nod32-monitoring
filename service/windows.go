// +build windows

package main

import (
	"flag"
	"runtime"
	"time"

	"pc_service/nod32"

	"golang.org/x/sys/windows/registry"
)

var nod32ErmmPath string
var nod32Disabled bool

func flags() {
	flag.StringVar(&nod32ErmmPath, "nod32", nod32.DefaultErmmPath, "Change path to nod32 eRmm.exe file")
	flag.BoolVar(&nod32Disabled, "nod32-disabled", false, "Disable collect data from Nod32")
}

func (p *program) run(hostname string) {
	os, _ := findWindowsVersion()

	for {
		data := map[string]string{
			"name": hostname,
			"ip":   ipAddresses(),
			"os":   os,
		}

		if !nod32Disabled {
			nod32Version, nod32UpdateTime := findNod32()

			data["nod32_version"] = nod32Version
			data["nod32_fetched_at"] = nod32UpdateTime.Format(time.RFC3339)
		}

		_ = sendRequest(data)

		runtime.GC()

		time.Sleep(time.Duration(Duration) * time.Second)
	}
}

func findNod32() (string, time.Time) {
	var updateTime time.Time
	if resp, err := nod32.GetUpdateStatus(nod32ErmmPath); err == nil {
		if resp.Result != nil {
			updateTime, _ = time.Parse("2006-01-02 15-04-05", resp.Result.LastSuccessfulUpdateTime)
		}
	}

	var version string
	if resp, err := nod32.GetApplicationInfo(nod32ErmmPath); err == nil {
		if resp.Result != nil {
			for _, module := range resp.Result.Modules {
				if module.ID == "SCANNER32" {
					version = module.Version
				}
			}
		}
	}

	return version, updateTime
}

func findWindowsVersion() (string, error) {
	k, err := registry.OpenKey(registry.LOCAL_MACHINE, `SOFTWARE\Microsoft\Windows NT\CurrentVersion`, registry.QUERY_VALUE)
	if err != nil {
		return runtime.GOOS, err
	}
	defer k.Close()

	pn, _, err := k.GetStringValue("ProductName")
	if err != nil {
		return runtime.GOOS, err
	}

	cb, _, err := k.GetStringValue("CurrentBuild")
	if err != nil {
		return runtime.GOOS, err
	}

	return pn + " (" + cb + ")", nil
}
