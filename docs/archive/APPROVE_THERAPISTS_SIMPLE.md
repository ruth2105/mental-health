# ⚡ Approve Therapists - Super Simple Guide

## The Easiest Way (Double-Click)

1. Go to `mental-health-app` folder
2. Double-click `approve_therapists.bat`
3. Type `YES` when asked
4. Done! ✅

---

## Or Use Command Line

Open terminal in `mental-health-app` folder:

```bash
# Check who's waiting
.\..\.venv\Scripts\python.exe backend\check_pending_therapists.py

# Approve everyone
.\..\.venv\Scripts\python.exe backend\approve_all_pending.py
```

---

## Or Use Admin Dashboard (Best for Production)

1. Login as admin
2. Go to: `http://localhost:5173/admin/therapists/approvals`
3. Click "Approve" button
4. Done! ✅

---

## That's It!

**Next time a therapist registers:**
- Just double-click `approve_therapists.bat`
- Or use the admin dashboard

**Questions?** See `HOW_TO_APPROVE_THERAPISTS.md` for detailed guide.
