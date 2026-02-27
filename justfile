# By default just runs the first recipe (aliases are not considered recipes)

alias r := run
alias b := build
alias bf := build-fullstack
alias bc := build-client
alias t := test
alias w := watch
alias c := clean

# much nicer to have it as private, so it doesn't show up in the recipe list
[private]
@default:
    just --list

all: build-fullstack test seed

@build:
    echo "Building backend"
    @go build -v -o build/main cmd/api/main.go

build-fullstack: build-client build

@build-client:
    echo "Building client"
    cd ./client && npm install && npm run build

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
