# By default just runs the first recipe (aliases are not considered recipes)

set windows-shell := ["cmd.exe", "/C"]

# Run this on Windows only

alias r := run
alias b := build
alias bf := build-fullstack
alias bc := build-client
alias fc := format-client
alias t := test
alias w := watch
alias c := clean

# much nicer to have it as private, so it doesn't show up in the recipe list
[private]
@default:
    just --list

all: build-client build test-client test seed

build-fullstack: build-client build

# Build the backend and automatically determine the output file based on the operating system
@build:
    echo "Building backend"
    @go build -v -o {{ if os_family() == "windows" { "build/main.exe" } else { "build/main" } }} cmd/api/main.go

# Build the frontend
@build-client:
    echo "Building client"
    cd ./client && npm install && npm run build

# Auto-format frontend files checked by format:check
@format-client:
    echo "Formatting client"
    cd ./client && npm run format

# Test Frontend file formatting, linting and unit tests
@test-client:
    echo "Testing client"
    cd ./client && npm install && npm run format:check && npm run lint && npm run test:run

# Run the application
@run:
    go run -v cmd/api/main.go

# Test the application
@test:
    echo "Testing..."
    go test ./... -v

# Clean the binary
@clean:
    echo "Cleaning..."
    rm -r build/*

# Live Reload
[script]
@watch:
    if command -v air > /dev/null; then
        air
        echo "Watching..."
    else
        read -p "Go's 'air' is not installed on your machine. Do you want to install it? [Y/n] " choice
        if [ "$$choice" != "n" ] && [ "$$choice" != "N" ]; then
            go install github.com/air-verse/air@latest
            air
            echo "Watching..."
        else
            echo "You chose not to install air. Exiting..."
            exit 1
        fi;
    fi

@seed:
    echo "starting database seeding..."
    go run cmd/seeder/main.go

@swagger:
    echo "generating swagger docs..."
    swag init -g ./cmd/api/main.go -o docs/swagger
