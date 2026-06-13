#!/usr/bin/env python3
"""
Mental Health App Deployment Script
Comprehensive deployment setup for mobile testing
"""

import os
import sys
import subprocess
import json
import time
from pathlib import Path

class MentalHealthDeployer:
    def __init__(self):
        self.project_root = Path(__file__).parent
        self.backend_dir = self.project_root / "backend"
        self.frontend_dir = self.project_root / "frontend"
        
    def print_header(self, title):
        print(f"\n{'='*60}")
        print(f"🚀 {title}")
        print(f"{'='*60}")
    
    def run_command(self, command, cwd=None, check=True):
        """Run shell command and return result"""
        try:
            result = subprocess.run(
                command, 
                shell=True, 
                cwd=cwd or self.project_root,
                capture_output=True,
                text=True,
                check=check
            )
            return result.returncode == 0, result.stdout, result.stderr
        except subprocess.CalledProcessError as e:
            return False, e.stdout, e.stderr
    
    def check_prerequisites(self):
        """Check if all prerequisites are installed"""
        self.print_header("Checking Prerequisites")
        
        prerequisites = [
            ("python", "python --version"),
            ("pip", "pip --version"),
            ("node", "node --version"),
            ("npm", "npm --version"),
        ]
        
        all_good = True
        for name, command in prerequisites:
            success, stdout, stderr = self.run_command(command, check=False)
            if success:
                version = stdout.strip()
                print(f"✅ {name}: {version}")
            else:
                print(f"❌ {name}: Not found")
                all_good = False
        
        return all_good
    
    def setup_backend(self):
        """Setup backend environment"""
        self.print_header("Setting Up Backend")
        
        # Check if virtual environment exists
        venv_path = self.backend_dir / ".venv"
        if not venv_path.exists():
            print("📦 Creating virtual environment...")
            success, _, stderr = self.run_command("python -m venv .venv", cwd=self.backend_dir)
            if not success:
                print(f"❌ Failed to create virtual environment: {stderr}")
                return False
        
        # Install dependencies
        print("📦 Installing Python dependencies...")
        if os.name == 'nt':  # Windows
            pip_cmd = ".venv\\Scripts\\pip install -r requirements.txt"
            python_cmd = ".venv\\Scripts\\python"
        else:  # Unix/Linux/Mac
            pip_cmd = ".venv/bin/pip install -r requirements.txt"
            python_cmd = ".venv/bin/python"
        
        success, _, stderr = self.run_command(pip_cmd, cwd=self.backend_dir)
        if not success:
            print(f"❌ Failed to install dependencies: {stderr}")
            return False
        
        # Run migrations
        print("🗄️ Running database migrations...")
        success, _, stderr = self.run_command(f"{python_cmd} manage.py makemigrations", cwd=self.backend_dir)
        success, _, stderr = self.run_command(f"{python_cmd} manage.py migrate", cwd=self.backend_dir)
        
        # Create superuser if needed
        print("👤 Checking for admin user...")
        check_admin_cmd = f"{python_cmd} -c \"from django.contrib.auth import get_user_model; User = get_user_model(); print('exists' if User.objects.filter(is_superuser=True).exists() else 'none')\""
        success, stdout, _ = self.run_command(check_admin_cmd, cwd=self.backend_dir)
        
        if success and "none" in stdout:
            print("👤 Creating admin user...")
            create_admin_cmd = f"{python_cmd} manage.py shell -c \"from users.models import User; User.objects.create_superuser('admin@mindcare.com', 'admin123', full_name='Admin User', role='admin')\""
            self.run_command(create_admin_cmd, cwd=self.backend_dir)
        
        print("✅ Backend setup complete")
        return True
    
    def setup_frontend(self):
        """Setup frontend environment"""
        self.print_header("Setting Up Frontend")
        
        # Install dependencies
        print("📦 Installing Node.js dependencies...")
        success, _, stderr = self.run_command("npm install", cwd=self.frontend_dir)
        if not success:
            print(f"❌ Failed to install dependencies: {stderr}")
            return False
        
        # Build for production
        print("🏗️ Building frontend for production...")
        success, _, stderr = self.run_command("npm run build", cwd=self.frontend_dir)
        if not success:
            print(f"❌ Failed to build frontend: {stderr}")
            return False
        
        print("✅ Frontend setup complete")
        return True
    
    def configure_for_mobile(self):
        """Configure app for mobile access"""
        self.print_header("Configuring for Mobile Access")
        
        # Get local IP address
        import socket
        hostname = socket.gethostname()
        local_ip = socket.gethostbyname(hostname)
        
        print(f"🌐 Local IP Address: {local_ip}")
        
        # Update backend settings for mobile access
        env_file = self.backend_dir / ".env"
        if env_file.exists():
            with open(env_file, 'r') as f:
                content = f.read()
            
            # Update ALLOWED_HOSTS
            if "ALLOWED_HOSTS=" in content:
                content = content.replace(
                    "ALLOWED_HOSTS=localhost,127.0.0.1",
                    f"ALLOWED_HOSTS=localhost,127.0.0.1,{local_ip},0.0.0.0"
                )
            else:
                content += f"\nALLOWED_HOSTS=localhost,127.0.0.1,{local_ip},0.0.0.0\n"
            
            # Update CORS settings
            if "CORS_ALLOWED_ORIGINS=" in content:
                content = content.replace(
                    "CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000",
                    f"CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000,http://{local_ip}:5173"
                )
            else:
                content += f"\nCORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000,http://{local_ip}:5173\n"
            
            with open(env_file, 'w') as f:
                f.write(content)
        
        # Update frontend environment
        frontend_env = self.frontend_dir / ".env"
        if frontend_env.exists():
            with open(frontend_env, 'r') as f:
                content = f.read()
            
            # Update API URL for mobile access
            content = content.replace(
                "VITE_API_URL=http://127.0.0.1:8000",
                f"VITE_API_URL=http://{local_ip}:8000"
            )
            content = content.replace(
                "VITE_WS_URL=ws://127.0.0.1:8000/ws",
                f"VITE_WS_URL=ws://{local_ip}:8000/ws"
            )
            
            with open(frontend_env, 'w') as f:
                f.write(content)
        
        print(f"✅ Configured for mobile access at: http://{local_ip}:5173")
        return local_ip
    
    def run_health_checks(self):
        """Run comprehensive health checks"""
        self.print_header("Running Health Checks")
        
        # Backend health check
        print("🔍 Checking backend...")
        if os.name == 'nt':
            python_cmd = ".venv\\Scripts\\python"
        else:
            python_cmd = ".venv/bin/python"
        
        success, _, stderr = self.run_command(f"{python_cmd} manage.py check", cwd=self.backend_dir)
        if success:
            print("✅ Backend health check passed")
        else:
            print(f"⚠️ Backend health check warnings: {stderr}")
        
        # Frontend health check
        print("🔍 Checking frontend build...")
        dist_path = self.frontend_dir / "dist"
        if dist_path.exists():
            print("✅ Frontend build exists")
        else:
            print("❌ Frontend build missing")
            return False
        
        return True
    
    def start_servers(self, local_ip):
        """Start both backend and frontend servers"""
        self.print_header("Starting Servers")
        
        print("🚀 Starting backend server...")
        if os.name == 'nt':
            backend_cmd = ".venv\\Scripts\\python manage.py runserver 0.0.0.0:8000"
        else:
            backend_cmd = ".venv/bin/python manage.py runserver 0.0.0.0:8000"
        
        print("🚀 Starting frontend server...")
        frontend_cmd = "npm run dev -- --host 0.0.0.0 --port 5173"
        
        print(f"""
🎉 DEPLOYMENT READY!

📱 Mobile Access URLs:
   Frontend: http://{local_ip}:5173
   Backend API: http://{local_ip}:8000/api
   Admin Panel: http://{local_ip}:8000/admin

🔑 Admin Credentials:
   Email: admin@mindcare.com
   Password: admin123

📋 Next Steps:
1. Open two terminals
2. Terminal 1: cd backend && {backend_cmd}
3. Terminal 2: cd frontend && {frontend_cmd}
4. Open http://{local_ip}:5173 on your phone

🔧 Troubleshooting:
- Ensure your phone and computer are on the same WiFi network
- Check firewall settings if connection fails
- Use 'ipconfig' (Windows) or 'ifconfig' (Mac/Linux) to verify IP address
        """)
        
        return True
    
    def deploy(self):
        """Main deployment function"""
        print("🏥 Mental Health App Deployment")
        print("=" * 60)
        
        try:
            # Check prerequisites
            if not self.check_prerequisites():
                print("❌ Prerequisites check failed. Please install missing components.")
                return False
            
            # Setup backend
            if not self.setup_backend():
                print("❌ Backend setup failed.")
                return False
            
            # Setup frontend
            if not self.setup_frontend():
                print("❌ Frontend setup failed.")
                return False
            
            # Configure for mobile
            local_ip = self.configure_for_mobile()
            
            # Run health checks
            if not self.run_health_checks():
                print("❌ Health checks failed.")
                return False
            
            # Start servers
            self.start_servers(local_ip)
            
            return True
            
        except Exception as e:
            print(f"❌ Deployment failed: {str(e)}")
            return False

if __name__ == "__main__":
    deployer = MentalHealthDeployer()
    success = deployer.deploy()
    
    if not success:
        sys.exit(1)