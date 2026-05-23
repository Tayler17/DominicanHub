# Dominican Hub — Setup Guide (Windows)

## Prerequisites

Make sure you have installed:
- [Node.js 20+](https://nodejs.org/) — verify: `node --version`
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) — must be RUNNING
- [Git](https://git-scm.com/)

---

## Step-by-step setup

### 1. Open PowerShell and go to the project folder

```powershell
cd C:\Users\User\DominicanHub
```

### 2. Install root dependencies

```powershell
npm install
```

### 3. Install API dependencies

```powershell
cd apps\api
npm install
cd ..\..
```

### 4. Install Web dependencies

```powershell
cd apps\web
npm install
cd ..\..
```

### 5. Configure environment variables

```powershell
# The .env file was already created from .env.example
# Open it and set JWT_SECRET to any random string of 32+ characters
# Example: JWT_SECRET=dominican-hub-super-secret-key-2024-change-in-production
notepad .env
```

### 6. Start Docker (PostgreSQL + Redis)

Make sure Docker Desktop is open and running, then:

```powershell
docker compose up -d postgres redis
```

Wait ~10 seconds for postgres to be ready.

### 7. Run database migrations

```powershell
cd apps\api
npx prisma migrate dev --name init
```

### 8. Seed the database with test data

```powershell
npx prisma db seed
```

### 9. Start the API (Terminal 1)

```powershell
cd C:\Users\User\DominicanHub\apps\api
npm run dev
```

### 10. Start the Web (Terminal 2 — open a new PowerShell window)

```powershell
cd C:\Users\User\DominicanHub\apps\web
npm run dev
```

---

## Access the platform

| Service | URL |
|---------|-----|
| Marketplace | http://localhost:3000 |
| API | http://localhost:3001/api/v1 |
| Swagger docs | http://localhost:3001/docs |

## Test credentials (after seed)

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@dominicanHub.com | Admin1234! |
| Buyer | buyer@example.com | Buyer1234! |
| Vendor | vendor@example.com | Vendor1234! |

## Test the API immediately

```powershell
# Register a new user
curl -X POST http://localhost:3001/api/v1/auth/register `
  -H "Content-Type: application/json" `
  -d '{"email":"test@test.com","password":"Test1234!","firstName":"Test"}'

# Login
curl -X POST http://localhost:3001/api/v1/auth/login `
  -H "Content-Type: application/json" `
  -d '{"email":"test@test.com","password":"Test1234!"}'
```

