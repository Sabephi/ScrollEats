from django.urls import path
from .views import register_user, UserProfileView, PublicUserProfileView, PublicUserFavoritesView

urlpatterns = [
    path('register/', register_user, name='register'),
    path('profile/', UserProfileView.as_view(), name='profile'),
    path('profile/<str:username>/', PublicUserProfileView.as_view(), name='public-profile'),
    path('profile/<str:username>/favorites/', PublicUserFavoritesView.as_view(), name='public-profile-favorites'),
]