import React, { useState } from 'react';
import { type Recipe, toggleFavorite } from '../api';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, MessageCircle, Share2 } from 'lucide-react';
import defaultAvatar from '../assets/default_avatar.jpg';

interface RecipeCardProps {
  recipe: Recipe;
}

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80';

const formatTimeAgo = (dateString?: string): string => {
  if (!dateString) return 'RECENTLY';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'RECENTLY';

  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'JUST NOW';
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}M AGO`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}H AGO`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}D AGO`;

  return date
    .toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    .toUpperCase();
};

const getLocalCommentsCount = (recipeId?: number): number => {
  if (!recipeId) return 0;
  try {
    const saved = localStorage.getItem(`recipe_comments_${recipeId}`);
    if (!saved) return 0;
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed.length : 0;
  } catch {
    return 0;
  }
};

const getLocalAverageRating = (recipeId?: number): number | null => {
  if (!recipeId) return null;
  const savedAvg = localStorage.getItem(`recipe_averageRating_${recipeId}`);
  if (!savedAvg) return null;
  const num = Number(savedAvg);
  return !isNaN(num) && num > 0 ? num : null;
};

export const RecipeCard: React.FC<RecipeCardProps> = ({ recipe }) => {
  const navigate = useNavigate();
  const data = recipe as any;

  const recipeImage = recipe.get_image || recipe.image_url || FALLBACK_IMAGE;
  const authorName = recipe.author_username || 'Chef';

  const rawAvatar: string =
    data.author_avatar || data.get_author_avatar || data.author?.avatar || '';
  const authorAvatar = rawAvatar
    ? rawAvatar.startsWith('http')
      ? rawAvatar
      : `http://127.0.0.1:8000${rawAvatar.startsWith('/') ? '' : '/'}${rawAvatar}`
    : defaultAvatar;

  const addedTime = formatTimeAgo(data.created_at);

  const apiRating = data.average_rating ?? data.rating;
  const effectiveRating =
    apiRating !== undefined && apiRating !== null && Number(apiRating) > 0
      ? Number(apiRating)
      : getLocalAverageRating(recipe.id);

  const ratingDisplay =
    effectiveRating !== null && effectiveRating > 0
      ? effectiveRating.toFixed(1)
      : 'New';

  const apiCommentsCount: number =
    data.comments_count ?? (Array.isArray(data.comments) ? data.comments.length : 0);
  const localCommentsCount = getLocalCommentsCount(recipe.id);
  const commentsCount = Math.max(apiCommentsCount, localCommentsCount);

  const initiallyLiked = recipe.is_favorited === true;
  const initialLikesCount = recipe.favorites ? recipe.favorites.length : 0;

  const [isLiked, setIsLiked] = useState(initiallyLiked);
  const [likesCount, setLikesCount] = useState(initialLikesCount);

  const handleLikeClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!recipe.id) return;

    setIsLiked(!isLiked);
    setLikesCount((prev) => (isLiked ? prev - 1 : prev + 1));

    try {
      await toggleFavorite(recipe.id);
    } catch (err) {
      setIsLiked(isLiked);
      setLikesCount((prev) => (isLiked ? prev + 1 : prev - 1));
      console.error('Błąd podczas polubienia przepisu:', err);
    }
  };

  const handleAuthorClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (recipe.author_username) {
      navigate(`/profile/${recipe.author_username}`);
    }
  };

  const handleCommentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/recipes/${recipe.id}`);
  };

  return (
    <article className="recipe-card">
      <div className="card-header">
        <div
          className="author-info"
          onClick={handleAuthorClick}
          style={{ cursor: 'pointer' }}
        >
          <div className="author-avatar" style={{ overflow: 'hidden', padding: 0 }}>
            <img
              src={authorAvatar}
              alt={authorName}
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = defaultAvatar;
              }}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                borderRadius: '50%',
                display: 'block',
              }}
            />
          </div>
          <div>
            <h4 className="author-name">{authorName}</h4>
            <span
              style={{
                fontSize: '11px',
                color: '#8e9b94',
                letterSpacing: '0.5px',
                display: 'block',
                marginTop: '2px',
              }}
            >
              {addedTime}
            </span>
          </div>
        </div>
        <div className="rating">★ {ratingDisplay}</div>
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
          <img src={recipeImage} alt={recipe.title} />
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
          <button
            className="action-btn action-heart"
            onClick={handleLikeClick}
            style={{ color: isLiked ? '#ef4444' : 'inherit' }}
          >
            <Heart
              size={16}
              fill={isLiked ? '#ef4444' : 'none'}
              color={isLiked ? '#ef4444' : 'currentColor'}
            />
            {likesCount > 0 ? likesCount : 'Like'}
          </button>

          <button className="action-btn action-comment" onClick={handleCommentClick}>
            <MessageCircle size={16} /> {commentsCount}
          </button>
          <button className="action-btn action-share">
            <Share2 size={16} /> Share
          </button>
        </div>
      </div>
    </article>
  );
};

export default RecipeCard;