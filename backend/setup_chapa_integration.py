#!/usr/bin/env python
"""
Chapa Integration Setup Script
This script helps you configure real Chapa payment integration
"""

def setup_chapa_integration():
    print("🚀 CHAPA PAYMENT INTEGRATION SETUP")
    print("=" * 50)
    
    print("\n📋 STEP 1: GET YOUR CHAPA CREDENTIALS")
    print("1. Login to your Chapa dashboard: https://dashboard.chapa.co/")
    print("2. Go to 'Settings' → 'API Keys'")
    print("3. Copy your Test/Live API keys")
    
    print("\n🔧 STEP 2: UPDATE ENVIRONMENT VARIABLES")
    print("Edit your .env file and update these values:")
    print()
    print("# For Testing (Sandbox)")
    print("CHAPA_SECRET_KEY=CHASECK_TEST-your-test-secret-key-here")
    print("CHAPA_PUBLIC_KEY=CHAPUBK_TEST-your-test-public-key-here")
    print("CHAPA_DEMO_MODE=False")
    print()
    print("# For Production (Live)")
    print("CHAPA_SECRET_KEY=CHASECK-your-live-secret-key-here")
    print("CHAPA_PUBLIC_KEY=CHAPUBK-your-live-public-key-here")
    print("CHAPA_DEMO_MODE=False")
    
    print("\n🌐 STEP 3: CONFIGURE URLS")
    print("Add these to your .env file:")
    print("CHAPA_CALLBACK_URL=http://your-domain.com/api/payments/webhook/")
    print("CHAPA_RETURN_URL=http://localhost:5173/payment/success")
    print("FRONTEND_URL=http://localhost:5173")
    
    print("\n⚙️ STEP 4: WEBHOOK SETUP")
    print("In your Chapa dashboard:")
    print("1. Go to 'Settings' → 'Webhooks'")
    print("2. Add webhook URL: http://your-domain.com/api/payments/webhook/")
    print("3. Select events: payment.success, payment.failed")
    
    print("\n🧪 STEP 5: TESTING")
    print("Test with Chapa test cards:")
    print("• Success: 4000000000000002")
    print("• Decline: 4000000000000069")
    print("• Insufficient Funds: 4000000000000119")
    
    print("\n🔄 STEP 6: RESTART SERVERS")
    print("After updating .env file:")
    print("1. Restart Django backend")
    print("2. Test payment flow")
    
    print("\n✅ CURRENT CONFIGURATION:")
    
    # Try to load current settings
    try:
        import os
        import django
        os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
        django.setup()
        
        from django.conf import settings
        
        secret_key = getattr(settings, 'CHAPA_SECRET_KEY', 'Not set')
        public_key = getattr(settings, 'CHAPA_PUBLIC_KEY', 'Not set')
        demo_mode = getattr(settings, 'CHAPA_DEMO_MODE', True)
        
        print(f"Secret Key: {secret_key[:20]}..." if len(secret_key) > 20 else f"Secret Key: {secret_key}")
        print(f"Public Key: {public_key[:20]}..." if len(public_key) > 20 else f"Public Key: {public_key}")
        print(f"Demo Mode: {demo_mode}")
        
        if secret_key.startswith('CHASECK'):
            print("✅ Real Chapa keys detected!")
        else:
            print("⚠️  Using demo/placeholder keys")
            
    except Exception as e:
        print(f"Could not load current settings: {e}")
    
    print("\n🎯 NEXT STEPS:")
    print("1. Update your .env file with real Chapa credentials")
    print("2. Set CHAPA_DEMO_MODE=False to enable real payments")
    print("3. Restart the backend server")
    print("4. Test payment flow")
    
    return True

if __name__ == '__main__':
    setup_chapa_integration()