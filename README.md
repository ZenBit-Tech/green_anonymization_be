# Clinical Data De-Identification Backend

![NestJS](https://img.shields.io/badge/NestJS-E0234E?logo=nestjs)
![MySQL](https://img.shields.io/badge/MySQL-4479A1?logo=mysql)
![AWS](https://img.shields.io/badge/AWS_S3-FF9900?logo=amazonaws)
![Docker](https://img.shields.io/badge/Docker-2496ED?logo=docker)

Backend service for clinical document de-identification and synthetic data generation.

The application provides secure document processing, PII detection and anonymization, compliance framework management, synthetic data generation, user authentication, subscription management, and analytics support.

## Supported Compliance Frameworks

- HIPAA (US)
- EU GDPR
- UK GDPR
- Swiss FADP

The platform leverages Microsoft Presidio for automated detection and anonymization of personally identifiable information (PII) within clinical documents.

---

# Technology Stack

## Core

- NestJS
- TypeScript
- TypeORM
- MySQL

## Authentication

- JWT Authentication
- Google OAuth
- Microsoft OAuth
- Magic Link Authentication

## Data Privacy

- Microsoft Presidio

## Infrastructure

- Docker
- AWS S3
- Heroku

## Documentation

- Swagger

---

# Database Schema

<p align="center">
  <img
    width="100%"
    alt="DB schema"
    src="https://github.com/user-attachments/assets/07c6493b-7a3e-4d4d-8ae8-d651f80a9d94"
  />
</p>

---

# API Documentation

### Local

```bash
http://localhost:3000/api
```

### Production

```bash
https://green-anonymization-be-602a891d18c3.herokuapp.com/api
```

---

# Project Setup

## Install Dependencies

```bash
npm install
```

## Set Up .env File

Refer to `.env.example`

---

# Infrastructure Setup

## First Time Setup

### Install Docker

Download and install Docker:

https://www.docker.com/get-started/

Ensure Docker is running before proceeding.

### Create & Start Infrastructure

```bash
npm run infrastructure:up
```

### Run Database Migrations

```bash
npm run migration:run
```

### Start the Application

```bash
npm run start
```

---

## Subsequent Setups (Infrastructure Already Exists)

### Start Infrastructure

```bash
npm run infrastructure:start
```

Migrations are already in place, no need to run them again.

All data persists from previous sessions.

### Start the Application

```bash
npm run start
```

---

# Infrastructure Management

## Pause Infrastructure (data persists)

```bash
npm run infrastructure:stop
```

## Fully Delete Infrastructure (removes all data)

```bash
npm run infrastructure:down
```

---

# Important Notes

Ensure all ports defined in your `.env` file are not in use by other processes before starting the infrastructure.

Check your `.env` file for configured ports:

- DB_PORT
- PRESIDIO_ANALYZER_PORT
- PRESIDIO_ANONYMIZER_PORT

If these ports are already occupied, update both `.env` and `compose.yml`.

---

# Compile and Run the Project

## Development

```bash
npm run start
```

## Watch Mode

```bash
npm run start:dev
```

## Production Mode

```bash
npm run start:prod
```

---

# Run Tests

## Unit Tests

```bash
npm run test
```

## E2E Tests

```bash
npm run test:e2e
```

## Test Coverage

```bash
npm run test:cov
```

---

# Main Modules

- Authentication
- Users
- Documents
- PII Entities
- Compliance Frameworks
- Synthetic Data Generation
- Subscription Plans
- Contact Messages
- Analytics

---

# Deployment

## Production Environment

- Heroku
- AWS S3
- MySQL

### Build

```bash
npm run build
```

### Production Start

```bash
npm run start:prod
```

---

# Rate Limiting

All endpoints are protected by rate limiting to prevent abuse.

## Global Rules

- 100 requests per hour per IP address
- Limits are tracked per IP address

### Rate Limit Response

```json
{
  "statusCode": 429,
  "message": "Too Many Requests"
}
```

Some endpoints may have stricter limits.

