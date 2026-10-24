from django.contrib import admin
from django.utils.html import format_html
from .models import Recipe, Ingredient, RecipeIngredient, Comment, MealPlan, Inquiry  # <-- TUTAJ DODANO MealPlan

@admin.register(Ingredient)
class IngredientAdmin(admin.ModelAdmin):
    list_display = ('id', 'name')
    search_fields = ('name',)

class RecipeIngredientInline(admin.TabularInline):
    model = RecipeIngredient
    extra = 1

@admin.register(Recipe)
class RecipeAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'difficulty', 'prep_time', 'calories', 'author', 'image_preview', 'created_at')
    search_fields = ('title', 'description')
    inlines = [RecipeIngredientInline]

    def image_preview(self, obj):
        if obj.image_url:
            return format_html('<img src="{}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 6px;" />', obj.image_url)
        return "Brak zdjęcia"
    
    image_preview.short_description = 'Zdjęcie'

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