QuantumTrades: Real-Time Trading Platform


Project Overview
QuantumTrades is a production-grade, real-time trading web application. It allows users to register, securely place trades, and view a live order book and personal trade history. The system is designed to handle complex order matching, real-time data streaming, and concurrent transactions.

#########
Architecture
The application follows a standard microservices architecture, orchestrated by Docker Compose for local development.

Frontend: A React-based Single-Page Application (SPA) that provides the user interface for the trading dashboard. It communicates with the backend via RESTful APIs and a dedicated WebSocket connection for live data.

Backend: A FastAPI server that handles all business logic, including user authentication, order matching, and API endpoints. It is the central hub for all data and real-time updates.

Database: A PostgreSQL database that serves as the persistent storage for users, orders, and trade history.
##############


Technology Stack
Backend: Python, FastAPI, and SQLAlchemy ORM

Frontend: React, JavaScript (ES6+), and Tailwind CSS

Database: PostgreSQL

Real-time Streaming: FastAPI WebSockets

Development & Deployment: Docker, Docker Compose

API Documentation
The backend exposes a set of RESTful APIs and a WebSocket endpoint for real-time data streaming.


##############
Endpoint (/api/...)    	HTTP Method	    Description
/auth/register	           POST	        Registers a new user with a hashed password.
/auth/login	               POST	        Authenticates a user and returns a JWT token.
/orders                	   POST	         Places a new buy or sell order.
/orders/{order_id}	       DELETE	    Cancels an active order by ID.
/orders/open	           GET	        Retrieves a list of the user's active, open orders.
/trades/history	           GET	        Retrieves the user's personal trade history.
/book/snapshot	           GET	        Returns the current state of the order book and recent trades.

Endpoint (/ws)	    Protocol	       Description
/ws	                 WebSocket	        Streams real-time updates for the order book and executed trades. Clients subscribe to receive live market data.



#######

Setup and Running the Project
This project uses Docker Compose to manage all services.

Prerequisites
Docker and Docker Compose installed on your system.
################

Step 1: Configure Environment Variables
Create a .env file in the root directory of the project and add the following configuration. This file contains sensitive information and is ignored by Git for security.

# Database credentials for PostgreSQL
POSTGRES_USER=admin
POSTGRES_PASSWORD=admin
POSTGRES_DB=quantumtrades

# Database connection URL for the backend
# Use the service name "db" as the host, not "localhost"
DATABASE_URL=postgresql+psycopg2://admin:admin@db:5432/quantumtrades

# JWT settings for user authentication
JWT_SECRET=dev_super_secret_change_me
JWT_ALGO=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60

# CORS settings to allow the frontend dev server to connect
BACKEND_CORS_ORIGINS=http://localhost:5173,http://localhost:3000
####################################


Step 2: Start the Services
From the root directory of the project, run the following command to build and start all services.

docker compose up --build

This command will:

Build the Docker images for the backend and frontend.

Start all three services (db, backend, and frontend) in the correct order.

Create a persistent volume for the database data.

Once the services are running, you can access the frontend dashboard at http://localhost:5173.
############################################

Testing and Code Quality
Running Tests
Unit and integration tests are located in the tests/ directory within the backend. To run the tests, you can use the following command from the backend service container.

docker compose exec backend pytest
###########################


Code Formatting and Static Analysis
The project uses black for code formatting and flake8 for static analysis to ensure consistent code style. You can run them with the following commands:

docker compose exec backend black 
docker compose exec backend flake8 
