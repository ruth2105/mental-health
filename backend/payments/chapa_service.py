"""
Clean Chapa Payment Service
A robust, well-structured Chapa integration for Ethiopian payments
"""
import requests
import uuid
import logging
from decimal import Decimal
from typing import Dict, Any, Optional
from django.conf import settings

logger = logging.getLogger(__name__)

class ChapaPaymentService:
    """
    Professional Chapa Payment Service
    Handles all Chapa API interactions with proper error handling
    """
    
    def __init__(self):
        self.secret_key = getattr(settings, 'CHAPA_SECRET_KEY', '')
        self.public_key = getattr(settings, 'CHAPA_PUBLIC_KEY', '')
        self.base_url = "https://api.chapa.co/v1"
        
        # Validate configuration
        if not self.secret_key or 'your-test-secret-key-here' in self.secret_key:
            logger.warning("Chapa secret key not properly configured")
        
        self.headers = {
            'Authorization': f'Bearer {self.secret_key}',
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }
    
    def generate_transaction_reference(self) -> str:
        """Generate unique transaction reference"""
        return f"MH-{uuid.uuid4().hex[:12].upper()}"
    
    def initialize_payment(
        self,
        amount: Decimal,
        email: str,
        first_name: str,
        last_name: str,
        phone: Optional[str] = None,
        description: str = "Mental Health Session Payment",
        return_url: Optional[str] = None,
        callback_url: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Initialize payment with Chapa
        
        Args:
            amount: Payment amount in ETB
            email: Customer email
            first_name: Customer first name
            last_name: Customer last name
            phone: Customer phone (optional)
            description: Payment description
            return_url: URL to redirect after payment
            callback_url: Webhook URL for notifications
            
        Returns:
            Dict containing success status and payment data
        """
        try:
            # Generate transaction reference
            tx_ref = self.generate_transaction_reference()
            
            # Default URLs
            if not return_url:
                return_url = getattr(settings, 'CHAPA_RETURN_URL', 
                                   'http://localhost:5173/payment/success')
            
            if not callback_url:
                callback_url = getattr(settings, 'CHAPA_CALLBACK_URL',
                                     'http://localhost:8000/api/payments/webhook/')
            
            # Prepare payload
            payload = {
                "amount": str(amount),
                "currency": "ETB",
                "email": email,
                "first_name": first_name,
                "last_name": last_name,
                "tx_ref": tx_ref,
                "callback_url": callback_url,
                "return_url": return_url,
                "customization": {
                    "title": "MH Payment",
                    "description": description
                }
            }
            
            # Add phone if provided
            if phone:
                payload["phone_number"] = phone
            
            logger.info(f"Initializing Chapa payment: {tx_ref} for {amount} ETB")
            
            # Make API request
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
                    'tx_ref': tx_ref,
                    'checkout_url': response_data['data']['checkout_url'],
                    'data': response_data['data']
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
    
    def verify_payment(self, tx_ref: str) -> Dict[str, Any]:
        """
        Verify payment status with Chapa
        
        Args:
            tx_ref: Transaction reference to verify
            
        Returns:
            Dict containing verification result
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
                    'data': payment_data
                }
            else:
                logger.error(f"Payment verification failed: {response_data}")
                return {
                    'success': False,
                    'error': response_data.get('message', 'Payment verification failed'),
                    'details': response_data
                }
                
        except Exception as e:
            logger.error(f"Error verifying payment: {str(e)}")
            return {
                'success': False,
                'error': 'Payment verification failed',
                'details': str(e)
            }
    
    def get_supported_banks(self) -> Dict[str, Any]:
        """Get list of supported banks for bank transfers"""
        try:
            response = requests.get(
                f"{self.base_url}/banks",
                headers=self.headers,
                timeout=30
            )
            
            if response.status_code == 200:
                return {
                    'success': True,
                    'banks': response.json().get('data', [])
                }
            else:
                return {
                    'success': False,
                    'error': 'Failed to fetch supported banks'
                }
                
        except Exception as e:
            logger.error(f"Error fetching banks: {str(e)}")
            return {
                'success': False,
                'error': 'Failed to fetch banks',
                'details': str(e)
            }

# Singleton instance
chapa_service = ChapaPaymentService()