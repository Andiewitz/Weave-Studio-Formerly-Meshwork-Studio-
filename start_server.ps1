$env:NODE_ENV="development"
$env:DATABASE_URL=""
$env:CLIENT_ID="local-development"
$env:SESSION_SECRET="dev_secret"
$env:PORT="5000"

Write-Host "Starting server in local development mode (Mock Auth, Memory Storage)..."
npx tsx server/index.ts
