# Insomnia Task - Avalanche USDC Transfer Analyzer

## Overview

This project is a **NestJS (TypeScript) backend service** that interacts with the **Avalanche blockchain** to fetch, aggregate, and analyze **USDC (ERC-20) transactions**. It provides an API for retrieving real-time transfer data and insights.





## Features

- Connects to **Avalanche blockchain** via RPC node
- Fetches and aggregates **USDC transactions**
- Stores transaction data in **PostgreSQL**
- Exposes **REST API endpoints** for querying USDC transfers
- **Swagger API documentation**
- Dockerized DB setup
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

## **2. Running the Application Locally**

### **Running in Development Mode**

For local development, use:

```sh
docker-compose up -d
```

- This starts **only PostgreSQL** inside Docker.
- The application runs **outside Docker** (directly on your machine).
- Use this setup when actively developing and debugging.

After starting the database container, run:

````sh
npm run start:dev

## **3. API Endpoints & Documentation**

### **Base URL:** `http://localhost:3000`

| Method | Endpoint | Description |
|--------|---------|-------------|
| GET | `/total-transferred` | Get total USDC transferred in a given time interval |
| GET | `/top-sender-accounts` | Get Top 10 Sender Account |
| GET | `/top-receiver-accounts` | Get Top 10 Receiver Accounts |
| GET | `/paginated` | Get paginated transactions |
| GET | `/largest` | Get largest transactions |
| GET | `/:hash` | Get transaction details by hash |

Example request:
```sh

curl -X GET http://localhost:3000/transactions/top-sender-accounts
````

```
### **Swagger API Documentation**

Using **Swagger UI** video:

![](https://pouch.jumpshare.com/preview/L5N1fsymAUrQmvGC80QOgnHiRvFlwSwwn1FdhUVMdnoKRlkaAtcmDMuVWJIxisT011qd8bWWaS14ZLdIV6TPpW_oha6mwurR-mNhoY4CucI)


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
├── .elasticbeanstalk/
├── src/
│   ├── transactions/          
│   ├── usdc/                  
│   ├── app.controller.ts      
│   ├── app.module.ts          
│   ├── app.service.ts         
│   ├── main.ts                
├── test/                      
├── versions/                  
├── .env.example               
├── .dockerignore              
├── Dockerfile                 
├── docker-compose.yml         
├── docker-compose.prod.yml    
├── README.md                  
├── package.json               
├── package-lock.json          
├── tsconfig.json              
├── tsconfig.build.json        
├── eslint.config.mjs          
├── nest-cli.json              
├── .gitignore                 
├── .prettierrc                
└── ARCHITECTURE.md            
```

---

## **5. Testing**

To run unit tests:

```sh
npm run test
```

---

## **6. Deployment**

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

- **Vladislav Maksimovic** - _Developer_
