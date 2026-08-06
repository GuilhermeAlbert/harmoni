// swift-tools-version: 6.0

import PackageDescription

let package = Package(
    name: "HarmoniAgent",
    products: [
        .executable(name: "harmoni-agent", targets: ["HarmoniAgent"]),
    ],
    targets: [
        .executableTarget(name: "HarmoniAgent"),
    ]
)
