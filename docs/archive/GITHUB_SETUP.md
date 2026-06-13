# 🚀 GitHub Setup Guide

## Your Project Structure

Your project is already in the `mental-health-app` folder with:
- `backend/` - Django REST API
- `frontend/` - React + TypeScript frontend
- `.gitignore` - Configured to exclude unnecessary files

## Quick Setup (3 Steps)

### 1. Initialize Git Repository

```bash
cd mental-health-app
git init
git add .
git commit -m "Initial commit: Mental Health App with Django + React"
```

### 2. Create GitHub Repository

1. Go to https://github.com/new
2. Repository name: `mental-health-app` (or your preferred name)
3. Description: "Mental health therapy platform with video chat, appointments, and AI assessment"
4. Choose Public or Private
5. **DO NOT** initialize with README (we already have one)
6. Click "Create repository"

### 3. Push to GitHub

```bash
git remote add origin https://github.com/YOUR_USERNAME/mental-health-app.git
git branch -M main
git push -u origin main
```

Replace `YOUR_USERNAME` with your GitHub username.

---

## What Gets Pushed

### ✅ Included:
- All source code (`backend/` and `frontend/`)
- Main documentation (`README.md`, `PROJECT_SUMMARY.md`)
- Configuration files
- Requirements files
- Database models and migrations

### ❌ Excluded (via .gitignore):
- Virtual environments (`.venv/`, `venv/`)
- Node modules (`node_modules/`)
- Database file (`db.sqlite3`)
- Environment variables (`.env`)
- Test/debug scripts
- Temporary documentation files
- Build outputs

---

## Important: Before Pushing

### 1. Check for Sensitive Data

Make sure your `.env` file is NOT being tracked:
```bash
git status
```

If you see `.env` in the list, remove it:
```bash
git rm --cached backend/.env
git commit -m "Remove .env from tracking"
```

### 2. Update README

Edit `README.md` to include:
- Project description
- Setup instructions
- Features list
- Screenshots (optional)

### 3. Create .env.example

```bash
cd backend
cp .env .env.example
```

Then edit `.env.example` and replace real values with placeholders:
```
SECRET_KEY=your-secret-key-here
DEBUG=True
DATABASE_URL=sqlite:///db.sqlite3
```

---

## Useful Git Commands

```bash
# Check status
git status

# Add specific files
git add backend/users/models.py

# Commit changes
git commit -m "Add user authentication"

# Push changes
git push

# Pull latest changes
git pull

# Create new branch
git checkout -b feature-name

# View commit history
git log --oneline
```

---

## Repository Structure on GitHub

```
mental-health-app/
├── backend/
│   ├── appointments/
│   ├── chat/
│   ├── notifications/
│   ├── payments/
│   ├── users/
│   ├── video/
│   ├── manage.py
│   └── requirements.txt
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── vite.config.ts
├── .gitignore
├── README.md
└── PROJECT_SUMMARY.md
```

---

## Next Steps After Pushing

1. **Add Topics** on GitHub (Settings → Topics):
   - `django`
   - `react`
   - `typescript`
   - `mental-health`
   - `video-chat`
   - `healthcare`

2. **Add Description** on GitHub

3. **Enable Issues** for bug tracking

4. **Add License** (MIT, Apache, etc.)

5. **Create Releases** for versions

---

## Collaboration

To allow others to contribute:

1. **Add Collaborators**: Settings → Collaborators
2. **Create Issues**: For bugs and features
3. **Use Pull Requests**: For code reviews
4. **Add Branch Protection**: Require reviews before merging

---

## Deployment

After pushing to GitHub, you can deploy to:
- **Frontend**: Vercel, Netlify, GitHub Pages
- **Backend**: Heroku, Railway, DigitalOcean, AWS

See `PRODUCTION_DEPLOYMENT_GUIDE.md` for details.

---

## Done!

Your code is now safely backed up on GitHub and ready to share! 🎉
