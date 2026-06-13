# 🔧 Troubleshooting Phone Access

## ❌ Problem: Phone Can't Connect

Let's fix this step by step!

---

## ✅ Step 1: Check WiFi

**Make sure:**
- Phone and computer are on the **SAME WiFi network**
- Not using mobile data on phone
- Not using VPN on either device

**How to check:**
- On phone: Settings → WiFi → Check network name
- On computer: WiFi icon → Check network name
- **They must match!**

---

## ✅ Step 2: Configure Firewall (MOST COMMON ISSUE)

**Option A: Use Batch File (Easiest)**

1. **Right-click** `fix_firewall.bat`
2. Select **"Run as administrator"**
3. Click "Yes" when prompted
4. Done!

**Option B: Manual PowerShell**

Open PowerShell as Administrator and run:

```powershell
New-NetFirewallRule -DisplayName "Vite Dev 5174" -Direction Inbound -LocalPort 5174 -Protocol TCP -Action Allow

New-NetFirewallRule -DisplayName "Django Dev 8000" -Direction Inbound -LocalPort 8000 -Protocol TCP -Action Allow
```

**Option C: Windows Firewall GUI**

1. Open "Windows Defender Firewall with Advanced Security"
2. Click "Inbound Rules"
3. Click "New Rule..."
4. Select "Port" → Next
5. Enter "5174" → Next
6. Allow the connection → Next
7. Apply to all → Next
8. Name: "Vite Dev Server" → Finish
9. Repeat for port 8000

---

## ✅ Step 3: Find Correct IP Address

Run this command in PowerShell:

```powershell
ipconfig | findstr "IPv4"
```

Look for the IP that starts with:
- `192.168.x.x` (most common)
- `10.x.x.x` (some networks)

**Write it down!**

---

## ✅ Step 4: Test from Computer First

On your computer, open browser and try:

```
http://localhost:5174
```

**If this doesn't work:**
- Servers aren't running
- Check the terminal windows
- Restart servers

---

## ✅ Step 5: Test from Phone

On your phone browser, try:

```
http://YOUR_IP:5174
```

Replace `YOUR_IP` with the IP from Step 3.

**Example:**
```
http://192.168.1.100:5174
```

---

## 🔍 Detailed Diagnostics

### Test 1: Can you ping your computer from phone?

**On phone:**
1. Install "Network Analyzer" or "Ping" app
2. Ping your computer's IP
3. Should get response

**If ping fails:**
- Firewall is blocking
- Wrong IP address
- Different WiFi networks

---

### Test 2: Check if servers are listening

**On computer, run:**

```powershell
netstat -an | findstr "5174"
netstat -an | findstr "8000"
```

**Should see:**
```
TCP    0.0.0.0:5174    LISTENING
TCP    0.0.0.0:8000    LISTENING
```

**If not showing:**
- Servers not running properly
- Restart servers

---

### Test 3: Check firewall rules

**On computer, run:**

```powershell
netsh advfirewall firewall show rule name=all | findstr "5174"
```

**Should see the rule.**

**If not:**
- Firewall rule not created
- Run fix_firewall.bat as admin

---

## 🚨 Common Issues & Solutions

### Issue 1: "This site can't be reached"

**Cause:** Firewall blocking

**Solution:**
1. Run `fix_firewall.bat` as administrator
2. Try again

---

### Issue 2: "Connection refused"

**Cause:** Servers not running

**Solution:**
1. Check if servers are running
2. Restart servers:
   ```
   cd mental-health-app\backend
   .\.venv\Scripts\python.exe manage.py runserver 0.0.0.0:8000
   ```
   ```
   cd mental-health-app\frontend
   npm run dev
   ```

---

### Issue 3: "Timeout"

**Cause:** Wrong IP or different WiFi

**Solution:**
1. Verify both on same WiFi
2. Get correct IP with `ipconfig`
3. Try all IPs shown

---

### Issue 4: Works on computer but not phone

**Cause:** Firewall

**Solution:**
1. Disable Windows Firewall temporarily (for testing)
2. If it works, firewall is the issue
3. Re-enable firewall
4. Add proper rules with `fix_firewall.bat`

---

## 🎯 Quick Fix Checklist

Try these in order:

- [ ] Both devices on same WiFi?
- [ ] Servers running? (check terminals)
- [ ] Run `fix_firewall.bat` as admin
- [ ] Get correct IP with `ipconfig`
- [ ] Try `http://YOUR_IP:5174` on phone
- [ ] Try different IPs if multiple shown
- [ ] Restart phone WiFi
- [ ] Restart computer WiFi
- [ ] Temporarily disable firewall (test only)

---

## 💡 Alternative: Use Computer Browser in Mobile Mode

If phone access still doesn't work, you can simulate mobile:

**On computer:**
1. Open Chrome
2. Press F12 (DevTools)
3. Press Ctrl+Shift+M (Device toolbar)
4. Select "iPhone" or "Android"
5. Open two windows:
   - Window 1: Patient (normal mode)
   - Window 2: Therapist (incognito mode)

---

## 🔥 Nuclear Option: Disable Firewall (Temporary)

**Only for testing!**

```powershell
# Disable (as admin)
netsh advfirewall set allprofiles state off

# Test phone access

# Re-enable (as admin)
netsh advfirewall set allprofiles state on
```

**If it works with firewall off:**
- Firewall is definitely the issue
- Add proper rules with `fix_firewall.bat`

---

## 📱 Test with Another Device

Try accessing from:
- Another phone
- Tablet
- Another computer on same WiFi

**If works on other devices:**
- Issue is with your phone
- Check phone firewall/VPN
- Try different browser on phone

---

## 🆘 Still Not Working?

### Last Resort Options:

**Option 1: Use ngrok (Tunnel)**

```bash
# Install ngrok
# Run: ngrok http 5174
# Use the ngrok URL on phone
```

**Option 2: Deploy to Cloud**

- Deploy to Vercel/Netlify (frontend)
- Deploy to Heroku/Railway (backend)
- Access from anywhere

**Option 3: Use USB Tethering**

- Connect phone to computer via USB
- Enable USB tethering
- Phone and computer now on same network

---

## ✅ Success Indicators

**You'll know it's working when:**

1. ✅ Phone browser shows loading spinner
2. ✅ Landing page appears
3. ✅ Can click buttons
4. ✅ Can login
5. ✅ Dashboard loads

---

## 📞 Quick Help

**Most likely issue:** Firewall

**Quick fix:**
1. Right-click `fix_firewall.bat`
2. Run as administrator
3. Try phone again

**Still stuck?**
- Check both on same WiFi
- Get correct IP with `ipconfig`
- Try `http://YOUR_IP:5174`

---

**Let's get this working! 🚀**
