from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from django.db.models import Avg, Count, Q
from django.utils import timezone
from django.conf import settings
from .models import Testimonial
from .serializers import (
    TestimonialSerializer, 
    TestimonialCreateSerializer,
    AdminTestimonialSerializer,
    TestimonialStatsSerializer
)

class TestimonialPagination(PageNumberPagination):
    page_size = 12
    page_size_query_param = 'page_size'
    max_page_size = 50

class PublicTestimonialListView(generics.ListAPIView):
    """Public view for approved testimonials"""
    serializer_class = TestimonialSerializer
    pagination_class = TestimonialPagination
    permission_classes = [permissions.AllowAny]
    
    def get_queryset(self):
        queryset = Testimonial.objects.filter(status='approved')
        
        # Filter by rating if specified
        rating = self.request.query_params.get('rating')
        if rating:
            queryset = queryset.filter(rating=rating)
        
        # Filter featured testimonials
        featured = self.request.query_params.get('featured')
        if featured == 'true':
            queryset = queryset.filter(is_featured=True)
        
        return queryset

class UserTestimonialListView(generics.ListAPIView):
    """User's own testimonials"""
    serializer_class = TestimonialSerializer
    pagination_class = TestimonialPagination
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Testimonial.objects.filter(user=self.request.user)

class TestimonialCreateView(generics.CreateAPIView):
    """Create a new testimonial"""
    serializer_class = TestimonialCreateSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def perform_create(self, serializer):
        # Check if user already has a pending or approved testimonial
        existing = Testimonial.objects.filter(
            user=self.request.user,
            status__in=['pending', 'approved']
        ).exists()
        
        if existing:
            return Response(
                {'error': 'You already have a testimonial. You can only submit one testimonial.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer.save(user=self.request.user)

class TestimonialUpdateView(generics.UpdateAPIView):
    """Update user's own testimonial (only if pending)"""
    serializer_class = TestimonialCreateSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Testimonial.objects.filter(
            user=self.request.user,
            status='pending'  # Only allow editing pending testimonials
        )

class TestimonialDeleteView(generics.DestroyAPIView):
    """Delete user's own testimonial"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Testimonial.objects.filter(user=self.request.user)

# Admin Views
class AdminTestimonialListView(generics.ListAPIView):
    """Admin view for all testimonials"""
    serializer_class = AdminTestimonialSerializer
    pagination_class = TestimonialPagination
    permission_classes = [permissions.IsAdminUser]
    
    def get_queryset(self):
        queryset = Testimonial.objects.all()
        
        # Filter by status
        status_filter = self.request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        # Filter by rating
        rating = self.request.query_params.get('rating')
        if rating:
            queryset = queryset.filter(rating=rating)
        
        # Search in title and content
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) | 
                Q(content__icontains=search) |
                Q(display_name__icontains=search)
            )
        
        return queryset

class AdminTestimonialDetailView(generics.RetrieveUpdateAPIView):
    """Admin view for testimonial details and updates"""
    serializer_class = AdminTestimonialSerializer
    permission_classes = [permissions.IsAdminUser]
    queryset = Testimonial.objects.all()
    
    def perform_update(self, serializer):
        # Track who reviewed and when
        if 'status' in serializer.validated_data:
            serializer.save(
                reviewed_by=self.request.user,
                reviewed_at=timezone.now()
            )
        else:
            serializer.save()

@api_view(['POST'])
@permission_classes([permissions.IsAdminUser])
def bulk_update_testimonials(request):
    """Bulk update testimonials status"""
    testimonial_ids = request.data.get('testimonial_ids', [])
    action = request.data.get('action')  # 'approve', 'reject', 'feature', 'unfeature'
    
    if not testimonial_ids or not action:
        return Response(
            {'error': 'testimonial_ids and action are required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    testimonials = Testimonial.objects.filter(id__in=testimonial_ids)
    
    if action == 'approve':
        testimonials.update(
            status='approved',
            reviewed_by=request.user,
            reviewed_at=timezone.now()
        )
    elif action == 'reject':
        testimonials.update(
            status='rejected',
            reviewed_by=request.user,
            reviewed_at=timezone.now()
        )
    elif action == 'feature':
        testimonials.update(is_featured=True)
    elif action == 'unfeature':
        testimonials.update(is_featured=False)
    else:
        return Response(
            {'error': 'Invalid action'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    return Response({'message': f'Updated {testimonials.count()} testimonials'})

@api_view(['DELETE'])
@permission_classes([permissions.IsAdminUser])
def bulk_delete_testimonials(request):
    """Bulk delete testimonials"""
    testimonial_ids = request.data.get('testimonial_ids', [])
    
    if not testimonial_ids:
        return Response(
            {'error': 'testimonial_ids are required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    deleted_count = Testimonial.objects.filter(id__in=testimonial_ids).delete()[0]
    
    return Response({'message': f'Deleted {deleted_count} testimonials'})

@api_view(['GET'])
@permission_classes([permissions.IsAdminUser])
def testimonial_stats(request):
    """Get testimonial statistics for admin dashboard"""
    total_testimonials = Testimonial.objects.count()
    pending_count = Testimonial.objects.filter(status='pending').count()
    approved_count = Testimonial.objects.filter(status='approved').count()
    rejected_count = Testimonial.objects.filter(status='rejected').count()
    featured_count = Testimonial.objects.filter(is_featured=True).count()
    
    # Average rating
    avg_rating = Testimonial.objects.filter(status='approved').aggregate(
        avg=Avg('rating')
    )['avg'] or 0
    
    # Rating breakdown
    rating_breakdown = {}
    for i in range(1, 6):
        rating_breakdown[str(i)] = Testimonial.objects.filter(
            status='approved', rating=i
        ).count()
    
    stats = {
        'total_testimonials': total_testimonials,
        'pending_count': pending_count,
        'approved_count': approved_count,
        'rejected_count': rejected_count,
        'average_rating': round(avg_rating, 1),
        'featured_count': featured_count,
        'rating_breakdown': rating_breakdown
    }
    
    serializer = TestimonialStatsSerializer(stats)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def public_testimonial_stats(request):
    """Public testimonial statistics"""
    approved_testimonials = Testimonial.objects.filter(status='approved')
    
    total_count = approved_testimonials.count()
    avg_rating = approved_testimonials.aggregate(avg=Avg('rating'))['avg'] or 0
    
    # Rating breakdown for approved testimonials only
    rating_breakdown = {}
    for i in range(1, 6):
        rating_breakdown[str(i)] = approved_testimonials.filter(rating=i).count()
    
    return Response({
        'total_count': total_count,
        'average_rating': round(avg_rating, 1),
        'rating_breakdown': rating_breakdown
    })