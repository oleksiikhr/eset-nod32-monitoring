//go:build !windows

package main

import (
	"runtime"
	"time"
)

func flags() {}

func (p *program) run(hostname string) {
	for {
		_ = sendRequest(map[string]string{
			"app_version": AppVersion,
			"name":        hostname,
			"ip":          ipAddresses(),
			"os":          runtime.GOOS,
		})

		runtime.GC()

		time.Sleep(time.Duration(Duration) * time.Second)
	}
}
