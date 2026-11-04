from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAuthenticatedOrReadOnly
from rest_framework.generics import RetrieveUpdateAPIView, RetrieveAPIView, ListAPIView
from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404

from .serializers import UserProfileSerializer
from recipes.models import Recipe
from recipes.serializers import RecipeSerializer

User = get_user_model()

@api_view(['POST'])
@permission_classes([AllowAny])
def register_user(request):
    username = request.data.get('username')
    email = request.data.get('email')
    password = request.data.get('password')

    if not username or not password or not email:
        return Response(
            {'detail': 'Wszystkie pola są wymagane.'}, 
            status=status.HTTP_400_BAD_REQUEST
        )

    if User.objects.filter(username=username).exists():
        return Response(
            {'detail': 'Użytkownik o takiej nazwie już istnieje.'}, 
            status=status.HTTP_400_BAD_REQUEST
        )

    if User.objects.filter(email=email).exists():
        return Response(
            {'detail': 'Konto na ten adres e-mail już istnieje.'}, 
            status=status.HTTP_400_BAD_REQUEST
        )

    user = User.objects.create_user(
        username=username,
        email=email,
        password=password
    )
    user.save()

    return Response(
        {'detail': 'Konto zostało pomyślnie utworzone.'}, 
        status=status.HTTP_201_CREATED
    )

class UserProfileView(RetrieveUpdateAPIView):
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user

class PublicUserProfileView(RetrieveAPIView):
    queryset = User.objects.all()
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    lookup_field = 'username'

class PublicUserFavoritesView(ListAPIView):
    permission_classes = [IsAuthenticatedOrReadOnly]
    serializer_class = RecipeSerializer

    def get_queryset(self):
        username = self.kwargs.get('username')
        target_user = get_object_or_404(User, username=username)

        if self.request.user != target_user and not target_user.is_favorites_public:
            return Recipe.objects.none()

        try:
            recipe_ids = target_user.favorite_recipes.values_list('recipe_id', flat=True)
            return Recipe.objects.filter(id__in=recipe_ids)
        except:
            return target_user.favorite_recipes.all()