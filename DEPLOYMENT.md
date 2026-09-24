# Deployment

ClipMind is deployed as two services:

- `frontend/` -> Vercel (Vite static build)
- `backend/` -> Railway (FastAPI service)
- Railway PostgreSQL -> backend `DATABASE_URL`

## Vercel

Create a Vercel project from this repository and set **Root Directory** to `frontend`.
Vercel will use the existing `frontend/vercel.json` and the `build` script in `package.json`.
Set this environment variable for Production (and Preview if needed):

```text
VITE_API_URL=https://<railway-service>.up.railway.app
```

## Railway

Create a Railway service from this repository and set its **Root Directory** to `backend`.
The existing `railway.toml` pins the service to Python 3.11, starts FastAPI on Railway's assigned `PORT`, and checks `/health`.
Attach a Railway PostgreSQL service and provide these variables:

```text
DATABASE_URL=${{Postgres.DATABASE_URL}}
JWT_SECRET_KEY=<long-random-secret>
GROQ_API_KEY=<groq-api-key>
CORS_ORIGINS=https://<vercel-project>.vercel.app
WHISPER_MODEL=tiny
```

Keep the local development origins in `CORS_ORIGINS` too if you use the same environment for local testing.

## Important production limitation

Uploaded videos and generated WAV files are written to `backend/uploads/` by default. Railway service disks are ephemeral, so files can disappear on redeploy or restart. For reliable production playback, move video storage to S3-compatible object storage, or attach a Railway persistent volume and set `UPLOAD_DIR=/data/uploads`, before treating the app as production-ready.

The Whisper and sentence-transformer models are loaded during backend startup. Allow a longer first deploy/startup and choose a Railway plan with enough memory for those models and video processing.

## Local checks

```powershell
cd frontend
npm install
npm run build

cd ..\backend
python -m uvicorn main:app --host 127.0.0.1 --port 8000
```

Then open `http://127.0.0.1:8000/health`.
