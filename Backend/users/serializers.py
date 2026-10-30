from rest_framework import serializers
from django.contrib.auth import get_user_model

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'role']

class UserProfileSerializer(serializers.ModelSerializer):
    recipes_count = serializers.SerializerMethodField()
    saved_count = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'role', 'first_name', 'last_name', 
            'bio', 'country', 'city', 'avatar', 
            'recipes_count', 'saved_count'
        ]
        read_only_fields = ['email', 'recipes_count', 'saved_count', 'role']

    def get_recipes_count(self, obj):
        return obj.recipes.count() 

    def get_saved_count(self, obj):
        return obj.favorite_recipes.count()