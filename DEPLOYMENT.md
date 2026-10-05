# Deployment

ClipMind uses three services:

- `frontend/` deploys to Vercel as a Vite application.
- `backend/` deploys to Render from `backend/Dockerfile`.
- Supabase provides the PostgreSQL database.

## 1. Supabase

Create a Supabase project and copy its PostgreSQL connection string. Configure it as `DATABASE_URL` on Render. The backend preserves the existing SQLAlchemy models and creates missing tables on startup.

## 2. Render backend

Create a Render Web Service from the repository with `backend` as the root directory and Docker as the runtime. The Docker image installs Python 3.11, FFmpeg, and the backend dependencies. Render supplies `PORT`; the container listens on `0.0.0.0`.

Set these Render environment variables:

```text
DATABASE_URL=<supabase-postgresql-connection-string>
JWT_SECRET_KEY=<long-random-secret>
GROQ_API_KEY=<groq-api-key>
FRONTEND_URL=https://<your-vercel-app>.vercel.app
CORS_ORIGINS=https://<your-vercel-app>.vercel.app
UPLOAD_DIR=/app/uploads
WHISPER_MODEL=tiny
```

Do not commit `.env` or copy real secrets into `.env.example`.

## 3. Vercel frontend

Create a Vercel project with `frontend` as the root directory. Set this environment variable for Production and Preview as needed:

```text
VITE_API_URL=https://<your-render-service>.onrender.com
```

The frontend uses this value for every API request. Local development uses the same variable with `http://localhost:8000`.

## 4. Local development

Backend:

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
Copy-Item .env.example .env
python -m uvicorn main:app --host 127.0.0.1 --port 8000
```

Set local `DATABASE_URL` and `JWT_SECRET_KEY` in `backend/.env`.

Frontend:

```powershell
cd frontend
npm install
Copy-Item .env.example .env
npm run dev
```

## 5. Verification

Check the deployed backend at:

```text
https://<your-render-service>.onrender.com/health
```

Register or log in through the Vercel app, upload a small MP4, confirm transcription and topic analysis complete, then verify the video appears in the library and can be played back.

## Known limitations

Uploaded videos and generated WAV files use the Render container filesystem, which is ephemeral. Files can disappear after a restart or redeploy. Object storage or a persistent disk should be added before relying on long-term video playback.

Whisper, Sentence Transformers, and the summarization model are resource-intensive and download/load during backend startup. Use a Render plan with sufficient memory and allow a longer initial startup. Video processing is synchronous, so very large uploads may exceed service request timeouts; background workers are a future optimization.
