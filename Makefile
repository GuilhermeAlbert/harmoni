.DEFAULT_GOAL := help

.PHONY: help install dev web-dev version lint frontend-test frontend-build rust-check rust-test rust-clippy swift-test native-build validate package

help: ## Show the available commands
	@awk 'BEGIN {FS = ":.*## "; printf "Harmoni commands:\n\n"} /^[a-zA-Z0-9_-]+:.*## / {printf "  %-16s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

install: ## Install the locked frontend dependencies
	yarn install --frozen-lockfile

dev: ## Build prerequisites and run the Tauri desktop app
	yarn tauri dev

web-dev: ## Run only the Next.js frontend
	yarn dev

version: ## Verify version consistency across all native layers
	yarn version:check

lint: ## Lint the frontend
	yarn lint

frontend-test: ## Run frontend regression tests once
	yarn test:run

frontend-build: ## Build the static frontend
	yarn build

rust-check: ## Check the Rust desktop host with the lockfile
	cargo check --locked --manifest-path src-tauri/Cargo.toml

rust-test: ## Run all Rust tests with the lockfile
	cargo test --locked --manifest-path src-tauri/Cargo.toml

rust-clippy: ## Lint all Rust targets and deny warnings
	cargo clippy --locked --manifest-path src-tauri/Cargo.toml --all-targets -- -D warnings

swift-test: ## Run the Swift sidecar test suite
	cd native/macos-agent && swift test

native-build: ## Build the Swift sidecar for the current architecture
	yarn native:build

validate: version frontend-test lint frontend-build rust-check rust-test rust-clippy swift-test native-build ## Run the complete CI-equivalent validation

package: validate ## Build unsigned local .app and DMG artifacts
	yarn package:mac
