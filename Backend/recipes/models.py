from django.db import models
from django.conf import settings
from django.contrib.auth import get_user_model
class Recipe(models.Model):
    DIFFICULTY_CHOICES = (
        ('beginner', 'Beginner'),
        ('medium', 'Medium'),
        ('advanced', 'Advanced'),
    )

    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='recipes')
    
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    prep_time = models.PositiveIntegerField(help_text="Czas przygotowania w minutach")
    difficulty = models.CharField(max_length=20, choices=DIFFICULTY_CHOICES, default='beginner')
    image = models.ImageField(upload_to='recipes_covers/', blank=True, null=True)
    image_url = models.URLField(max_length=500, blank=True, null=True)
    instructions = models.JSONField(default=list, blank=True)
    calories = models.PositiveIntegerField(default=0)
    protein = models.PositiveIntegerField(default=0)
    carbs = models.PositiveIntegerField(default=0)
    fat = models.PositiveIntegerField(default=0)

    favorites = models.ManyToManyField(
        settings.AUTH_USER_MODEL, 
        related_name='favorite_recipes', 
        blank=True
    )
    
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title
    
class Ingredient(models.Model):
    name = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.name


class RecipeIngredient(models.Model):
    recipe = models.ForeignKey(Recipe, on_delete=models.CASCADE)
    ingredient = models.ForeignKey(Ingredient, on_delete=models.CASCADE)
    amount = models.FloatField()
    unit = models.CharField(max_length=20)


class Comment(models.Model):
    recipe = models.ForeignKey(Recipe, on_delete=models.CASCADE, related_name='comments')
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    content = models.TextField()
    rating = models.PositiveIntegerField(default=5)
    created_at = models.DateTimeField(auto_now_add=True)


class MealPlan(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    recipe = models.ForeignKey(Recipe, on_delete=models.CASCADE)
    date = models.DateField()
    meal_type = models.CharField(max_length=50)


class Inquiry(models.Model):
    STATUS_CHOICES = (
        ('NEW', 'New'),
        ('IN_PROGRESS', 'In Progress'),
        ('RESOLVED', 'Resolved'),
    )

    reporter = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    target_recipe = models.ForeignKey(Recipe, on_delete=models.CASCADE, null=True, blank=True)
    reason = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='NEW')
    resolution_notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

class Collection(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='collections')
    name = models.CharField(max_length=100)
    recipes = models.ManyToManyField(Recipe, related_name='in_collections', blank=True)
    is_public = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} - {self.user.username}"