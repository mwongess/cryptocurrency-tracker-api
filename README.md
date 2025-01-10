# Cryptocurrency Tracker API

## Overview
The Cryptocurrency Tracker API allows users to fetch real-time cryptocurrency data, manage their portfolios, and gain insights into their investments. This README provides instructions for running the application locally and testing the API.

## Prerequisites
- Node.js (v16 or later)
- An API key for CoinMarketCap (https://coinmarketcap.com/api/)

## Running the Application Locally

### 1. Clone the Repository
```bash
git clone https://github.com/mwongess/cryptocurrency-tracker-api.git
cd cryptocurrency-tracker-api
```
### 2. Set Up Environment Variables
Create a `.env` file in the root directory and populate it with the following:
```env
MONGO_URI=mongodb://localhost:27017/crypto_tracker
PORT=3000
API_KEY=<your-coinmarketcap-api-key>
```
### 3. Build and Run the Docker Container
Build the Docker image and run the container using the following commands:

```bash
docker compose up --build
```

## 4. Deployed Api
```
http://35.92.155.164:3000/api-docs/
```
## Testing the API

### Swagger Documentation
The API is documented using Swagger. Once the application is running, visit:
```
http://localhost:3000/api-docs 
http://35.92.155.164:3000/api-docs  //Deployed Api

```

### Endpoints

#### 1. Fetch and Store Cryptocurrency Prices
- **URL:** `GET /api/cryptocurrencies`
- **Description:** Fetches the latest cryptocurrency prices and stores them in the database. Returns the top 10 cryptocurrencies sorted by market cap.
- **Response:**
  ```json
  {
    "message": "Top 10 cryptocurrencies",
    "data": [
      {
        "symbol": "BTC",
        "name": "Bitcoin",
        "price": 50000,
        "market_cap": 1000000000
      }
    ]
  }
  ```

#### 2. Create a Portfolio Entry
- **URL:** `POST /api/portfolio`
- **Description:** Creates a new portfolio entry for a user.
- **Body:**
  ```json
  {
    "userId": "12345",
    "symbol": "BTC",
    "quantity": 2,
    "purchasePrice": 45000
  }
  ```
- **Response:**
  ```json
  {
    "userId": "12345",
    "symbol": "BTC",
    "quantity": 2,
    "purchasePrice": 45000
  }
  ```

#### 3. Fetch Portfolio
- **URL:** `GET /api/portfolio?userId=<userId>`
- **Description:** Fetches the portfolio for a user, including current values.
- **Response:**
  ```json
  [
    {
      "userId": "12345",
      "symbol": "BTC",
      "quantity": 2,
      "purchasePrice": 45000,
      "currentPrice": 50000,
      "totalValue": 100000
    }
  ]
  ```

#### 4. Update Portfolio Entry
- **URL:** `PUT /api/portfolio/{id}`
- **Description:** Updates an existing portfolio entry.
- **Body:**
  ```json
  {
    "quantity": 3,
    "purchasePrice": 47000
  }
  ```
- **Response:**
  ```json
  {
    "userId": "12345",
    "symbol": "BTC",
    "quantity": 3,
    "purchasePrice": 47000
  }
  ```

#### 5. Delete Portfolio Entry
- **URL:** `DELETE /api/portfolio/{id}`
- **Description:** Deletes a portfolio entry.
- **Response:**
  ```json
  {
    "message": "Portfolio entry deleted successfully."
  }
  ```

#### 6. Get Portfolio Insights
- **URL:** `GET /api/portfolio/insights?userId=<userId>`
- **Description:** Retrieves insights about the user's portfolio.
- **Response:**
  ```json
  {
    "totalValue": 91388.33261029968,
    "totalGainLoss": 91147.33261029968,
    "percentageGainLoss": "37820.47",
    "insights": []
  }
  ```

