#!/usr/bin/env python
import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.test import Client
from users.models import User
from rest_framework_simplejwt.tokens import RefreshToken

def simple_payment_test():
    try:
        # Get test user (try Gmail first, fallback to test.com)
        try:
            user = User.objects.get(email='ruth@gmail.com')
        except User.DoesNotExist:
            user = User.objects.get(email='patient@test.com')
        print(f"✅ Found user: {user.email}")
        
        # Create Django test client
        client = Client()
        
        # Generate token
        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)
        
        # Test payment endpoint
        response = client.post('/api/payments/initiate/', 
            data={
                'amount': 1500,
                'currency': 'ETB'
            },
            content_type='application/json',
            HTTP_AUTHORIZATION=f'Bearer {access_token}'
        )
        
        print(f"📊 Status Code: {response.status_code}")
        print(f"📄 Response: {response.content.decode()}")
        
        if response.status_code == 201:
            print("✅ Payment API working correctly!")
            return True
        else:
            print("❌ Payment API failed")
            return False
            
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return False

if __name__ == '__main__':
    simple_payment_test()