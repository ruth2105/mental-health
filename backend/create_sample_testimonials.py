#!/usr/bin/env python3
"""
Create sample testimonials for testing
"""
import os
import sys
import django

# Add the project root to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.contrib.auth import get_user_model
from testimonials.models import Testimonial
from django.utils import timezone

User = get_user_model()

def create_sample_testimonials():
    """Create sample testimonials for testing"""
    
    # Sample testimonial data
    testimonials_data = [
        {
            'title': 'Life-changing therapy experience',
            'content': 'I was struggling with anxiety and depression for years. The therapists here helped me develop coping strategies that actually work. The online sessions were convenient and the chat assessment made it easy to get started. I feel like I have my life back.',
            'rating': 5,
            'display_name': 'Sarah M.',
            'location': 'Addis Ababa, Ethiopia',
            'status': 'approved',
            'is_featured': True
        },
        {
            'title': 'Professional and caring service',
            'content': 'The mental health support I received was exceptional. My therapist was understanding and provided practical tools to manage my stress. The video sessions worked perfectly and I felt comfortable sharing my thoughts.',
            'rating': 5,
            'display_name': 'Michael T.',
            'location': 'Bahir Dar, Ethiopia',
            'status': 'approved',
            'is_featured': True
        },
        {
            'title': 'Helped me through a difficult time',
            'content': 'Going through a divorce was the hardest thing I ever experienced. The counseling sessions helped me process my emotions and move forward. The AI chat assessment was surprisingly helpful in identifying my needs.',
            'rating': 4,
            'display_name': 'Almaz K.',
            'location': 'Dire Dawa, Ethiopia',
            'status': 'approved',
            'is_featured': False
        },
        {
            'title': 'Great support for anxiety management',
            'content': 'I was having panic attacks regularly and couldn\'t function normally. The therapy sessions taught me breathing techniques and mindfulness practices that really help. The booking system is easy to use.',
            'rating': 5,
            'display_name': 'David L.',
            'location': 'Mekelle, Ethiopia',
            'status': 'approved',
            'is_featured': False
        },
        {
            'title': 'Convenient and effective online therapy',
            'content': 'As someone living in a remote area, online therapy was a game-changer. The quality of care was excellent and I could access help from the comfort of my home. Highly recommend this service.',
            'rating': 4,
            'display_name': 'Hanan A.',
            'location': 'Jimma, Ethiopia',
            'status': 'approved',
            'is_featured': False
        },
        {
            'title': 'Supportive therapist and great platform',
            'content': 'The platform is user-friendly and my therapist was very professional. I appreciated the flexibility in scheduling and the secure video calls. Made a real difference in my mental health journey.',
            'rating': 4,
            'display_name': 'John S.',
            'location': 'Hawassa, Ethiopia',
            'status': 'approved',
            'is_featured': False
        },
        {
            'title': 'Excellent service for depression treatment',
            'content': 'I was in a very dark place when I started therapy here. The combination of professional counseling and the supportive environment helped me recover. The payment system is also very convenient.',
            'rating': 5,
            'display_name': 'Meron B.',
            'location': 'Gondar, Ethiopia',
            'status': 'approved',
            'is_featured': True
        },
        {
            'title': 'Good experience overall',
            'content': 'The therapy sessions were helpful and my therapist was knowledgeable. The only issue was occasional technical problems with video calls, but the support team was quick to help.',
            'rating': 4,
            'display_name': 'Ahmed R.',
            'location': 'Dessie, Ethiopia',
            'status': 'approved',
            'is_featured': False
        },
        {
            'title': 'Needs improvement in some areas',
            'content': 'The therapy was okay but I felt like the sessions could have been more structured. The therapist was nice but I didn\'t feel like we made much progress. The platform itself works well though.',
            'rating': 3,
            'display_name': 'Anonymous',
            'location': '',
            'status': 'pending',
            'is_featured': False
        },
        {
            'title': 'Amazing support during crisis',
            'content': 'When I was going through a mental health crisis, this service was a lifeline. The immediate access to professional help and the caring approach of the staff made all the difference. Forever grateful.',
            'rating': 5,
            'display_name': 'Tigist W.',
            'location': 'Adama, Ethiopia',
            'status': 'approved',
            'is_featured': True
        }
    ]
    
    # Get or create test users
    users = []
    for i in range(len(testimonials_data)):
        email = f'patient{i+1}@test.com'
        user, created = User.objects.get_or_create(
            email=email,
            defaults={
                'full_name': f'Test Patient {i+1}',
                'role': 'patient',
                'is_active': True
            }
        )
        users.append(user)
        if created:
            print(f"Created test user: {email}")
    
    # Create testimonials
    created_count = 0
    for i, testimonial_data in enumerate(testimonials_data):
        user = users[i]
        
        # Check if testimonial already exists for this user
        if not Testimonial.objects.filter(user=user).exists():
            testimonial = Testimonial.objects.create(
                user=user,
                **testimonial_data
            )
            created_count += 1
            print(f"Created testimonial: {testimonial.title} by {testimonial.display_name}")
    
    print(f"\n✅ Created {created_count} sample testimonials")
    
    # Print statistics
    total = Testimonial.objects.count()
    approved = Testimonial.objects.filter(status='approved').count()
    pending = Testimonial.objects.filter(status='pending').count()
    featured = Testimonial.objects.filter(is_featured=True).count()
    
    print(f"\n📊 Testimonial Statistics:")
    print(f"   Total: {total}")
    print(f"   Approved: {approved}")
    print(f"   Pending: {pending}")
    print(f"   Featured: {featured}")
    
    # Calculate average rating
    from django.db.models import Avg
    avg_rating = Testimonial.objects.filter(status='approved').aggregate(
        avg=Avg('rating')
    )['avg']
    
    if avg_rating:
        print(f"   Average Rating: {avg_rating:.1f}/5")

if __name__ == '__main__':
    print("🚀 Creating sample testimonials...")
    create_sample_testimonials()
    print("✨ Done!")