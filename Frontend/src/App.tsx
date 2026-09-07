import { useEffect, useState } from 'react';
import { getRecipes, type Recipe } from './api.ts';

function App() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getRecipes()
      .then((data) => {
        setRecipes(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Błąd podczas pobierania przepisów:', err);
        setError('Nie udało się pobrać przepisów. Upewnij się, że serwer Django działa!');
        setLoading(false);
      });
  }, []);

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif', maxWidth: '800px', margin: '0 auto' }}>
      <h1>ScrollEats </h1>
      <h2>Lista Przepisów z API</h2>

      {loading && <p>Ładowanie przepisów...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {!loading && !error && recipes.length === 0 && (
        <p>Brak przepisów w bazie. Dodaj pierwsze pozycje przez panel admina!</p>
      )}

      <div style={{ display: 'grid', gap: '1rem', marginTop: '1rem' }}>
        {recipes.map((recipe) => (
          <div
            key={recipe.id}
            style={{
              border: '1px solid #ccc',
              borderRadius: '8px',
              padding: '1rem',
              backgroundColor: '#1a1a1a',
              color: '#fff'
            }}
          >
            <h3>{recipe.title}</h3>
            <p>{recipe.description}</p>
            <ul>
              <li><strong>Trudność:</strong> {recipe.difficulty}</li>
              <li><strong>Czas przygotowania:</strong> {recipe.prep_time} min</li>
              <li><strong>Kalorie:</strong> {recipe.calories} kcal</li>
              <li><strong>Makro:</strong> B: {recipe.protein}g | W: {recipe.carbs}g | T: {recipe.fat}g</li>
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;