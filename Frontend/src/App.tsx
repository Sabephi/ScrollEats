import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { getRecipes, type Recipe } from './api';
import { Navbar } from './components/Navbar';
import { RecipeCard } from './components/RecipeCard';
import { RecipeDetail } from './components/RecipeDetail';
import './App.css';

function HomeFeed() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getRecipes()
      .then((data) => {
        setRecipes(data);
        setLoading(false);
      })
      .catch(() => {
        setError('Nie udało się pobrać przepisów.');
        setLoading(false);
      });
  }, []);

  return (
    <div style={{ width: '100%' }}>
      <main className="feed-container">
        {loading && <p style={{ textAlign: 'center', color: '#9ca3af' }}>Ładowanie przydzielonych przepisów...</p>}
        {error && <p style={{ color: '#ef4444', textAlign: 'center' }}>{error}</p>}
        
        {recipes.map((recipe) => (
          <RecipeCard key={recipe.id} recipe={recipe} />
        ))}
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
      </Routes>
    </BrowserRouter>
  );
}

export default App;