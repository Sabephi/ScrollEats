from rest_framework import serializers
from .models import Recipe, Ingredient, RecipeIngredient, Comment, MealPlan, Inquiry

class IngredientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ingredient
        fields = ['id', 'name']

class RecipeIngredientSerializer(serializers.ModelSerializer):
    ingredient_name = serializers.ReadOnlyField(source='ingredient.name')

    class Meta:
        model = RecipeIngredient
        fields = ['id', 'ingredient', 'ingredient_name', 'amount', 'unit']

class RecipeSerializer(serializers.ModelSerializer):
    ingredients = RecipeIngredientSerializer(source='recipeingredient_set', many=True, read_only=True)
    author_username = serializers.ReadOnlyField(source='author.username')

    class Meta:
        model = Recipe
        fields = [
            'id', 'title', 'description', 'prep_time', 'difficulty',
            'calories', 'protein', 'carbs', 'fat', 'author', 'author_username',
            'created_at', 'ingredients'
        ]
        read_only_fields = ['author', 'created_at']

class CreateRecipeIngredientSerializer(serializers.ModelSerializer):
    class Meta:
        model = RecipeIngredient
        fields = ['ingredient', 'amount', 'unit']

class CreateRecipeSerializer(serializers.ModelSerializer):
    ingredients = CreateRecipeIngredientSerializer(many=True, write_only=True)

    class Meta:
        model = Recipe
        fields = [
            'id', 'title', 'description', 'prep_time', 'difficulty',
            'calories', 'protein', 'carbs', 'fat', 'ingredients'
        ]

    def create(self, validated_data):
        ingredients_data = validated_data.pop('ingredients')
        recipe = Recipe.objects.create(**validated_data)
        for ing_data in ingredients_data:
            RecipeIngredient.objects.create(recipe=recipe, **ing_data)
        return recipe

class CommentSerializer(serializers.ModelSerializer):
    author_username = serializers.ReadOnlyField(source='author.username')

    class Meta:
        model = Comment
        fields = ['id', 'recipe', 'author', 'author_username', 'content', 'rating', 'created_at']
        read_only_fields = ['author', 'created_at']

class InquirySerializer(serializers.ModelSerializer):
    reporter_username = serializers.ReadOnlyField(source='reporter.username')

    class Meta:
        model = Inquiry
        fields = ['id', 'reporter', 'reporter_username', 'target_recipe', 'reason', 'status', 'created_at', 'resolution_notes']
        read_only_fields = ['reporter', 'status', 'created_at', 'resolution_notes']