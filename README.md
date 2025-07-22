# MedTrack API

MedTrack is a RESTful API for managing medications and reminders. It's designed to help users track their medication intake and receive timely reminders. Built with modern tools like **NestJS**, **TypeORM**, and **Redis** for caching.

---

## 🧭 Table of Contents

- [🛠️ Tech Stack](#️-tech-stack)
- [✨ Features](#-features)
- [🚀 Installation](#-installation)
- [📦 Running with Docker](#-running-with-docker)
- [🔐 Authentication](#-authentication)
- [📘 API Overview](#-api-overview)

---

## 🛠️ Tech Stack

- **Node.js** with [NestJS](https://nestjs.com/)
- **TypeScript**
- **TypeORM** with PostgreSQL
- **Redis** (for caching reminders)
- **Docker** (optional)
- **JWT** (authentication)

---

## ✨ Features

- User registration and login (JWT-based auth)
- CRUD for users and medications
- Daily reminders with caching
- Mark reminders as taken
- Pagination for lists
- Redis integration for fast retrieval of today's reminders
- Ready for Docker deployment

---

## 🚀 Installation

> Make sure you have Node.js, MYSQL, and Redis installed.

```bash
# Clone the repository
git clone https://github.com/hkhalaf1675/MedTrack-API.git
cd MedTrack-API

# Install dependencies
npm ci

# Set environment variables
cp .env.example .env
# Fill in your database URL and JWT secret in `.env`

# Run migrations
npm run migrate

# Start the development server
npm run start:dev

# Start the production server
npm start
```

## 📦 Running with Docker

> Make sure you have Docker and Docker compose installed.

```bash
# Use docker compose to run the project
docker-compose up --build

# Create docker image and run container from it
docker build --tag medtrackapi .

# Run the container
docker run --name medtrackapi-con --env-file ./.env medtrackapi
```

## 🔐 Authentication

> All protected routes require an Authorization header:

```http
Authorization: Bearer <JWT_TOKEN>
```

## 📘 API Overview <a name="api-overview"></a>  
**Base URL:** `{{baseUrl}}`  

---

## Authentication  
| Endpoint | Method | Description |  
|----------|--------|-------------|  
| `/api/auth/register` | `POST` | Register a new user |  
| `/api/auth/login` | `POST` | Log in and obtain JWT token |  

---

## Users  
| Endpoint | Method | Description |  
|----------|--------|-------------|  
| `/api/users` | `POST` | Create a new user |  
| `/api/users/:id` | `PATCH` | Update a user by ID |  
| `/api/users` | `DELETE` | Delete a user (requires `id` in body) |  
| `/api/users/:id` | `GET` | Get a user by ID |  
| `/api/users` | `GET` | Get paginated list of users |  

---

## Medications  
| Endpoint | Method | Description |  
|----------|--------|-------------|  
| `/api/medications` | `POST` | Create a new medication |  
| `/api/medications/:id` | `PATCH` | Update a medication by ID |  
| `/api/medications` | `DELETE` | Delete a medication (requires `id` in body) |  
| `/api/medications/:id` | `GET` | Get a medication by ID |  
| `/api/medications` | `GET` | Get paginated list of medications |  

---

## Reminders  
| Endpoint | Method | Description |  
|----------|--------|-------------|  
| `/api/reminders/:id/mark-taken` | `PATCH` | Update reminder status (e.g., mark as taken) |  
| `/api/reminders/:id` | `GET` | Get a reminder by ID |  
| `/api/reminders` | `GET` | Get paginated list of reminders |  
| `/api/reminders/today` | `GET` | Get today’s reminders (paginated & cached) |  

---