# Copilot / AI assistant instructions — mental-health-app

Short, actionable guidance for code-writing assistants working in this repository.

1) Big picture (what to change and where)
- Backend: Django REST API in `backend/`. Core settings in `backend/backend/settings.py`. Apps live at top-level folders under `backend/` (e.g. `users`, `mental_health_app`, `appointments`, `payments`). API root paths are mounted under `/api/` in `backend/backend/urls.py`.
- Frontend: Vite + React (TypeScript) in `frontend/`. Entry: `frontend/src/main.tsx`. Vite config is `frontend/vite.config.ts` and defines server port `8080` by default.

2) Authentication & API shape
- Uses Django REST Framework + (optional) Simple JWT (`djangorestframework-simplejwt`). Token endpoints are added in `backend/backend/urls.py` only if the package imports successfully; otherwise the token routes redirect to `/api/users/login/`.
- API endpoints follow the pattern `/api/<app>/` (e.g. `/api/mental_health/`, `/api/appointments/`). See `backend/backend/urls.py` for the canonical list.

3) AI / ML integration
- The mental health model loader lives at `backend/mental_health_app/ai.py`. It looks for `mental_model.joblib` in `ai_models/` and a few candidate locations. If `MODEL` is `None`, prediction functions return `{'error': ...}`; handle this in code that calls `predict_disorder`.
- Call examples: `from mental_health_app.ai import predict_disorder; predict_disorder(symptoms_list)` where `symptoms_list` is a list-like vector expected by the model.

4) Developer workflows (how to run things locally)
- Backend (Python):
  - Install: `pip install -r backend/requirements.txt` (project uses `python-decouple` and `.env` file for secrets).
  - Migrate & run: from `backend/` run `python manage.py migrate` then `python manage.py runserver` (defaults to 127.0.0.1:8000).
  - Note: settings expect an optional `.env` at project base; `SECRET_KEY` and `DEBUG` are loaded via `python-decouple`.
- Frontend (Node):
  - From `frontend/` run `npm install`.
  - Dev server: `npm run dev` (Vite). `vite.config.ts` sets port `8080` and an alias `@ -> ./src`.
  - Build: `npm run build`; Preview production build: `npm run preview`.

5) Project-specific conventions & patterns
- Custom user model: `AUTH_USER_MODEL = 'users.User'` in `backend/backend/settings.py`. Use `get_user_model()` when referring to the user model in serializers and views.
- Serializers commonly include small nested serializers for user info (example: `appointments/serializers.py` defines `UserInfoSerializer` and uses `read_only=True` for user-related fields).
- JWT endpoints: code defensively—URLs may redirect to login if `rest_framework_simplejwt` isn't installed. Prefer to check for import availability rather than assuming tokens exist.

6) Important files to inspect when changing behavior
- `backend/backend/settings.py` — DB, INSTALLED_APPS, CORS, REST framework config.
- `backend/backend/urls.py` — API route wiring and token endpoint behavior.
- `backend/mental_health_app/ai.py` — model loading & predict helpers.
- `backend/manage.py` — Django entrypoint for migrations/commands.
- `frontend/vite.config.ts`, `frontend/package.json` — frontend dev/build commands and aliases.
- `backend/appointments/serializers.py` — example of serializer patterns (nested readonly user info, `read_only_fields`).

7) Integration & dependency notes
- The repo uses SQLite by default (`db.sqlite3`) for development. Be cautious when changing models — migrations are present per-app.
- ML deps: `joblib`, `pandas`, `catboost` appear in `backend/requirements.txt`; model artifacts are expected in `backend/ai_models/` or `backend/models/`.
- CORS: `CORS_ALLOW_ALL_ORIGINS = True` in settings for local dev. Vite dev server runs on port `8080`; if you run the frontend on a different port, add it to `CORS_ALLOWED_ORIGINS`.

8) Small heuristics for PRs and edits
- When adding endpoints, update `backend/backend/urls.py` and add tests under the related app's `tests.py` file.
- Prefer `get_user_model()` over direct `users.User` imports except in migrations.
- When touching ML code, do not assume `MODEL` is loaded; add graceful fallbacks and logging consistent with `mental_health_app/ai.py`.

If anything above is unclear or you want more examples (e.g., common request/response shapes for `/api/mental_health/` or a sample test), tell me which area to expand. I'll iterate.
