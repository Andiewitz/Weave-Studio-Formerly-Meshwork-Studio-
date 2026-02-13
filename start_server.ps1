$env:NODE_ENV="development"
$env:DATABASE_URL=""
$env:REPL_ID="local-development"
$env:SESSION_SECRET="dev_secret"
npx tsx server/index.ts
