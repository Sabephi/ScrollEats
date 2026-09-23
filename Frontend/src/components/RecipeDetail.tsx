import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchRecipeById, type Recipe } from '../api';

export const RecipeDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    fetchRecipeById(id)
      .then((data) => {
        setRecipe(data);
        setLoading(false);
      })
      .catch(() => {
        setError('Nie udało się pobrać szczegółów przepisu.');
        setLoading(false);
      });
  }, [id]);

  if (loading) return <div style={{ textAlign: 'center', padding: '3rem', color: '#9ca3af' }}>Ładowanie przepisu...</div>;
  if (error || !recipe) return <div style={{ textAlign: 'center', padding: '3rem', color: '#ef4444' }}>{error || 'Nie znaleziono przepisu.'}</div>;

  return (
    <main className="recipe-detail-container">
      <Link to="/" className="back-link">
        ← Powrót do przepisów
      </Link>

      <div className="recipe-header">
        <h1 className="recipe-title">{recipe.title}</h1>
        <p className="recipe-description">{recipe.description}</p>
      </div>

      <div className="recipe-stats-grid">
        <div className="stat-card">
          <span className="stat-value">{recipe.prep_time} min</span>
          <span className="stat-label">Czas</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{recipe.calories} kcal</span>
          <span className="stat-label">Kalorie</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{recipe.protein}g</span>
          <span className="stat-label">Białko</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{recipe.carbs}g</span>
          <span className="stat-label">Węglowodany</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{recipe.fat}g</span>
          <span className="stat-label">Tłuszcze</span>
        </div>
      </div>

      <div className="recipe-content-grid">
        <section className="ingredients-section">
          <h2>Składniki</h2>
          <ul className="ingredients-list">
            {recipe.ingredients?.map((item) => (
              <li key={item.id} className="ingredient-item">
                <span className="ingredient-name">{item.ingredient.name}</span>
                <span className="ingredient-amount">{item.amount} {item.unit}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
};