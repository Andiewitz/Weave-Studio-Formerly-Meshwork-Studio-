---
description: How to set up and run the application locally
---

This workflow helps you set up and run the EMNESH application on your local machine.

### Prerequisites
- Docker (for PostgreSQL database)
- Node.js (v18 or later)

### Steps

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start the Database**
   // turbo
   ```bash
   docker run --name emnesh-db -e POSTGRES_USER=user -e POSTGRES_PASSWORD=password -e POSTGRES_DB=emnesh -p 5432:5432 -d postgres:16
   ```

3. **Set up Environment Variables**
   Create a `.env` file in the root directory (already created for you):
   ```env
   DATABASE_URL=postgresql://user:password@localhost:5432/emnesh
   SESSION_SECRET=a_very_secret_key_12345
   REPL_ID=local-development
   PORT=5000
   NODE_ENV=development
   ```

4. **Initialize the Database Schema**
   // turbo
   ```powershell
   $env:DATABASE_URL="postgresql://user:password@localhost:5432/emnesh"; npm run db:push
   ```

5. **Run the Application**
   // turbo
   ```powershell
   $env:NODE_ENV="development"; $env:DATABASE_URL="postgresql://user:password@localhost:5432/emnesh"; $env:SESSION_SECRET="a_very_secret_key_12345"; $env:REPL_ID="local-development"; $env:PORT="5000"; npx tsx server/index.ts
   ```

### Mock Authentication
Since this app was originally built for Replit, I have implemented a **Development Mock Auth**. When you click "Login" in development mode (with `REPL_ID=local-development`), it will automatically log you in as a mock user.
