#!/usr/bin/env python3
"""
Mobile Access Troubleshooting Script
Diagnose and fix mobile connectivity issues
"""

import os
import socket
import subprocess
import requests
import time
from pathlib import Path

def get_network_info():
    """Get detailed network information"""
    print("🌐 Network Information")
    print("=" * 50)
    
    # Get all IP addresses
    hostname = socket.gethostname()
    print(f"Hostname: {hostname}")
    
    # Get local IP
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        local_ip = s.getsockname()[0]
        s.close()
        print(f"Primary IP: {local_ip}")
    except:
        local_ip = "127.0.0.1"
        print(f"Primary IP: {local_ip} (fallback)")
    
    # Get all network interfaces
    try:
        result = subprocess.run(['ipconfig'], capture_output=True, text=True, shell=True)
        lines = result.stdout.split('\n')
        
        current_adapter = ""
        for line in lines:
            line = line.strip()
            if "adapter" in line.lower():
                current_adapter = line
                print(f"\n📡 {current_adapter}")
            elif "IPv4 Address" in line:
                ip = line.split(":")[-1].strip()
                print(f"   IP: {ip}")
            elif "Media State" in line and "disconnected" in line.lower():
                print(f"   Status: Disconnected")
    except:
        print("Could not get detailed network info")
    
    return local_ip

def test_server_connectivity(ip, port):
    """Test if server is accessible"""
    print(f"\n🔍 Testing Server Connectivity")
    print("=" * 50)
    
    # Test local access
    try:
        response = requests.get(f"http://localhost:{port}", timeout=5)
        print(f"✅ Local access (localhost:{port}): OK")
    except:
        print(f"❌ Local access (localhost:{port}): FAILED")
    
    # Test IP access
    try:
        response = requests.get(f"http://{ip}:{port}", timeout=5)
        print(f"✅ IP access ({ip}:{port}): OK")
    except Exception as e:
        print(f"❌ IP access ({ip}:{port}): FAILED - {e}")
    
    # Test port binding
    try:
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        result = sock.connect_ex((ip, port))
        sock.close()
        if result == 0:
            print(f"✅ Port {port} is open on {ip}")
        else:
            print(f"❌ Port {port} is closed on {ip}")
    except Exception as e:
        print(f"❌ Port test failed: {e}")

def check_firewall():
    """Check Windows Firewall status"""
    print(f"\n🔥 Firewall Check")
    print("=" * 50)
    
    try:
        # Check firewall status
        result = subprocess.run(['netsh', 'advfirewall', 'show', 'allprofiles', 'state'], 
                              capture_output=True, text=True, shell=True)
        if "ON" in result.stdout:
            print("⚠️ Windows Firewall is ON - this might block mobile access")
            print("\n💡 To allow access, you can:")
            print("1. Temporarily disable firewall for testing")
            print("2. Add firewall rules for ports 5173 and 8000")
            print("3. Use Windows Defender Firewall settings")
        else:
            print("✅ Windows Firewall appears to be OFF")
    except:
        print("❓ Could not check firewall status")

def create_firewall_rules():
    """Create firewall rules for the app"""
    print(f"\n🛡️ Creating Firewall Rules")
    print("=" * 50)
    
    commands = [
        ['netsh', 'advfirewall', 'firewall', 'add', 'rule', 'name=Mental Health App Frontend', 'dir=in', 'action=allow', 'protocol=TCP', 'localport=5173'],
        ['netsh', 'advfirewall', 'firewall', 'add', 'rule', 'name=Mental Health App Backend', 'dir=in', 'action=allow', 'protocol=TCP', 'localport=8000']
    ]
    
    for cmd in commands:
        try:
            result = subprocess.run(cmd, capture_output=True, text=True, shell=True)
            if result.returncode == 0:
                print(f"✅ Created rule: {cmd[-1]}")
            else:
                print(f"❌ Failed to create rule: {result.stderr}")
        except Exception as e:
            print(f"❌ Error creating firewall rule: {e}")

def start_servers(ip):
    """Start both servers with proper configuration"""
    print(f"\n🚀 Starting Servers")
    print("=" * 50)
    
    project_root = Path(__file__).parent
    backend_dir = project_root / "backend"
    frontend_dir = project_root / "frontend"
    
    print("Starting backend server...")
    print(f"Command: cd {backend_dir} && .venv\\Scripts\\python manage.py runserver 0.0.0.0:8000")
    
    print("Starting frontend server...")
    print(f"Command: cd {frontend_dir} && npm run dev -- --host 0.0.0.0 --port 5173")
    
    print(f"\n📱 Mobile URLs:")
    print(f"Frontend: http://{ip}:5173")
    print(f"Backend: http://{ip}:8000")

def mobile_qr_code(ip):
    """Generate QR code for mobile access"""
    print(f"\n📱 Mobile Access")
    print("=" * 50)
    
    url = f"http://{ip}:5173"
    print(f"Mobile URL: {url}")
    
    # Try to generate QR code
    try:
        import qrcode
        qr = qrcode.QRCode(version=1, box_size=10, border=5)
        qr.add_data(url)
        qr.make(fit=True)
        qr.print_ascii()
    except ImportError:
        print("📱 Scan this URL with your phone's camera or type it in browser:")
        print(f"   {url}")
        print("\n💡 To generate QR code, install: pip install qrcode[pil]")

def main():
    print("🏥 Mental Health App - Mobile Troubleshooting")
    print("=" * 60)
    
    # Get network info
    ip = get_network_info()
    
    # Test connectivity
    test_server_connectivity(ip, 5173)  # Frontend
    test_server_connectivity(ip, 8000)  # Backend
    
    # Check firewall
    check_firewall()
    
    # Ask user if they want to create firewall rules
    print(f"\n❓ Do you want to create firewall rules? (y/n): ", end="")
    try:
        choice = input().lower().strip()
        if choice == 'y':
            create_firewall_rules()
    except:
        pass
    
    # Show server start commands
    start_servers(ip)
    
    # Show mobile access info
    mobile_qr_code(ip)
    
    print(f"\n🔧 Troubleshooting Steps:")
    print("1. Ensure your phone and computer are on the same network")
    print("2. Check if Windows Firewall is blocking the ports")
    print("3. Try accessing the URL from your computer browser first")
    print("4. Make sure both servers are running")
    print("5. Check your phone's network settings")
    
    print(f"\n✅ If everything looks good, try: http://{ip}:5173 on your phone")

if __name__ == "__main__":
    main()