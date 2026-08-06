// swift-tools-version: 6.0

import PackageDescription

let package = Package(
    name: "HarmoniAgent",
    platforms: [
        .macOS(.v14),
    ],
    products: [
        .executable(name: "harmoni-agent", targets: ["HarmoniAgent"]),
    ],
    targets: [
        .executableTarget(name: "HarmoniAgent"),
    ]
)
