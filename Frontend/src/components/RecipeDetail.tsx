import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { fetchRecipeById, toggleFavorite, type Recipe } from '../api';
import { CookingModeModal } from './CookingModeModal';
import defaultAvatar from '../assets/default_avatar.jpg';
import './RecipeDetail.css';
import * as Icon from 'lucide-react';

interface RecipeComment {
  id: string;
  username: string;
  avatarUrl: string | null;
  text: string;
  date: string;
  likes: number;
}

export const RecipeDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [unitSystem, setUnitSystem] = useState<'metric' | 'us'>('metric');
  const [isLiked, setIsLiked] = useState<boolean>(false);

  const [isCookingModeOpen, setIsCookingModeOpen] = useState(false);
  const [shareTooltip, setShareTooltip] = useState(false);

  const [averageRating, setAverageRating] = useState(0);
  const [ratingCount, setRatingCount] = useState(0);
  const [userRating, setUserRating] = useState<number | null>(null);
  const [hoveredStar, setHoveredStar] = useState<number | null>(null);

  const [comments, setComments] = useState<RecipeComment[]>([]);
  const [newCommentText, setNewCommentText] = useState("");
  const [userLikedComments, setUserLikedComments] = useState<string[]>([]);
  const [lastCommentTime, setLastCommentTime] = useState<number>(0);

  const [userAvatarsCache, setUserAvatarsCache] = useState<Record<string, string>>({});

  const isLoggedIn = !!localStorage.getItem('access_token');
  const currentUsername = localStorage.getItem('username') || 'guest';
  const token = localStorage.getItem('access_token');

  const getFullAvatarUrl = (url: string | null) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    return `http://127.0.0.1:8000${url.startsWith('/') ? '' : '/'}${url}`;
  };

  const fetchAvatarForUser = async (username: string) => {
    if (!username || userAvatarsCache[username]) return;
    try {
      const res = await fetch(`/api/users/profile/${username}/`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.avatar) {
          setUserAvatarsCache(prev => ({ ...prev, [username]: getFullAvatarUrl(data.avatar) || '' }));
        }
      }
    } catch (e) {
    }
  };

  useEffect(() => {
    if (isLoggedIn && token) {
      fetch('/api/users/profile/', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })
        .then((res) => res.ok ? res.json() : null)
        .then((data) => {
          if (data && data.username && data.avatar) {
            const fullUrl = getFullAvatarUrl(data.avatar);
            if (fullUrl) {
              setUserAvatarsCache(prev => ({ ...prev, [data.username]: fullUrl }));
            }
          }
        })
        .catch(() => {});
    }
  }, [isLoggedIn, token]);

  useEffect(() => {
    if (!id) return;

    const userSpecificRatingKey = `recipe_rating_${id}_${currentUsername}`;
    const savedRatingStr = isLoggedIn ? localStorage.getItem(userSpecificRatingKey) : null;

    const savedCountStr = localStorage.getItem(`recipe_ratingCount_${id}`);
    const savedAvgStr = localStorage.getItem(`recipe_averageRating_${id}`);
    const savedCommentsStr = localStorage.getItem(`recipe_comments_${id}`);

    if (savedRatingStr) setUserRating(Number(savedRatingStr));
    else setUserRating(null);

    if (savedCountStr) setRatingCount(Number(savedCountStr));
    if (savedAvgStr) setAverageRating(Number(savedAvgStr));

    if (savedCommentsStr) {
      try {
        const parsedComments = JSON.parse(savedCommentsStr);
        setComments(parsedComments);
        parsedComments.forEach((c: RecipeComment) => {
          if (c.username) fetchAvatarForUser(c.username);
        });
      } catch (e) {
        setComments([]);
      }
    }

    if (isLoggedIn) {
      const savedLikedComments = localStorage.getItem(`liked_comments_${currentUsername}`);
      if (savedLikedComments) setUserLikedComments(JSON.parse(savedLikedComments));
    } else {
      setUserLikedComments([]);
    }

    fetchRecipeById(id)
      .then((data: any) => {
        setRecipe(data);
        setIsLiked(data.is_favorited === true);

        if (data.author_username) {
          fetchAvatarForUser(data.author_username);
        }

        if (data.user_rating && isLoggedIn) {
          setUserRating(data.user_rating);
          localStorage.setItem(userSpecificRatingKey, String(data.user_rating));
        }
        if (data.ratings_count) {
          setRatingCount(data.ratings_count);
          localStorage.setItem(`recipe_ratingCount_${id}`, String(data.ratings_count));
        }
        if (data.average_rating) {
          setAverageRating(data.average_rating);
          localStorage.setItem(`recipe_averageRating_${id}`, String(data.average_rating));
        }

        setLoading(false);
      })
      .catch(() => {
        setError('Nie udało się pobrać szczegółów przepisu.');
        setLoading(false);
      });
  }, [id, currentUsername, isLoggedIn]);

  const handleLikeClick = async () => {
    if (!recipe?.id) return;
    setIsLiked(!isLiked);
    try {
      await toggleFavorite(recipe.id);
    } catch (err) {
      setIsLiked(isLiked);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setShareTooltip(true);
    setTimeout(() => setShareTooltip(false), 2000);
  };

  const handleRate = async (rate: number) => {
    if (!isLoggedIn) {
      alert("Zaloguj się, aby móc ocenić ten przepis.");
      return;
    }
    if (userRating === rate) return;

    let newCount = ratingCount;
    let newAvg = averageRating;

    if (userRating === null) {
      newCount += 1;
      newAvg = ratingCount === 0 ? rate : ((averageRating * ratingCount) + rate) / newCount;
    } else {
      newAvg = ((averageRating * ratingCount) - userRating + rate) / ratingCount;
    }

    const finalAvg = Number(newAvg.toFixed(1));

    setAverageRating(finalAvg);
    setRatingCount(newCount);
    setUserRating(rate);

    if (id) {
      localStorage.setItem(`recipe_rating_${id}_${currentUsername}`, String(rate));
      localStorage.setItem(`recipe_ratingCount_${id}`, String(newCount));
      localStorage.setItem(`recipe_averageRating_${id}`, String(finalAvg));
    }

    try {
      await fetch(`/api/recipes/${recipe?.id}/rate/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ rating: rate })
      });
    } catch (err) {}
  };

  const handlePostComment = () => {
    if (!isLoggedIn) {
      alert("Musisz być zalogowany, aby dodać komentarz.");
      return;
    }
    if (!newCommentText.trim()) return;

    const now = Date.now();
    if (now - lastCommentTime < 5000) {
      alert("Poczekaj 5 sekund przed dodaniem kolejnego komentarza.");
      return;
    }

    const dzisiaj = new Date().toDateString();
    const komentarzeDzisiaj = comments.filter(c =>
      c.username === currentUsername && new Date(c.date).toDateString() === dzisiaj
    );

    if (komentarzeDzisiaj.length >= 10) {
      alert("Osiągnąłeś dzienny limit 10 komentarzy dla tego przepisu.");
      return;
    }

    const myAvatar = userAvatarsCache[currentUsername] || null;

    const nowyKomentarz: RecipeComment = {
      id: Date.now().toString(),
      username: currentUsername,
      avatarUrl: myAvatar,
      text: newCommentText.trim(),
      date: new Date().toISOString(),
      likes: 0
    };

    const noweKomentarze = [nowyKomentarz, ...comments];
    setComments(noweKomentarze);
    setNewCommentText("");
    setLastCommentTime(now);

    if (id) localStorage.setItem(`recipe_comments_${id}`, JSON.stringify(noweKomentarze));
  };

  const handleLikeComment = (commentId: string) => {
    if (!isLoggedIn) {
      alert("Zaloguj się, aby móc polubić komentarz.");
      return;
    }

    const isCommentLiked = userLikedComments.includes(commentId);
    let updatedUserLikes = [...userLikedComments];

    if (isCommentLiked) {
      updatedUserLikes = updatedUserLikes.filter(id => id !== commentId);
    } else {
      updatedUserLikes.push(commentId);
    }

    setUserLikedComments(updatedUserLikes);
    localStorage.setItem(`liked_comments_${currentUsername}`, JSON.stringify(updatedUserLikes));

    const updatedComments = comments.map(c => {
      if (c.id === commentId) return { ...c, likes: isCommentLiked ? c.likes - 1 : c.likes + 1 };
      return c;
    });

    setComments(updatedComments);
    if (id) localStorage.setItem(`recipe_comments_${id}`, JSON.stringify(updatedComments));
  };

  const handleDeleteComment = (commentId: string) => {
    if (!window.confirm("Czy na pewno chcesz usunąć ten komentarz?")) return;

    const updatedComments = comments.filter(c => c.id !== commentId);
    setComments(updatedComments);
    if (id) localStorage.setItem(`recipe_comments_${id}`, JSON.stringify(updatedComments));
  };

  const handleReportComment = () => {
    alert("Zgłoszenie zostało wysłane. Dziękujemy za dbanie o społeczność.");
  };

  const timeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Przed chwilą';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} min temu`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} godz. temu`;
    return `${Math.floor(diffInSeconds / 86400)} dni temu`;
  };

  const formatAmount = (amount: number, unit: string) => {
    const u = (unit || '').toLowerCase().trim();

    if (unitSystem === 'metric') {
      if (u === 'lb' || u === 'lbs' || u === 'pound' || u === 'pounds') {
        const grams = amount * 453.592;
        return grams >= 1000 ? `${(grams / 1000).toFixed(1)} kg` : `${Math.round(grams)} g`;
      }
      if (u === 'oz' || u === 'ounce' || u === 'ounces') return `${Math.round(amount * 28.3495)} g`;
      if (u === 'c') return `${amount} cup`;
      if (u === 't' || u === 'tsp') return `${amount} teaspoon(s)`;
      if (u === 'tbsp' || u === 'tablespoon' || u === 'tbs') return `${amount} tablespoon(s)`;
      if (u === 'szt') return `${amount} pcs`;

      return `${amount} ${unit}`;
    }

    if (u === 'g' || u === 'gram' || u === 'gramy') return `${(amount * 0.035274).toFixed(1)} oz`;
    if (u === 'ml' || u === 'mililitrów') return `${(amount * 0.033814).toFixed(1)} fl oz`;
    if (u === 'szt') return `${amount} pcs`;

    return `${amount} ${unit}`;
  };

  if (loading) return <div className="status-msg">Ładowanie przepisu...</div>;
  if (error || !recipe) return <div className="status-msg error">{error || 'Nie znaleziono przepisu.'}</div>;

  const totalGrams = (recipe.protein || 0) + (recipe.carbs || 0) + (recipe.fat || 0) || 1;
  const proteinPct = Math.round(((recipe.protein || 0) / totalGrams) * 100);
  const carbsPct = Math.round(((recipe.carbs || 0) / totalGrams) * 100);
  const fatPct = Math.round(((recipe.fat || 0) / totalGrams) * 100);

  const recipeImage = recipe.get_image || recipe.image_url;

  const authorName = recipe.author_username || '';
  const rawAuthorAvatar = (recipe as any).author_avatar || (recipe as any).author?.avatar || null;
  const authorAvatarUrl = (authorName && userAvatarsCache[authorName]) || getFullAvatarUrl(rawAuthorAvatar) || defaultAvatar;

  if (authorName && !userAvatarsCache[authorName]) {
    fetchAvatarForUser(authorName);
  }

  const modalSteps = (recipe.instructions || []).map((step, index) => {
    const isObject = typeof step === 'object' && step !== null;
    const stepText = isObject ? (step as any).text : step;
    return { title: `Krok ${index + 1}`, description: stepText };
  });

  const modalIngredients = (recipe.ingredients || []).map((item) => {
    const ingredientName = typeof item.ingredient === 'object' && item.ingredient !== null
      ? (item.ingredient as any).name
      : (item as any).ingredient_name || item.ingredient || 'Składnik';
    return { id: item.id, name: ingredientName, amount: formatAmount(item.amount, item.unit) };
  });

  return (
    <div className="recipe-page">
      <div className="recipe-container">

        <section className="hero-section">
          <div className="hero-left">
            <div className="tags-row">
              <span className="badge-green">100% CLEAN EATING</span>
              {ratingCount > 0 && (
                <span className="rating-badge">★ {averageRating} ({ratingCount})</span>
              )}
            </div>

            <h1 className="hero-title">{recipe.title}</h1>
            <p className="hero-description">{recipe.description}</p>

            <div className="meta-info-row">
              <div className="meta-item">
                <span className="meta-label">Created By</span>
                <Link
                  to={`/profile/${authorName}`}
                  className="author-box"
                  style={{ cursor: 'pointer', textDecoration: 'none' }}
                >
                  <div className="avatar" style={{ overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <img
                      src={authorAvatarUrl}
                      alt={authorName || 'Chef'}
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = defaultAvatar;
                      }}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>
                  <span className="meta-value" style={{ color: '#f3f4f6' }}>{authorName || 'Chef'}</span>
                </Link>
              </div>

              <div className="meta-item">
                <span className="meta-label">Time</span>
                <span className="meta-value">{recipe.prep_time} Mins</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Difficulty</span>
                <span className="meta-value">{recipe.difficulty || 'Medium'}</span>
              </div>
            </div>

            <div className="action-buttons-row" style={{ display: 'flex', alignItems: 'center', gap: '15px', flexWrap: 'wrap' }}>
              <button
                className="btn-primary-green primary-green"
                onClick={() => setIsCookingModeOpen(true)}
              >
                <span className="icon"><Icon.ChefHat size={18} /></span> Start Cooking
              </button>

              <button
                className="btn-icon"
                onClick={handleLikeClick}
                style={{ color: isLiked ? '#ef4444' : 'inherit' }}
              >
                <Icon.Heart
                  size={18}
                  fill={isLiked ? "#ef4444" : "none"}
                  color={isLiked ? "#ef4444" : "currentColor"}
                />
              </button>

              <div style={{ position: 'relative' }}>
                <button className="btn-icon" onClick={handleShare}>
                  <Icon.Share2 size={18} />
                </button>
                {shareTooltip && (
                  <span style={{
                    position: 'absolute', top: '-35px', left: '50%', transform: 'translateX(-50%)',
                    background: '#10b981', color: '#000', padding: '4px 10px',
                    borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', whiteSpace: 'nowrap',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.3)'
                  }}>
                    Skopiowano!
                  </span>
                )}
              </div>
            </div>

            <div className="rating-banner-container">
              <div className="rating-banner-left">
                <div className="rating-icon-circle">
                  <Icon.Star size={20} color="#10b981" />
                </div>
                <div className="rating-texts">
                  <h4>Rate this Recipe</h4>
                  <p>Have you tried this dish? Share your rating</p>
                </div>
              </div>
              <div className="rating-banner-right">
                <div className="stars-container">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Icon.Star
                      key={star}
                      size={20}
                      fill={star <= (hoveredStar !== null ? hoveredStar : (userRating || 0)) ? "#eab308" : "none"}
                      color={star <= (hoveredStar !== null ? hoveredStar : (userRating || 0)) ? "#eab308" : "#6b7280"}
                      onMouseEnter={() => setHoveredStar(star)}
                      onMouseLeave={() => setHoveredStar(null)}
                      onClick={() => handleRate(star)}
                      style={{
                        cursor: isLoggedIn ? 'pointer' : 'not-allowed',
                        transition: 'all 0.2s ease',
                        transform: hoveredStar === star ? 'scale(1.15)' : 'scale(1)',
                        opacity: !isLoggedIn && userRating === null ? 0.5 : 1
                      }}
                    />
                  ))}
                </div>
                <div className="tap-to-rate">
                  <span>TAP TO</span>
                  <span>RATE</span>
                </div>
              </div>
            </div>

          </div>

          <div className="hero-right">
            <div className="main-image-wrapper">
              {recipeImage ? (
                <img src={recipeImage} alt={recipe.title} />
              ) : (
                <div style={{ width: '100%', height: '300px', background: '#1c2420', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '16px', color: '#6b7280' }}>
                  Brak zdjęcia przepisu
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="nutrition-section">
          <div className="nutrition-header">
            <h2>Nutritional Profile</h2>
            <span className="target-aligned">Target Aligned</span>
          </div>
          <p className="subtext">Data below broken down per single serving</p>

          <div className="macro-cards-grid">
            <div className="macro-box">
              <Icon.Flame className="macro-icon primary-color" size={20} />
              <span className="macro-num">{recipe.calories}</span>
              <span className="macro-name">Calories</span>
            </div>
            <div className="macro-box">
              <Icon.Dumbbell className="macro-icon blue-color" size={20} />
              <span className="macro-num">{recipe.protein}g</span>
              <span className="macro-name">Protein</span>
            </div>
            <div className="macro-box">
              <Icon.Wheat className="macro-icon orange-color" size={20} />
              <span className="macro-num">{recipe.carbs}g</span>
              <span className="macro-name">Carbs</span>
            </div>
            <div className="macro-box">
              <Icon.Droplet className="macro-icon yellow-color" size={20} />
              <span className="macro-num">{recipe.fat}g</span>
              <span className="macro-name">Fats</span>
            </div>

            <div className="macro-box macro-chart">
              <div className="chart-container">
                <div className="bar-wrapper">
                  <div className="bar-track">
                    <span className="dot blue" style={{ height: `${proteinPct}%` }} title={`Białko: ${recipe.protein}g (${proteinPct}%)`} />
                  </div>
                  <span className="bar-label">PROT</span>
                </div>
                <div className="bar-wrapper">
                  <div className="bar-track">
                    <span className="dot orange" style={{ height: `${carbsPct}%` }} title={`Węglowodany: ${recipe.carbs}g (${carbsPct}%)`} />
                  </div>
                  <span className="bar-label">CARB</span>
                </div>
                <div className="bar-wrapper">
                  <div className="bar-track">
                    <span className="dot yellow" style={{ height: `${fatPct}%` }} title={`Tłuszcze: ${recipe.fat}g (${fatPct}%)`} />
                  </div>
                  <span className="bar-label">FAT</span>
                </div>
              </div>
            </div>

          </div>
        </section>

        <div className="recipe-content-layout">

          <section className="steps-column">
            <div className="steps-header">
              <h2>Cooking Steps</h2>
              <span className="estimated-time">ESTIMATED {recipe.prep_time} MINS ACTIVE</span>
            </div>

            <div className="steps-list">
              {recipe.instructions && recipe.instructions.length > 0 ? (
                recipe.instructions.map((step, index) => {
                  const isObject = typeof step === 'object' && step !== null;
                  const stepText = isObject ? (step as any).text : step;
                  const stepImage = isObject ? (step as any).image : null;

                  return (
                    <div key={index} className="step-card">
                      <div className="step-num-badge">
                        {String(index + 1).padStart(2, '0')}
                      </div>
                      <div className="step-content">
                        <h3>Step {index + 1}</h3>
                        <p>{stepText}</p>
                        {stepImage && (
                          <div className="step-image-container">
                            <img src={stepImage} alt={`Step ${index + 1}`} className="step-image" />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="no-steps-msg">Brak szczegółowych kroków dla tego przepisu.</p>
              )}
            </div>
          </section>

          <aside className="sidebar-column">

            <div className="allergen-card">
              <div className="allergen-title">
                <span className="red-dot"></span> ALLERGEN ALERT
              </div>
              <p>This recipe contains <strong>Soy, Gluten, and Shellfish</strong>. For a gluten-free alternative, replace soy sauce with Tamari and oyster sauce with vegan mushroom sauce.</p>
            </div>

            <div className="ingredients-card">
              <div className="ingredients-header">
                <h3>Ingredients</h3>
                <div className="toggle-group">
                  <div className={`toggle-slider ${unitSystem === 'us' ? 'is-us' : ''}`} />
                  <button className={`toggle-btn ${unitSystem === 'metric' ? 'active' : ''}`} onClick={() => setUnitSystem('metric')}>Metric</button>
                  <button className={`toggle-btn ${unitSystem === 'us' ? 'active' : ''}`} onClick={() => setUnitSystem('us')}>US</button>
                </div>
              </div>

              <ul className="ingredients-checklist">
                {recipe.ingredients && recipe.ingredients.length > 0 ? (
                  recipe.ingredients.map((item) => {
                    const ingredientName = typeof item.ingredient === 'object' && item.ingredient !== null
                      ? (item.ingredient as any).name
                      : (item as any).ingredient_name || item.ingredient || 'Składnik';

                    return (
                      <li key={item.id} className="checklist-item">
                        <label className="checkbox-container">
                          <input type="checkbox" />
                          <span className="custom-circle"></span>
                          <span className="ing-name">{ingredientName}</span>
                        </label>
                        <span key={unitSystem} className="ing-amount animate-fade">
                          {formatAmount(item.amount, item.unit)}
                        </span>
                      </li>
                    );
                  })
                ) : (
                  <p style={{ color: '#9ca3af', textAlign: 'center', padding: '1rem 0' }}>Brak składników.</p>
                )}
              </ul>

            </div>
          </aside>

        </div>

        <section className="community-section">
          <h2>Community <span className="badge-count">{comments.length} Reviews</span></h2>

          <div className="comment-input-box">
            <input
              type="text"
              placeholder={isLoggedIn ? "Dzień dobry..." : "Zaloguj się, aby dodać komentarz..."}
              value={newCommentText}
              onChange={(e) => setNewCommentText(e.target.value)}
              disabled={!isLoggedIn}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handlePostComment();
              }}
            />
            <button className="btn-post" onClick={handlePostComment} disabled={!isLoggedIn || !newCommentText.trim()}>
              Post
            </button>
          </div>

          <div className="comments-list">
            {comments.length === 0 ? (
              <p style={{ color: '#9ca3af', fontSize: '0.9rem', textAlign: 'center', margin: '20px 0' }}>
                Brak komentarzy. Bądź pierwszym, który oceni ten przepis!
              </p>
            ) : (
              comments.map((c) => {
                const isCommentLiked = userLikedComments.includes(c.id);
                const canDelete = isLoggedIn && (c.username === currentUsername || recipe.author_username === currentUsername);

                const commentAuthorAvatar = userAvatarsCache[c.username] || getFullAvatarUrl(c.avatarUrl) || defaultAvatar;
                if (c.username && !userAvatarsCache[c.username]) {
                  fetchAvatarForUser(c.username);
                }

                return (
                  <div className="comment-item" key={c.id}>
                    <Link to={`/profile/${c.username}`} className="comment-avatar-link" style={{ padding: 0, overflow: 'hidden' }}>
                      <img
                        src={commentAuthorAvatar}
                        alt={c.username}
                        className="comment-avatar-img"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = defaultAvatar;
                        }}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </Link>

                    <div className="comment-body" style={{ width: '100%' }}>
                      <div className="comment-author">
                        <Link to={`/profile/${c.username}`} className="comment-author-name">
                          <strong>{c.username}</strong>
                        </Link>
                        <span className="comment-time">{timeAgo(c.date)}</span>
                      </div>

                      <p style={{ marginTop: '8px', marginBottom: '8px' }}>{c.text}</p>

                      <div className="comment-actions">
                        <button
                          className={`btn-comment-action ${isCommentLiked ? 'liked' : ''}`}
                          onClick={() => handleLikeComment(c.id)}
                          disabled={!isLoggedIn}
                          title={!isLoggedIn ? "Zaloguj się, aby polubić" : ""}
                        >
                          <Icon.Heart size={14} fill={isCommentLiked ? "#ef4444" : "none"} color={isCommentLiked ? "#ef4444" : "currentColor"} />
                          {c.likes}
                        </button>

                        <button
                          className="btn-comment-action"
                          onClick={handleReportComment}
                          disabled={!isLoggedIn}
                          title={!isLoggedIn ? "Zaloguj się, aby zgłosić" : "Zgłoś komentarz"}
                        >
                          <Icon.Flag size={14} /> Zgłoś
                        </button>

                        {canDelete && (
                          <button
                            className="btn-comment-action delete"
                            onClick={() => handleDeleteComment(c.id)}
                            title="Usuń komentarz"
                          >
                            <Icon.Trash2 size={14} /> Usuń
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>

      </div>

      <CookingModeModal
        isOpen={isCookingModeOpen}
        onClose={() => setIsCookingModeOpen(false)}
        recipeId={recipe.id}
        recipeTitle={recipe.title}
        steps={modalSteps}
        ingredients={modalIngredients}
      />
    </div>
  );
};

export default RecipeDetail;