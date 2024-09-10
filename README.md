# ETH Deposit Tracking with Prometheus and Grafana Monitoring

This project monitors Ethereum deposits on a smart contract using `ethers.js` and tracks deposit events. It is integrated with Prometheus for metrics collection and Grafana for visualization. The application is Dockerized for easy deployment and scaling.

---

## Features

- **Deposit Tracking**: Monitors Ethereum smart contract deposits and saves them to MongoDB.
- **Prometheus Metrics**: Tracks deposit events, transaction data, and blockchain blocks.
- **Grafana Dashboards**: Visualize deposit metrics in real-time.
- **Error Handling**: Robust logging and error handling for deposit events and blockchain interactions.
- **Dockerized Setup**: Deploy the entire stack (Node.js, Prometheus, and Grafana) with Docker Compose.

---

## Table of Contents

1. [Setup](https://www.notion.so/b0e4e4c92ada4e06b05afc05d96f32a4?pvs=21)
2. [Environment Variables](https://www.notion.so/b0e4e4c92ada4e06b05afc05d96f32a4?pvs=21)
3. [Code Structure](https://www.notion.so/b0e4e4c92ada4e06b05afc05d96f32a4?pvs=21)
4. [Monitoring with Prometheus and Grafana](https://www.notion.so/b0e4e4c92ada4e06b05afc05d96f32a4?pvs=21)
5. [Dockerization](https://www.notion.so/b0e4e4c92ada4e06b05afc05d96f32a4?pvs=21)
6. [Video Demo](https://www.notion.so/b0e4e4c92ada4e06b05afc05d96f32a4?pvs=21)

---

## Setup

1. **Clone the repository**:
    
    ```bash
    git clone <https://github.com/username/repository-name.git>
    cd repository-name
    
    ```
    
2. **Install dependencies**:
    
    ```bash
    npm install
    
    ```
    
3. **Set up environment variables** in a `.env` file:
    
    ```
    INFURA_API_KEY=<Your Infura API Key>
    MONGO_URI=<Your MongoDB URI>
    CONTRACT_ADDRESS=<Ethereum contract address>
    PORT=3000
    TELEGRAM_BOT_TOKEN=<Your Telegram Bot Token>
    TELEGRAM_CHAT_ID=<Your Telegram Chat ID>
    
    ```
    
4. **Run the application**:
    
    ```bash
    npm start
    
    ```
    

---

## Environment Variables

Ensure you have the following environment variables configured in your `.env` file:

- `INFURA_API_KEY`: Your Infura API key for connecting to the Ethereum network.
- `MONGO_URI`: MongoDB connection string.
- `CONTRACT_ADDRESS`: Ethereum contract address for monitoring deposits.
- `PORT`: Port for the Express app.
- `TELEGRAM_BOT_TOKEN`: Telegram bot token for sending notifications.
- `TELEGRAM_CHAT_ID`: Telegram chat ID for receiving notifications.

---

## Code Structure

- **`/src`**: Contains source code for the project.
    - **`/abi`**: Contains the ABI of the contract.
    - **`/models`**: Defines the MongoDB deposit schema.
    - **`/utils`**: Helper functions like sending Telegram notifications.
    - **`/metrics`**: Defines Prometheus metrics for blocks, deposits, and amounts.
- **`app.js`**: Main entry point for the Node.js server and Ethereum deposit tracking.
- **`Dockerfile`**: Docker configuration for the application.

---

## Monitoring with Prometheus and Grafana

This project integrates Prometheus and Grafana for real-time monitoring of Ethereum deposit events and block confirmations.

- **Prometheus**: Collects metrics such as:
    - Total number of deposits.
    - Block confirmations.
    - Ethereum deposit amounts.
- **Grafana**: Visualizes these metrics in a user-friendly dashboard.

---

## Dockerization

This project is Dockerized for easy setup and scaling. Use Docker Compose to run the entire stack (Node.js app, Prometheus, and Grafana).

1. **Build and start the services**:
    
    ```bash
    docker-compose up --build
    
    ```
    
2. **Access the services**:
    - **Node App**: `http://localhost:3000`
    - **Prometheus**: `http://localhost:9090`
    - **Grafana**: `http://localhost:3001` (default username: `admin`, password: `admin`)
3. **Prometheus Configuration (`prometheus.yml`)**:
The configuration for Prometheus is provided in `prometheus.yml` to scrape metrics from the Node.js app.

---

## Docker Compose Configuration

Here’s the `docker-compose.yml` used for setting up the Node.js app, Prometheus, and Grafana:

```yaml
version: "3.8"

services:
  node-app:
    build: ./
    ports:
      - "3000:3000"
    networks:
      - monitoring

  prometheus:
    image: prom/prometheus:latest
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
    ports:
      - "9090:9090"
    networks:
      - monitoring

  grafana:
    image: grafana/grafana:latest
    ports:
      - "3001:3000"
    networks:
      - monitoring
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin

networks:
  monitoring:
