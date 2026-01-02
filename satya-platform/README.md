# SATYA Platform

Secure Authentication & Transparent Yield Architecture (SATYA)
**One Identity, Zero Friction, Total Mobility.**

## Project Structure

```
satya-platform/
├── client-voter/           # React/Next.js: For Migrant Voters & Public Dashboard
├── client-admin/           # React/Tailwind: For ECI Officials (Roll Management)
├── server-core/            # Node.js/Go: The "Universal Translator" API
├── blockchain-network/     # Hyperledger Fabric: Chaincode & Network Config
├── ai-auth-service/        # Python/FastAPI: Facial Recognition & Liveness
└── docker-compose.yml      # Orchestration for local development
```

## Architecture Overview

SATYA is a comprehensive platform designed to enable seamless cross-state voting for migrant voters while maintaining security and transparency through blockchain and AI-powered authentication.

### Components

1. **Client Voter**: Frontend application for migrant voters to register, authenticate, and cast votes
2. **Client Admin**: Administrative interface for ECI officials to manage electoral rolls
3. **Server Core**: Central API gateway that orchestrates communication between all services
4. **Blockchain Network**: Hyperledger Fabric network for immutable voter records and cross-state synchronization
5. **AI Auth Service**: Facial recognition and liveness detection for secure voter authentication

## Quick Start

### Prerequisites
- Docker & Docker Compose
- Node.js (for local development)
- Python 3.8+ (for AI service)
- Go 1.18+ (if using Go for server-core)

### Running with Docker Compose

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

### Local Development

Each component has its own README with specific setup instructions. See individual component directories for details.

## Development Workflow

1. Start blockchain network first
2. Start AI auth service
3. Start server-core
4. Start client applications

## Contributing

This is a project for IEEE hackathon Jan 2026.

## License

[Add license information]


