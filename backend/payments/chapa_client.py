"""
Chapa Payment Gateway Integration for Ethiopia
Official Chapa API Documentation: https://developer.chapa.co/docs
"""
import requests
import json
import uuid
from decimal import Decimal
from django.conf import settings
import logging

logger = logging.getLogger(__name__)

class ChapaClient:
    """
    Chapa Payment Gateway Client
    Handles payment initialization, verification, and webhooks
    """
    
    def __init__(self):
        # Use test keys for development, live keys for production
        self.secret_key = getattr(settings, 'CHAPA_SECRET_KEY', 'CHASECK_TEST-your-test-key-here')
        self.public_key = getattr(settings, 'CHAPA_PUBLIC_KEY', 'CHAPUBK_TEST-your-public-key-here')
        
        # API URLs
        self.base_url = "https://api.chapa.co/v1"
        if 'TEST' in self.secret_key:
            self.base_url = "https://api.chapa.co/v1"  # Same URL for test and live
        
        self.headers = {
            'Authorization': f'Bearer {self.secret_key}',
            'Content-Type': 'application/json'
        }
    
    def generate_tx_ref(self):
        """Generate unique transaction reference"""
        return f"mh-{uuid.uuid4().hex[:12]}"
    
    def initialize_payment(self, amount, email, first_name, last_name, phone=None, 
                          callback_url=None, return_url=None, tx_ref=None, 
                          customization=None):
        """
        Initialize payment with Chapa
        
        Args:
            amount (Decimal): Payment amount in ETB
            email (str): Customer email
            first_name (str): Customer first name
            last_name (str): Customer last name
            phone (str, optional): Customer phone number
            callback_url (str, optional): Webhook URL for payment notifications
            return_url (str, optional): URL to redirect after payment
            tx_ref (str, optional): Transaction reference (auto-generated if not provided)
            customization (dict, optional): UI customization options
        
        Returns:
            dict: Payment initialization response
        """
        if not tx_ref:
            tx_ref = self.generate_tx_ref()
        
        # Default callback and return URLs
        if not callback_url:
            callback_url = getattr(settings, 'CHAPA_CALLBACK_URL', 
                                 'http://localhost:8000/api/payments/chapa/webhook/')
        
        if not return_url:
            return_url = getattr(settings, 'CHAPA_RETURN_URL', 
                               'http://localhost:3000/payment/success')
        
        # Default customization
        if not customization:
            customization = {
                "title": "MH Payment",  # Max 16 characters
                "description": "Payment for therapy session"
            }
        
        payload = {
            "amount": str(amount),
            "currency": "ETB",
            "email": email,
            "first_name": first_name,
            "last_name": last_name,
            "tx_ref": tx_ref,
            "callback_url": callback_url,
            "return_url": return_url,
            "customization": customization
        }
        
        # Add optional fields
        if phone:
            payload["phone_number"] = phone
        
        try:
            logger.info(f"Initializing Chapa payment: {tx_ref} for {amount} ETB")
            
            response = requests.post(
                f"{self.base_url}/transaction/initialize",
                headers=self.headers,
                json=payload,
                timeout=30
            )
            
            response_data = response.json()
            
            if response.status_code == 200 and response_data.get('status') == 'success':
                logger.info(f"Payment initialized successfully: {tx_ref}")
                return {
                    'success': True,
                    'data': response_data['data'],
                    'tx_ref': tx_ref,
                    'checkout_url': response_data['data']['checkout_url']
                }
            else:
                logger.error(f"Payment initialization failed: {response_data}")
                return {
                    'success': False,
                    'error': response_data.get('message', 'Payment initialization failed'),
                    'details': response_data
                }
                
        except requests.exceptions.RequestException as e:
            logger.error(f"Chapa API request failed: {str(e)}")
            return {
                'success': False,
                'error': 'Payment service temporarily unavailable',
                'details': str(e)
            }
        except Exception as e:
            logger.error(f"Unexpected error in payment initialization: {str(e)}")
            return {
                'success': False,
                'error': 'An unexpected error occurred',
                'details': str(e)
            }
    
    def verify_payment(self, tx_ref):
        """
        Verify payment status with Chapa
        
        Args:
            tx_ref (str): Transaction reference
        
        Returns:
            dict: Payment verification response
        """
        try:
            logger.info(f"Verifying payment: {tx_ref}")
            
            response = requests.get(
                f"{self.base_url}/transaction/verify/{tx_ref}",
                headers=self.headers,
                timeout=30
            )
            
            response_data = response.json()
            
            if response.status_code == 200 and response_data.get('status') == 'success':
                payment_data = response_data['data']
                
                return {
                    'success': True,
                    'status': payment_data.get('status'),
                    'amount': Decimal(payment_data.get('amount', '0')),
                    'currency': payment_data.get('currency'),
                    'tx_ref': payment_data.get('tx_ref'),
                    'reference': payment_data.get('reference'),
                    'created_at': payment_data.get('created_at'),
                    'updated_at': payment_data.get('updated_at'),
                    'data': payment_data
                }
            else:
                logger.error(f"Payment verification failed: {response_data}")
                return {
                    'success': False,
                    'error': response_data.get('message', 'Payment verification failed'),
                    'details': response_data
                }
                
        except requests.exceptions.RequestException as e:
            logger.error(f"Chapa verification request failed: {str(e)}")
            return {
                'success': False,
                'error': 'Payment verification service unavailable',
                'details': str(e)
            }
        except Exception as e:
            logger.error(f"Unexpected error in payment verification: {str(e)}")
            return {
                'success': False,
                'error': 'An unexpected error occurred',
                'details': str(e)
            }
    
    def get_banks(self):
        """
        Get list of supported banks for bank transfers
        
        Returns:
            dict: List of supported banks
        """
        try:
            response = requests.get(
                f"{self.base_url}/banks",
                headers=self.headers,
                timeout=30
            )
            
            response_data = response.json()
            
            if response.status_code == 200:
                return {
                    'success': True,
                    'banks': response_data.get('data', [])
                }
            else:
                return {
                    'success': False,
                    'error': 'Failed to fetch banks',
                    'details': response_data
                }
                
        except Exception as e:
            logger.error(f"Error fetching banks: {str(e)}")
            return {
                'success': False,
                'error': 'Failed to fetch banks',
                'details': str(e)
            }
    
    def create_subaccount(self, business_name, account_name, bank_code, account_number, split_value, split_type="percentage"):
        """
        Create subaccount for split payments (for therapist payouts)
        
        Args:
            business_name (str): Business name
            account_name (str): Account holder name
            bank_code (str): Bank code
            account_number (str): Account number
            split_value (float): Split percentage or flat amount
            split_type (str): "percentage" or "flat"
        
        Returns:
            dict: Subaccount creation response
        """
        payload = {
            "business_name": business_name,
            "account_name": account_name,
            "bank_code": bank_code,
            "account_number": account_number,
            "split_value": split_value,
            "split_type": split_type
        }
        
        try:
            response = requests.post(
                f"{self.base_url}/subaccount",
                headers=self.headers,
                json=payload,
                timeout=30
            )
            
            response_data = response.json()
            
            if response.status_code == 200 and response_data.get('status') == 'success':
                return {
                    'success': True,
                    'subaccount': response_data['data']
                }
            else:
                return {
                    'success': False,
                    'error': response_data.get('message', 'Subaccount creation failed'),
                    'details': response_data
                }
                
        except Exception as e:
            logger.error(f"Error creating subaccount: {str(e)}")
            return {
                'success': False,
                'error': 'Subaccount creation failed',
                'details': str(e)
            }

# Singleton instance
chapa_client = ChapaClient()