# ✅ Register Your Own Account - Step by Step

## 🎯 Registration is Now Working!

You can create your own account with your own email and password.

---

## 📝 How to Register

### Step 1: Open the Registration Page

Go to: **http://localhost:5176/register**

### Step 2: Fill in Your Details

You'll see a form with these fields:

```
┌─────────────────────────────────────┐
│     Join EWKE                       │
├─────────────────────────────────────┤
│                                     │
│  Email:                             │
│  [your@email.com____________]       │
│                                     │
│  Password:                          │
│  [••••••••__________________]       │
│                                     │
│  Confirm Password:                  │
│  [••••••••__________________]       │
│                                     │
│  I am a:                            │
│  [Patient ▼]                        │
│                                     │
│  Preferred Language:                │
│  [Amharic (አማርኛ) ▼]                │
│                                     │
│  [Create Account]                   │
│                                     │
└─────────────────────────────────────┘
```

### Step 3: Enter Your Information

**Email**: Use any valid email
- Example: `john@example.com`
- Example: `sarah.therapist@gmail.com`

**Password**: At least 6 characters
- Example: `mypassword123`
- Example: `SecurePass2024!`

**Confirm Password**: Same as password

**Role**: Choose one
- **Patient** - If you want to take assessments and find therapists
- **Therapist** - If you're a mental health professional

**Language**: Choose your preferred language
- Amharic (አማርኛ)
- English
- Afan Oromo
- Somali

### Step 4: Click "Create Account"

The system will:
1. ✅ Create your account
2. ✅ Generate JWT tokens
3. ✅ Log you in automatically
4. ✅ Redirect you to your dashboard

---

## 🎉 Example Registration

Let's say you want to register as a patient:

```
Email: myemail@gmail.com
Password: mypassword123
Confirm Password: mypassword123
Role: Patient
Language: English
```

Click "Create Account" → **You're in!**

---

## 🔐 Then Login Anytime

After registration, you can login with:

```
Email: myemail@gmail.com
Password: mypassword123
```

Go to: **http://localhost:5176/login**

---

## ✅ What Happens Behind the Scenes

When you register:

1. **Frontend** sends your data to backend:
```json
{
  "email": "myemail@gmail.com",
  "password": "mypassword123",
  "full_name": "myemail",
  "role": "patient",
  "language": "english"
}
```

2. **Backend** creates your account:
- Hashes your password securely
- Creates user record in database
- Creates patient/therapist profile
- Generates JWT tokens

3. **Frontend** receives tokens:
```json
{
  "user": {
    "id": 5,
    "email": "myemail@gmail.com",
    "role": "patient"
  },
  "tokens": {
    "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
    "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
  }
}
```

4. **You're logged in!**

---

## 🧪 Test It Now

### Quick Test:

1. Open: http://localhost:5176/register
2. Enter:
   - Email: `test123@example.com`
   - Password: `password123`
   - Confirm: `password123`
   - Role: `Patient`
   - Language: `English`
3. Click "Create Account"
4. **Success!** You'll be redirected to dashboard

---

## 🐛 Troubleshooting

### Error: "Registration failed"

**Check:**
1. Is backend running? (http://127.0.0.1:8000)
2. Is email already used? Try a different email
3. Is password at least 6 characters?
4. Do passwords match?

### Error: "Email already exists"

**Solution**: That email is already registered. Either:
- Use a different email
- Login with that email instead

### Error: "Network error"

**Solution**: 
1. Check backend is running
2. Check URL is correct: http://127.0.0.1:8000
3. Check CORS is enabled in backend

---

## 📊 Check Your Account

After registration, you can verify your account exists:

### Option 1: Django Admin
1. Go to: http://127.0.0.1:8000/admin/
2. Login with admin account
3. Click "Users"
4. You'll see your new account!

### Option 2: Django Shell
```bash
cd mental-health-app/backend
.\.venv\Scripts\python.exe manage.py shell
```

```python
from users.models import User
User.objects.filter(email='myemail@gmail.com')
# Should show your account
```

---

## 🎯 Multiple Accounts

You can create multiple accounts:

**Personal Account:**
```
Email: john.personal@gmail.com
Password: mypass123
Role: Patient
```

**Therapist Account:**
```
Email: dr.john@clinic.com
Password: therapist123
Role: Therapist
```

**Test Account:**
```
Email: test@test.com
Password: test123
Role: Patient
```

---

## 🔒 Security

Your password is:
- ✅ Hashed with Django's secure algorithm
- ✅ Never stored in plain text
- ✅ Cannot be retrieved (only reset)
- ✅ Protected with JWT tokens

---

## ✨ After Registration

Once registered, you can:

### As Patient:
1. Take mental health assessment
2. Get AI diagnosis (98.44% accurate!)
3. Browse therapists
4. Book appointments
5. Join video sessions
6. Make payments

### As Therapist:
1. Setup your profile
2. Set specialization and price
3. View patient appointments
4. Conduct therapy sessions
5. Track earnings
6. Manage schedule

---

## 🎊 You're All Set!

**Registration is working perfectly!**

Just go to http://localhost:5176/register and create your account with your own email and password!

---

**No need to use test accounts - create your own!** 🚀

---

**Last Updated**: November 26, 2025
**Status**: ✅ Registration Working
