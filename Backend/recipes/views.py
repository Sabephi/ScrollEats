from django.shortcuts import render
from rest_framework import viewsets, permissions, filters
from rest_framework.pagination import PageNumberPagination
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend

from .models import Recipe, Ingredient, Comment, Inquiry
from .serializers import (
    RecipeSerializer, CreateRecipeSerializer,
    IngredientSerializer, CommentSerializer, InquirySerializer
)

class RecipePagination(PageNumberPagination):
    page_size = 10 
    page_size_query_param = 'page_size'
    max_page_size = 100

class RecipeViewSet(viewsets.ModelViewSet):
    queryset = Recipe.objects.all().order_by('-created_at')
    serializer_class = RecipeSerializer
    pagination_class = RecipePagination
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['difficulty']
    search_fields = ['title', 'description']

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return CreateRecipeSerializer
        return RecipeSerializer

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def toggle_favorite(self, request, pk=None):
        recipe = self.get_object()
        user = request.user
        if user in recipe.favorites.all():
            recipe.favorites.remove(user)
            return Response({'status': 'unfavorited'})
        else:
            recipe.favorites.add(user)
            return Response({'status': 'favorited'})

    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def my_favorites(self, request):
        recipes = self.queryset.filter(favorites=request.user)
        page = self.paginate_queryset(recipes)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(recipes, many=True)
        return Response(serializer.data)


class IngredientViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Ingredient.objects.all()
    serializer_class = IngredientSerializer
    permission_classes = [permissions.AllowAny]


class CommentViewSet(viewsets.ModelViewSet):
    queryset = Comment.objects.all().order_by('-created_at')
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)


class InquiryViewSet(viewsets.ModelViewSet):
    queryset = Inquiry.objects.all()
    serializer_class = InquirySerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(reporter=self.request.user)