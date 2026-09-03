from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import RecipeViewSet, IngredientViewSet, CommentViewSet, InquiryViewSet

router = DefaultRouter()
router.register(r'recipes', RecipeViewSet, basename='recipe')
router.register(r'ingredients', IngredientViewSet, basename='ingredient')
router.register(r'comments', CommentViewSet, basename='comment')
router.register(r'inquiries', InquiryViewSet, basename='inquiry')

urlpatterns = [
    path('', include(router.urls)),
]