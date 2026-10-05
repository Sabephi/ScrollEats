import React, { useEffect, useState } from 'react';
import { type Recipe } from '../api.ts';
import { Link } from 'react-router-dom';

interface RecipeCardProps {
  recipe: Recipe;
}

export const RecipeCard: React.FC<RecipeCardProps> = ({ recipe }) => {
  return (
    <article className="recipe-card">
      <div className="card-header">
        <div className="author-info">
          <div className="author-avatar">👨‍🍳</div>
          <div>
            <h4 className="author-name">Chef Marcus</h4>
            <span className="author-tag">MASTERCHEF • 2H AGO</span>
          </div>
        </div>
        <div className="rating">★ 4.8</div>
      </div>

      <div className="card-text">
        <h2 className="card-title">
          <Link to={`/recipes/${recipe.id}`} className="card-link">
          {recipe.title}
          </Link>
        </h2>
        <p className="card-desc">{recipe.description}</p>
      </div>

  <Link to={`/recipes/${recipe.id}`} className="card-image-link">
      <div className="image-container">
        <img 
          src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80" 
          alt={recipe.title} 
        />
        <span className="time-badge">⏱ {recipe.prep_time} MIN</span>
      </div>
  </Link>

      <div className="macro-section">
        <span className="macro-label">MACRO-NUTRIENTS / SERVING</span>
        <div className="macro-grid">
          <div className="macro-pill">
            <strong>{recipe.calories}</strong>
            <span className="macro-kcal">KCAL</span>
          </div>
          <div className="macro-pill">
            <strong>{recipe.protein}g</strong>
            <span className="macro-protein">PROTEIN</span>
          </div>
          <div className="macro-pill">
            <strong>{recipe.carbs}g</strong>
            <span className="macro-carbs">CARBS</span>
          </div>
          <div className="macro-pill">
            <strong>{recipe.fat}g</strong>
            <span className="macro-fat">FAT</span>
          </div>
        </div>
      </div>

      <div className="card-footer">
        <div className="social-actions">
          <button className="action-btn action-heart">❤️ 2.4k</button>
          <button className="action-btn action-comment">💬 66</button>
          <button className="action-btn action-share">↗ Share</button>
        </div>
        <button className="save-btn">🔖 Save Recipe</button>
      </div>
    </article>
  );
};