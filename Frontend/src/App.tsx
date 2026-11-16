import { useEffect, useState, useRef, useCallback } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { fetchRecipes, type Recipe } from './api';
import { Navbar } from './components/Navbar';
import { RecipeCard } from './components/RecipeCard';
import { RecipeDetail } from './components/RecipeDetail';
import { MealPlan } from './components/MealPlan';
import AddRecipe from './components/AddRecipe';
import UserProfile from './components/UserProfile';
import Auth from './components/Auth';
import { FiltersSidebar } from './components/FiltersSidebar';
import './App.css';
import './components/FiltersSidebar.css';

const getEffectiveRating = (recipe: any): number => {
  const apiRating = recipe.average_rating ?? recipe.rating;
  if (apiRating !== undefined && apiRating !== null && Number(apiRating) > 0) {
    return Number(apiRating);
  }
  if (recipe.id) {
    const savedAvg = localStorage.getItem(`recipe_averageRating_${recipe.id}`);
    if (savedAvg) {
      const parsed = Number(savedAvg);
      if (!isNaN(parsed) && parsed > 0) return parsed;
    }
  }
  return 0;
};

function HomeFeed() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const observerTarget = useRef<HTMLDivElement | null>(null);

  const [filters, setFilters] = useState({
    sortBy: 'Popular',
    caloriesMin: 0,
    caloriesMax: 1000,
    proteinMin: 0,
    proteinMax: 100,
    carbsMin: 0,
    carbsMax: 150,
    fatMin: 0,
    fatMax: 100,
    prepTime: '',
    difficulty: [] as string[],
    ratings: null as number | null,
    mealType: [] as string[],
    cuisine: [] as string[],
    categories: [] as string[],
    allergens: [] as string[],
  });

  const activeFiltersCount =
    (filters.sortBy !== 'Popular' ? 1 : 0) +
    (filters.prepTime ? 1 : 0) +
    filters.difficulty.length +
    filters.mealType.length +
    filters.cuisine.length +
    filters.categories.length +
    filters.allergens.length;

  const handleResetFilters = () => {
    setFilters({
      sortBy: 'Popular',
      caloriesMin: 0,
      caloriesMax: 1000,
      proteinMin: 0,
      proteinMax: 100,
      carbsMin: 0,
      carbsMax: 150,
      fatMin: 0,
      fatMax: 100,
      prepTime: '',
      difficulty: [],
      ratings: null,
      mealType: [],
      cuisine: [],
      categories: [],
      allergens: [],
    });
  };

  const loadMoreRecipes = useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    setError(null);

    try {
      const data = await fetchRecipes(page);
      const newRecipes = Array.isArray(data) ? data : data.results || [];

      setRecipes((prev) => [...prev, ...newRecipes]);

      const hasNextPage = Array.isArray(data) ? false : !!data.next;
      setHasMore(hasNextPage);

      setPage((prevPage) => prevPage + 1);
    } catch (err) {
      console.error('Błąd pobierania przepisów:', err);
      setError('Nie udało się pobrać przepisów.');
    } finally {
      setLoading(false);
    }
  }, [page, hasMore, loading]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          loadMoreRecipes();
        }
      },
      { threshold: 0.2 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [loadMoreRecipes, hasMore, loading]);

  const filteredRecipes = recipes
    .filter((recipe: any) => {
      if (recipe.calories !== undefined && recipe.calories !== null) {
        if (recipe.calories < filters.caloriesMin || recipe.calories > filters.caloriesMax) return false;
      }
      if (recipe.protein !== undefined && recipe.protein !== null) {
        if (recipe.protein < filters.proteinMin || recipe.protein > filters.proteinMax) return false;
      }
      if (recipe.carbs !== undefined && recipe.carbs !== null) {
        if (recipe.carbs < filters.carbsMin || recipe.carbs > filters.carbsMax) return false;
      }
      if (recipe.fat !== undefined && recipe.fat !== null) {
        if (recipe.fat < filters.fatMin || recipe.fat > filters.fatMax) return false;
      }

      if (
        filters.difficulty.length > 0 &&
        !filters.difficulty.map((d) => d.toLowerCase()).includes(recipe.difficulty?.toLowerCase())
      ) {
        return false;
      }
      if (
        filters.mealType.length > 0 &&
        !recipe.meal_types?.some((m: string) => filters.mealType.includes(m))
      ) {
        return false;
      }
      if (
        filters.cuisine.length > 0 &&
        !recipe.cuisines?.some((c: string) => filters.cuisine.includes(c))
      ) {
        return false;
      }
      if (
        filters.categories.length > 0 &&
        !recipe.categories?.some((cat: string) => filters.categories.includes(cat))
      ) {
        return false;
      }
      if (
        filters.allergens.length > 0 &&
        !recipe.allergens?.some((all: string) => filters.allergens.includes(all))
      ) {
        return false;
      }

      return true;
    })
    .sort((a: any, b: any) => {
      if (filters.sortBy === 'Newest') {
        return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
      }
      if (filters.sortBy === 'Highest Rated' || filters.sortBy === 'Highest Ranking') {
        return getEffectiveRating(b) - getEffectiveRating(a);
      }
      if (filters.sortBy === 'Quickest') {
        return (a.prep_time || 0) - (b.prep_time || 0);
      }
      return 0;
    });

  return (
    <div style={{ width: '100%', display: 'flex', justifyContent: 'center', padding: '24px 16px', boxSizing: 'border-box' }}>
      <div style={{ display: 'flex', gap: '24px', width: '100%', maxWidth: '1200px', alignItems: 'flex-start', boxSizing: 'border-box' }}>
        <FiltersSidebar
          filters={filters}
          onApply={(newFilters) => setFilters(newFilters)}
          onReset={handleResetFilters}
          activeCount={activeFiltersCount}
        />

        <main className="feed-container" style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '20px', boxSizing: 'border-box' }}>
          {filteredRecipes.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}

          {!loading && !error && filteredRecipes.length === 0 && (
            <p style={{ textAlign: 'center', marginTop: '3rem', color: '#9ca3af', width: '100%' }}>
              Brak przepisów pasujących do wybranych filtrów.
            </p>
          )}

          <div ref={observerTarget} style={{ padding: '2rem 0', textAlign: 'center', width: '100%' }}>
            {loading && (
              <p style={{ color: '#22c55e', fontWeight: 600 }}>
                ⏳ Ładowanie kolejnych przepisów...
              </p>
            )}
            {error && <p style={{ color: '#ef4444' }}>{error}</p>}
            {!hasMore && recipes.length > 0 && (
              <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>
                Wyświetlono wszystkie dostępne przepisy!
              </p>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomeFeed />} />
        <Route path="/recipes/:id" element={<RecipeDetail />} />
        <Route path="/add-recipe" element={<AddRecipe />} />
        <Route path="/profile" element={<UserProfile />} />
        <Route path="/profile/:username" element={<UserProfile />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/meal-plan" element={<MealPlan />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;