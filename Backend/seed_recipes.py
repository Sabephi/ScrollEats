import os
import re
import django
import requests

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'scrolleats_core.settings')
django.setup()

from django.contrib.auth import get_user_model
from recipes.models import Recipe, Ingredient, RecipeIngredient

SPOONACULAR_API_KEY = "612743de652d4517b5d12ea793e9a42c"

def fetch_and_seed_recipes(total_count=100):
    User = get_user_model()
    default_author, _ = User.objects.get_or_create(
        username='chef_scrolleats',
        defaults={'email': 'chef@scrolleats.com'}
    )


    print(f"Rozpoczynam pobieranie {total_count} przepisów ze Spoonacular API...")
    
    url = "https://api.spoonacular.com/recipes/complexSearch"
    params = {
        'apiKey': SPOONACULAR_API_KEY,
        'number': total_count,
        'addRecipeInformation': True,
        'addRecipeNutrition': True,
        'fillIngredients': True,
    }

    try:
        response = requests.get(url, params=params)
        response.raise_for_status()
        data = response.json()
        recipes_data = data.get('results', [])
        
        print(f"Pobrano {len(recipes_data)} przepisów z API. Rozpoczynam zapis do bazy...")

        created_count = 0

        for item in recipes_data:
            title = item.get('title', 'Przepis bez nazwy')
            
            if Recipe.objects.filter(title=title).exists():
                print(f"Pomijam (już istnieje): {title}")
                continue

            raw_summary = item.get('summary', '')
            clean_summary = re.sub('<[^<]+?>', '', raw_summary)[:300] + '...' if raw_summary else 'Smaczny i prosty przepis.'

            nutrients = {n['name']: n['amount'] for n in item.get('nutrition', {}).get('nutrients', [])}
            calories = int(nutrients.get('Calories', 350))
            protein = int(nutrients.get('Protein', 20))
            carbs = int(nutrients.get('Carbohydrates', 40))
            fat = int(nutrients.get('Fat', 12))

            prep_time = item.get('readyInMinutes', 30)
            image_url = item.get('image', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80')

            recipe = Recipe.objects.create(
                author=default_author,
                title=title,
                description=clean_summary,
                prep_time=prep_time,
                calories=calories,
                protein=protein,
                carbs=carbs,
                fat=fat,
                difficulty='medium',
                image_url=image_url
            )

            extended_ingredients = item.get('extendedIngredients', [])
            for ing in extended_ingredients:
                ing_name = ing.get('nameClean') or ing.get('name') or 'Składnik'
                ing_name = ing_name.capitalize()

                ingredient_obj, _ = Ingredient.objects.get_or_create(name=ing_name)

                amount = round(ing.get('amount', 1), 1)
                unit = ing.get('unit', 'szt') or 'szt'

                RecipeIngredient.objects.create(
                    recipe=recipe,
                    ingredient=ingredient_obj,
                    amount=amount,
                    unit=unit
                )

            created_count += 1
            print(f" Saved [{created_count}/{len(recipes_data)}]: {title}")

        print(f"\n Pomyślnie dodano {created_count} nowych przepisów do bazy Django.")

    except Exception as e:
        print(f"Błąd podczas pobierania lub zapisywania danych: {e}")

if __name__ == "__main__":
    fetch_and_seed_recipes(100)