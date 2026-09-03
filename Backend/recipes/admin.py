from django.contrib import admin
from .models import Recipe, Ingredient, RecipeIngredient, Comment, MealPlan, Inquiry

@admin.register(Ingredient)
class IngredientAdmin(admin.ModelAdmin):
    list_display = ('id', 'name')
    search_fields = ('name',)

class RecipeIngredientInline(admin.TabularInline):
    model = RecipeIngredient
    extra = 1

@admin.register(Recipe)
class RecipeAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'difficulty', 'prep_time', 'calories', 'author', 'created_at')
    list_filter = ('difficulty', 'created_at')
    search_fields = ('title', 'description')
    inlines = [RecipeIngredientInline]

@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ('id', 'recipe', 'author', 'rating', 'created_at')

@admin.register(MealPlan)
class MealPlanAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'recipe', 'date', 'meal_type')

@admin.register(Inquiry)
class InquiryAdmin(admin.ModelAdmin):
    list_display = ('id', 'reporter', 'target_recipe', 'status', 'created_at')
    list_filter = ('status',)