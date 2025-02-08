# Insomnia Task - Avalanche USDC Transfer Analyzer

## Overview
This project is a **NestJS (TypeScript) backend service** that interacts with the **Avalanche blockchain** to fetch, aggregate, and analyze **USDC (ERC-20) transactions**. It provides an API for retrieving real-time transfer data and insights.

## Features
- Connects to **Avalanche blockchain** via RPC node
- Fetches and aggregates **USDC transactions**
- Stores transaction data in **PostgreSQL**
- Exposes **REST API endpoints** for querying USDC transfers
- **Swagger API documentation**
- Dockerized setup for easy deployment
- Unit tests included

---

## **1. Getting Started**

### **Prerequisites**
Make sure you have the following installed:
- **Node.js (v18+)**
- **Docker & Docker Compose**
- **PostgreSQL (optional for local setup)**

### **Installation**
1. Clone the repository:
   ```sh
   git clone https://github.com/vlaksi/insomnia-task.git
   cd insomnia-task
   ```

2. Install dependencies:
   ```sh
   npm install
   ```

3. Create a **.env** file:
   ```sh
   cp .env.example .env
   ```
   Update the `.env` file with your **Avalanche RPC URL**, **PostgreSQL credentials**, and other configurations.

---

## **2. Running the Application**

### **Running in Development Mode**
For local development, use:
```sh
docker-compose up -d
```
- This starts **only PostgreSQL** inside Docker.
- The application runs **outside Docker** (directly on your machine).
- Use this setup when actively developing and debugging.

After starting the database container, run:
```sh
npm run start:dev
```

---

### **Running in Production Mode**
For **production deployment**, use:
```sh
docker-compose -f docker-compose.prod.yml up --build -d
```
- This **dockerizes the entire application**, including the backend.
- PostgreSQL is also started inside Docker.
- Use this setup when **deploying to a server** or when you want the **backend to run in a container**.

To stop the production containers:
```sh
docker-compose -f docker-compose.prod.yml down
```

---

## **3. API Endpoints & Documentation**

### **Base URL:** `http://localhost:3000`

| Method | Endpoint | Description |
|--------|---------|-------------|
| GET | `/transactions` | Fetch latest USDC transactions |
| GET | `/summary` | Get aggregated transaction data |
| GET | `/top-accounts` | Get top accounts by USDC volume |

Example request:
```sh
curl -X GET http://localhost:3000/transactions
```

### **Swagger API Documentation**
Once the application is running, you can access the **Swagger UI** at:
```
http://localhost:3000/api
```
Swagger provides an interactive way to explore and test API endpoints.

---

## **4. Project Structure**
```bash
insomnia-task/
├── src/
│   ├── modules/
│   ├── services/
│   ├── controllers/
│   ├── database/
│   ├── app.module.ts
│   ├── main.ts
├── test/
├── .env.example
├── .dockerignore
├── Dockerfile
├── docker-compose.yml
├── docker-compose.prod.yml
├── README.md
└── package.json
```

---

## **5. Testing**
To run unit tests:
```sh
npm run test
```
To check test coverage:
```sh
npm run test:cov
```

---

## **6. Deployment**
For **production deployment**, build and start the app with:
```sh
docker-compose -f docker-compose.prod.yml up --build -d
```
Use this when deploying to a **server or cloud environment**.

If running locally for development, only start PostgreSQL in Docker and run the app outside Docker:
```sh
docker-compose up -d
npm run start:dev
```

---

## **7. License**
This project is **UNLICENSED**. Modify as needed.

---

## **8. Contributors**
- **Vladislav Maksimovic** - *Developer*

---

For any questions, feel free to open an issue!