import { useEffect, useState, useRef, useCallback } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { fetchRecipes, type Recipe } from './api';
import { Navbar } from './components/Navbar';
import { RecipeCard } from './components/RecipeCard';
import { RecipeDetail } from './components/RecipeDetail';
import AddRecipe from './components/AddRecipe';
import UserProfile from './components/UserProfile';
import Auth from './components/Auth';
import './App.css';

function HomeFeed() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const observerTarget = useRef<HTMLDivElement | null>(null); 

  const loadMoreRecipes = useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    setError(null);

    try {
      const data = await fetchRecipes(page);

      console.log('Dane z API:', data);

      const newRecipes = Array.isArray(data) ? data : data.results || [];
      
      console.log('Wyciągnięte przepisy:', newRecipes);

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

  return (
    <div style={{ width: '100%' }}>
      <main className="feed-container">
        {recipes.map((recipe) => (
          <RecipeCard key={recipe.id} recipe={recipe} />
        ))}

        {!loading && !error && recipes.length === 0 && (
          <p style={{ textAlign: 'center', marginTop: '3rem', color: '#9ca3af', width: '100%' }}>
            Brak przepisów do wyświetlenia. Przejdź do panelu lub użyj przycisku +, aby dodać pierwszy przepis!
          </p>
        )}

        <div ref={observerTarget} style={{ padding: '2rem 0', textAlign: 'center', width: '100%' }}>
          {loading && (
            <p style={{ color: '#22c55e', fontWeight: 600 }}>
              ⏳ Ładowanie kolejnych przepisów...
            </p>
          )}
          {error && (
            <p style={{ color: '#ef4444' }}>{error}</p>
          )}
          {!hasMore && recipes.length > 0 && (
            <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>
              Wyświetlono wszystkie dostępne przepisy!
            </p>
          )}
        </div>
      </main>
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
        <Route path="/auth" element={<Auth />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;