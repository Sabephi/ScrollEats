from django.urls import path
from .views import register_user, UserProfileView

urlpatterns = [
    path('register/', register_user, name='register'),
    path('profile/', UserProfileView.as_view(), name='profile'),
]