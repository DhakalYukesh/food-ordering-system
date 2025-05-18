# Food Ordering System

A microservice-based food ordering platform built with NestJS and Nx monorepo architecture.

## Overview

This system provides a complete solution for online food ordering, managing restaurants, users, orders, and payment processing through a modular microservice architecture.

## System Architecture

The application is structured as a set of independent microservices communicating with each other:

- **API Gateway**: Entry point for all client requests, routing them to appropriate services
- **User Service**: Handles user registration, authentication, and profile management
- **Restaurant Service**: Manages restaurant details, menus, and item availability
- **Order Service**: Processes order creation, tracking, and history
- **Wallet Service**: Manages customer payment methods and transaction history

## Technologies Used

- **Framework**: NestJS (Node.js)
- **Architecture**: Microservices
- **Development Tools**: Nx Monorepo
- **Runtime Communication**: REST APIs (with potential for message queues)
- **Package Management**: npm
- **Development Language**: TypeScript

## Getting Started

### Prerequisites

- Node.js (v16+)
- npm
- Docker and Docker Compose (optional, for containerization)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd food-ordering-system
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npx nx serve api-gateway
```

### Running Individual Services

Each service can be run independently:

```bash
# API Gateway
npx nx serve api-gateway

# User Service
npx nx serve user

# Restaurant Service
npx nx serve restaurant

# Order Service
npx nx serve order

# Wallet Service
npx nx serve wallet
```

## Development

### Project Structure

```
food-ordering-system/
├── apps/
│   ├── api-gateway/     # API Gateway service
│   ├── user/            # User management service
│   ├── restaurant/      # Restaurant management service
│   ├── order/           # Order processing service
│   └── wallet/          # Payment processing service
├── libs/
│   ├── common/          # Shared utilities and models
│   └── rmq/             # RabbitMQ configurations (if used)
├── docker-compose.yml   # Docker configuration
└── package.json         # Project dependencies
```

### Adding Features

To create a new feature:

```bash
npx nx g @nx/nest:resource --project=<service-name> --directory=app --name=<feature-name>
```

## Deployment

The services can be containerized and deployed using Docker:

```bash
# Build and start all services in detached mode
docker-compose up -d

# View the logs
docker-compose logs -f

# Stop all services
docker-compose down
```

### Docker Services

The following services will be available:

- User Service: http://localhost:3001/api/v1
- Order Service: http://localhost:3002/api/v1
- Restaurant Service: http://localhost:3003/api/v1
- Wallet Service: http://localhost:3004/api/v1
- RabbitMQ Management: http://localhost:15672 (user: yukesh, pass: yukesh)
- PostgreSQL: localhost:5432

## License

MIT

---
Created as part of the Software Architecture & Design Pattern coursework at Islington College - April 2025.