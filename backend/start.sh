#!/usr/bin/env bash
cd "$(dirname "$0")"
source venv/Scripts/activate
# When started together with the database via `npm run dev`, Postgres needs a
# few seconds to become ready to accept connections - without this wait, the
# first requests fail with a 500 because the DB connection isn't up yet.
node.exe "$(wslpath -m ../node_modules/wait-on/bin/wait-on)" --timeout 60000 tcp:5432 || {
  echo "Database never became reachable on port 5432 after 60s - is Docker Desktop actually running (not just installed)?"
  exit 1
}
venv/Scripts/python.exe -m uvicorn main:app --reload --port 8000