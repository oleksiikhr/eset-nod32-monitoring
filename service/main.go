package main

import (
	"bufio"
	"errors"
	"flag"
	"fmt"
	"log"
	"net"
	"os"
	"strings"

	"github.com/kardianos/service"
	"github.com/valyala/fasthttp"
)

var logger service.Logger

type program struct{}

func (p *program) Start(s service.Service) error {
	hostname, err := os.Hostname()
	if err != nil {
		return err
	}

	go p.run(hostname)
	return nil
}

func (p *program) Stop(s service.Service) error {
	return nil
}

func main() {
	flags()
	isRun := flag.Bool("run", false, "Run the service")
	flag.Parse()

	// Create Service
	prg := &program{}
	s, err := service.New(prg, &service.Config{
		Name:        "PCM",
		DisplayName: "PCM",
		Arguments:   []string{"-run"},
	})
	if err != nil {
		log.Fatal(err)
	}

	// Create Logger
	if logger, err = s.Logger(nil); err != nil {
		log.Fatal(err)
	}

	if *isRun {
		err = s.Run()
	} else {
		fmt.Print("Install (i) / Uninstall (u) / Reinstall (r): ")
		input := bufio.NewScanner(os.Stdin)
		input.Scan()

		switch input.Text() {
		case "i":
			err = s.Install()
			_ = s.Start()
		case "u":
			_ = s.Stop()
			err = s.Uninstall()
		case "r":
			_ = s.Stop()
			_ = s.Uninstall()
			err = s.Install()
			_ = s.Start()
		default:
			err = errors.New("Invalid value")
		}

		fmt.Println(err)
		bufio.NewReader(os.Stdin).ReadBytes('\n')
	}

	if err != nil {
		logger.Error(err)
	}
}

func sendRequest(data map[string]string) error {
	req := fasthttp.AcquireRequest()
	resp := fasthttp.AcquireResponse()

	defer fasthttp.ReleaseRequest(req)
	defer fasthttp.ReleaseResponse(resp)

	req.SetRequestURI(UrlSend)

	for key, value := range data {
		req.URI().QueryArgs().Add(key, value)
	}

	return fasthttp.Do(req, resp)
}

func ipAddresses() string {
	ifaces, err := net.Interfaces()
	if err != nil {
		return ""
	}

	var output strings.Builder

	for _, iface := range ifaces {
		if iface.Flags&net.FlagUp == 0 {
			continue // interface down
		}

		if iface.Flags&net.FlagLoopback != 0 {
			continue // loopback interface
		}

		addrs, err := iface.Addrs()
		if err != nil {
			continue
		}

		for _, addr := range addrs {
			var ip net.IP

			switch v := addr.(type) {
			case *net.IPNet:
				ip = v.IP
			case *net.IPAddr:
				ip = v.IP
			}

			if ip == nil || ip.IsLoopback() {
				continue
			}

			ip = ip.To4()
			if ip == nil {
				continue // not an ipv4 address
			}

			output.WriteString(ip.String() + ",")
		}
	}

	return strings.TrimRight(output.String(), ",")
}
