## Description

Data Anonymization Backend

## Project setup

1. **Install Dependencies**

```bash
$ npm install
```

2. **Set Up `.env` File (refer to `.env.example`**)

## Infrastructure Setup

### First Time Setup

1. **Install Docker**
   - Download and install Docker from [https://www.docker.com/get-started/](https://www.docker.com/products/docker-desktop)
   - Ensure Docker is running before proceeding

2. **Create & Start Infrastructure**

   ```bash
   $ npm run infrastructure:up
   ```

3. **Run Database Migrations**

   ```bash
   $ npm run migration:run
   ```

4. **Start the Application**
   ```bash
   $ npm run start
   ```

### Subsequent Setups (Infrastructure Already Exists)

1. **Start Infrastructure**

   ```bash
   $ npm run infrastructure:start
   ```

   - Migrations are already in place, no need to run them again
   - All data persists from previous sessions

2. **Start the Application**
   ```bash
   $ npm run start
   ```

### Infrastructure Management

- **Pause Infrastructure** (data persists)

  ```bash
  $ npm run infrastructure:stop
  ```

- **Fully Delete Infrastructure** (removes all data)
  ```bash
  $ npm run infrastructure:down
  ```

### Important Notes

- Ensure all ports defined in your `.env` file are not in use by other processes on your machine before starting the infrastructure.
- Check your `.env` file for the configured ports (`DB_PORT`, `PRESIDIO_ANONYMIZER_PORT`, and `PRESIDIO_ANALYZER_PORT`), as well as Ollama port `11434`.
- If you cannot kill the processes on your machine that are already using the mentioned ports, you need to change the ports in `.env` and `compose.yml`.

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## API Endpoints

### Rate Limiting

All endpoints are protected by rate limiting to prevent abuse.

**Global Rules:**
- 100 requests per hour per IP address
- Rate limits are tracked per IP, not per user

**Rate Limit Response (429):**
```json
{
  "statusCode": 429,
  "message": "Too Many Requests"
}
```

**Per-Endpoint Overrides:**
Some endpoints have stricter limits. See endpoint documentation below.

### Contact Message

Submit a contact us message from the frontend.

**POST** `/contact-messages`

**Rate Limit:** 5 requests per hour per IP address

**Request Body:**

```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "phoneNumber": "+15550000000",
  "message": "Your message here (max 5000 characters)"
}
```

**Features:**

- ✅ Input validation (email format, required fields, max lengths)
- ✅ XSS protection (HTML/JS sanitization via sanitize-html)
- ✅ Rate limiting (5 requests per hour per IP)
- ✅ Transaction-safe database operations (all-or-nothing)
- ✅ Clean, minimal API responses

**Response (201 Created):**

```json
{
  "message": "Contact message created successfully"
}
```

**Rate Limit Error (429):**

```json
{
  "statusCode": 429,
  "message": "Too Many Requests"
}
```
