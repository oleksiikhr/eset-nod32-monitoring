# PC Monitoring

The service is installed on client PCs that periodically send Hostname and Net.Interfaces to the server.

Default url: `http://localhost:17518/`

<p align="center">
  <img src="https://raw.githubusercontent.com/Alexeykhr/pc-monitoring/master/screens/web.png?raw=true" alt="Home page">
</p>

## Server

- **Directory**: `server`
- **Module**: `pc_server`
- **Libraries**:
  - Framework: [Fiber](https://github.com/gofiber/fiber)
  - Environment: [Godotenv](https://github.com/joho/godotenv)
  - ORM: [Gorm](https://github.com/go-gorm/gorm)
  - Database: [Sqlite](https://github.com/go-gorm/sqlite)

### Commands

```shell
# Initialization

$ go mod vendor

# Development

$ go run .

# Production

## Linux
$ go build .
$ ./pc_server

# Windows
$ GOOS=windows GOARCH=386 CXX=i686-w64-mingw32-g++ CC=i686-w64-mingw32-gcc CGO_ENABLED=1 go build .
$ .\pc_server.exe
```

## Service

- **Directory**: `service`
- **Module**: `pc_service`
- **Libraries**:
  - Identify PC: [Machine ID](https://github.com/denisbrodbeck/machineid)
  - Working with service: [Service](https://github.com/kardianos/service)
  - Http Client: [Fasthttp](https://github.com/valyala/fasthttp)

### Commands

```shell
# Initialization
## Create a prod.go file with similar config as dev.go
## // +build prod

$ go mod vendor

# Development

$ go run . -run

# Production

## Linux
$ go build -tags prod
$ ./pc_service # run
$ ./pc_service -install # install service
$ ./pc_service -uninstall # uninstall service

## Windows
$ GOOS=windows GOARCH=386 CXX=i686-w64-mingw32-g++ CC=i686-w64-mingw32-gcc CGO_ENABLED=1 go build -tags prod
$ .\pc_service.exe # run
$ .\pc_service.exe -install # install service
$ .\pc_service.exe -uninstall # uninstall service
```

## Web

- **Directory**: `web`
- **Libraries**:
  - Builder: [Parcel](https://github.com/parcel-bundler/parcel)
  - CSS Framework: [Tailwindcss](https://github.com/tailwindlabs/tailwindcss)
  - Progress: [NProgress](https://github.com/rstacruz/nprogress)
  - Working with date: [Date-fns](https://github.com/date-fns/date-fns)

### Commands

```shell
# Development

$ npm run dev
$ npm run watch

# Production

$ npm run build
```
