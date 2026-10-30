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
    get_image = serializers.SerializerMethodField()
    ingredients = RecipeIngredientSerializer(source='recipeingredient_set', many=True, read_only=True)
    author_username = serializers.ReadOnlyField(source='author.username')
    is_favorited = serializers.SerializerMethodField()

    class Meta:
        model = Recipe
        fields = [
            'id', 'title', 'description', 'prep_time', 'difficulty',
            'calories', 'protein', 'carbs', 'fat', 'image', 'image_url', 
            'get_image', 'instructions', 'author', 'author_username', 'created_at', 'ingredients',
            'favorites', 'is_favorited'
        ]
        read_only_fields = ['author', 'created_at']

    def get_get_image(self, obj):
        if obj.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return obj.image_url

    def get_is_favorited(self, obj):
        request = self.context.get('request')
        if request and hasattr(request, 'user') and request.user.is_authenticated:
            return obj.favorites.filter(id=request.user.id).exists()
        return False


class CreateRecipeIngredientSerializer(serializers.Serializer):
    ingredient_name = serializers.CharField(max_length=255)
    amount = serializers.FloatField(default=1.0)
    unit = serializers.CharField(max_length=50, default='szt')


class CreateRecipeSerializer(serializers.ModelSerializer):
    ingredients = CreateRecipeIngredientSerializer(many=True, write_only=True, required=False)

    class Meta:
        model = Recipe
        fields = [
            'id', 'title', 'description', 'prep_time', 'difficulty',
            'calories', 'protein', 'carbs', 'fat', 'image', 'image_url', 
            'instructions', 'ingredients'
        ]

    def create(self, validated_data):
        ingredients_data = validated_data.pop('ingredients', [])

        request = self.context.get('request')
        if request and hasattr(request, 'user') and request.user.is_authenticated:
            validated_data['author'] = request.user

        recipe = Recipe.objects.create(**validated_data)

        for ing_data in ingredients_data:
            ing_name = ing_data['ingredient_name'].strip().capitalize()
            if ing_name:
                ingredient_obj, _ = Ingredient.objects.get_or_create(name=ing_name)
                RecipeIngredient.objects.create(
                    recipe=recipe,
                    ingredient=ingredient_obj,
                    amount=ing_data.get('amount', 1.0),
                    unit=ing_data.get('unit', 'szt')
                )

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