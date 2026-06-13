#!/usr/bin/env python3
"""
Quick Deploy Script for Mental Health App
Fast setup for mobile testing
"""

import os
import subprocess
import socket
from pathlib import Path

def get_local_ip():
    """Get local IP address"""
    try:
        # Connect to a remote address to determine local IP
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except:
        return "127.0.0.1"

def run_cmd(cmd, cwd=None):
    """Run command and return success status"""
    try:
        result = subprocess.run(cmd, shell=True, cwd=cwd, check=True, capture_output=True, text=True)
        return True, result.stdout
    except subprocess.CalledProcessError as e:
        return False, e.stderr

def main():
    project_root = Path(__file__).parent
    backend_dir = project_root / "backend"
    frontend_dir = project_root / "frontend"
    
    print("🏥 Mental Health App - Quick Deploy")
    print("=" * 50)
    
    # Get local IP
    local_ip = get_local_ip()
    print(f"🌐 Local IP: {local_ip}")
    
    # Update backend .env
    backend_env = backend_dir / ".env"
    if backend_env.exists():
        with open(backend_env, 'r') as f:
            content = f.read()
        
        # Update ALLOWED_HOSTS
        if "ALLOWED_HOSTS=" in content:
            lines = content.split('\n')
            for i, line in enumerate(lines):
                if line.startswith("ALLOWED_HOSTS="):
                    lines[i] = f"ALLOWED_HOSTS=localhost,127.0.0.1,{local_ip},0.0.0.0"
                elif line.startswith("CORS_ALLOWED_ORIGINS="):
                    lines[i] = f"CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000,http://{local_ip}:5173"
            content = '\n'.join(lines)
        else:
            content += f"\nALLOWED_HOSTS=localhost,127.0.0.1,{local_ip},0.0.0.0\n"
            content += f"CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000,http://{local_ip}:5173\n"
        
        with open(backend_env, 'w') as f:
            f.write(content)
        print("✅ Updated backend configuration")
    
    # Update frontend .env
    frontend_env = frontend_dir / ".env"
    if frontend_env.exists():
        with open(frontend_env, 'r') as f:
            content = f.read()
        
        content = content.replace("http://127.0.0.1:8000", f"http://{local_ip}:8000")
        content = content.replace("ws://127.0.0.1:8000", f"ws://{local_ip}:8000")
        
        with open(frontend_env, 'w') as f:
            f.write(content)
        print("✅ Updated frontend configuration")
    
    # Install backend dependencies
    print("📦 Installing backend dependencies...")
    if os.name == 'nt':
        success, _ = run_cmd(".venv\\Scripts\\pip install -r requirements.txt", cwd=backend_dir)
    else:
        success, _ = run_cmd(".venv/bin/pip install -r requirements.txt", cwd=backend_dir)
    
    if success:
        print("✅ Backend dependencies installed")
    else:
        print("⚠️ Backend dependencies may need manual installation")
    
    # Run migrations
    print("🗄️ Running migrations...")
    if os.name == 'nt':
        run_cmd(".venv\\Scripts\\python manage.py migrate", cwd=backend_dir)
    else:
        run_cmd(".venv/bin/python manage.py migrate", cwd=backend_dir)
    
    # Install frontend dependencies
    print("📦 Installing frontend dependencies...")
    success, _ = run_cmd("npm install", cwd=frontend_dir)
    if success:
        print("✅ Frontend dependencies installed")
    
    print(f"""
🎉 QUICK DEPLOY COMPLETE!

📱 Mobile Access:
   App URL: http://{local_ip}:5173
   API URL: http://{local_ip}:8000/api

🚀 To start the servers:

Terminal 1 (Backend):
cd backend
.venv\\Scripts\\python manage.py runserver 0.0.0.0:8000

Terminal 2 (Frontend):
cd frontend
npm run dev -- --host 0.0.0.0

📱 Then open http://{local_ip}:5173 on your phone!

🔑 Test Credentials:
- Create account or use admin@mindcare.com / admin123
    """)

if __name__ == "__main__":
    main()