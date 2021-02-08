# PC Monitoring

The service is installed on client PCs that periodically send Hostname and Net.Interfaces to the server.

`http://pc.watch:17518/`

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
$ GOOS=windows GOARCH=amd64 go build .
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

$ go mod vendor

# Development

$ go run .

# Production

## Linux
$ go build .
$ ./pc_service # run
$ ./pc_service -install # install service
$ ./pc_service -uninstall # uninstall service

## Windows
$ GOOS=windows GOARCH=386 CXX=i686-w64-mingw32-g++ CC=i686-w64-mingw32-gcc CGO_ENABLED=1 go build .
$ .\pc_service.exe # run
$ .\pc_service.exe -install # install service
$ .\pc_service.exe -uninstall # uninstall service
```

## Web

- **Directory**: `web`
- **Libraries**:
  - Css Framework: [Tailwindcss](https://github.com/tailwindlabs/tailwindcss)

### Commands

```shell
# Development

$ npm run dev

# Production

$ npm run prod
```
