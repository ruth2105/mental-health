from django.urls import path
from . import views

urlpatterns = [
    # Public testimonial views
    path('public/', views.PublicTestimonialListView.as_view(), name='public-testimonials'),
    path('public/stats/', views.public_testimonial_stats, name='public-testimonial-stats'),
    
    # User testimonial management
    path('my-testimonials/', views.UserTestimonialListView.as_view(), name='user-testimonials'),
    path('create/', views.TestimonialCreateView.as_view(), name='create-testimonial'),
    path('update/<int:pk>/', views.TestimonialUpdateView.as_view(), name='update-testimonial'),
    path('delete/<int:pk>/', views.TestimonialDeleteView.as_view(), name='delete-testimonial'),
    
    # Admin testimonial management
    path('admin/', views.AdminTestimonialListView.as_view(), name='admin-testimonials'),
    path('admin/<int:pk>/', views.AdminTestimonialDetailView.as_view(), name='admin-testimonial-detail'),
    path('admin/bulk-update/', views.bulk_update_testimonials, name='bulk-update-testimonials'),
    path('admin/bulk-delete/', views.bulk_delete_testimonials, name='bulk-delete-testimonials'),
    path('admin/stats/', views.testimonial_stats, name='testimonial-stats'),
]