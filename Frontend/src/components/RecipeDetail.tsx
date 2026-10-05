import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchRecipeById, type Recipe } from '../api';
import './RecipeDetail.css';
import * as Icon from 'lucide-react';

export const RecipeDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [unitSystem, setUnitSystem] = useState<'metric' | 'us'>('metric');

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

  const formatAmount = (amount: number, unit: string) => {
    if (unitSystem === 'metric') return `${amount} ${unit}`;

    const u = (unit || '').toLowerCase().trim();
    if (u === 'g' || u === 'gram' || u === 'gramy') {
      return `${(amount * 0.035274).toFixed(1)} oz`;
    }
    if (u === 'ml' || u === 'mililitrów') {
      return `${(amount * 0.033814).toFixed(1)} fl oz`;
    }
    return `${amount} ${unit}`;
  };

  if (loading) return <div className="status-msg">Ładowanie przepisu...</div>;
  if (error || !recipe) return <div className="status-msg error">{error || 'Nie znaleziono przepisu.'}</div>;

  const totalGrams = (recipe.protein || 0) + (recipe.carbs || 0) + (recipe.fat || 0) || 1;

  const proteinPct = Math.round(((recipe.protein || 0) / totalGrams) * 100);
  const carbsPct = Math.round(((recipe.carbs || 0) / totalGrams) * 100);
  const fatPct = Math.round(((recipe.fat || 0) / totalGrams) * 100);

  return (
    <div className="recipe-page">
      <div className="recipe-container">

        <section className="hero-section">
          <div className="hero-left">
            <div className="tags-row">
              <span className="badge-green">100% CLEAN EATING</span>
              <span className="rating-badge">★ 4.9 (128)</span>
            </div>

            <h1 className="hero-title">{recipe.title}</h1>
            <p className="hero-description">{recipe.description}</p>

            <div className="meta-info-row">
              <div className="meta-item">
                <span className="meta-label">Created By</span>
                <div className="author-box">
                  <div className="avatar">👤</div>
                  <span className="meta-value">Chef Gordon</span>
                </div>
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

            <div className="action-buttons-row">
              <button className="btn-primary-green primary-green">
                <span className="icon"><Icon.ChefHat size={18} /></span> Start Cooking
              </button>
              <button className="btn-icon"><Icon.Heart size={18} /></button>
              <button className="btn-icon"><Icon.Share2 size={18} /></button>
            </div>
          </div>

          <div className="hero-right">
            <div className="main-image-wrapper">
              <img 
                src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1000&q=80" 
                alt={recipe.title} 
              />
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
                    <span 
                      className="dot blue" 
                      style={{ height: `${proteinPct}%` }} 
                      title={`Białko: ${recipe.protein}g (${proteinPct}%)`}
                    />
                  </div>
                  <span className="bar-label">PROT</span>
                </div>

                <div className="bar-wrapper">
                  <div className="bar-track">
                    <span 
                      className="dot orange" 
                      style={{ height: `${carbsPct}%` }} 
                      title={`Węglowodany: ${recipe.carbs}g (${carbsPct}%)`}
                    />
                  </div>
                  <span className="bar-label">CARB</span>
                </div>

                <div className="bar-wrapper">
                  <div className="bar-track">
                    <span 
                      className="dot yellow" 
                      style={{ height: `${fatPct}%` }} 
                      title={`Tłuszcze: ${recipe.fat}g (${fatPct}%)`}
                    />
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
              <span className="estimated-time">ESTIMATED 25 MINS ACTIVE</span>
            </div>

            <div className="steps-list">
              <div className="step-card">
                <div className="step-num-badge">01</div>
                <div className="step-content">
                  <h3>Prep the Aromatics</h3>
                  <p>Finely chop the garlic and bird's eye chillies. Slice the chicken into bite-sized pieces. Pluck the holy basil leaves from the stems, discarding the tough woody parts.</p>
                  <div className="step-image">
                    <img src="https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=600&q=80" alt="Prep" />
                  </div>
                </div>
              </div>

              <div className="step-card">
                <div className="step-num-badge">02</div>
                <div className="step-content">
                  <h3>Sizzle the Base</h3>
                  <p>Heat high-smoke palm oil in a wok over intense heat. Add the aromatics. Stir-fry for 20-30 seconds until the aroma fills the room but before the garlic browns.</p>
                </div>
              </div>

              <div className="step-card">
                <div className="step-num-badge">03</div>
                <div className="step-content">
                  <h3>Caramelize the Protein</h3>
                  <p>Add chicken. Spread it out to max-time contact. Let it sear for 1 minute before tossing. Continue until edges are crisp and center is cooked through.</p>
                  <div className="step-image">
                    <img src="https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=600&q=80" alt="Cooking" />
                  </div>
                </div>
              </div>
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

                  <button 
                    className={`toggle-btn ${unitSystem === 'metric' ? 'active' : ''}`}
                    onClick={() => setUnitSystem('metric')}
                  >
                    Metric
                  </button>
                  <button 
                    className={`toggle-btn ${unitSystem === 'us' ? 'active' : ''}`}
                    onClick={() => setUnitSystem('us')}
                  >
                    US
                  </button>
                </div>
              </div>

              <ul className="ingredients-checklist">
                {recipe.ingredients && recipe.ingredients.length > 0 ? (
                  recipe.ingredients.map((item) => {
                    const ingredientName = typeof item.ingredient === 'object' && item.ingredient !== null 
                      ? item.ingredient.name 
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
                  <>
                    <li className="checklist-item">
                      <label className="checkbox-container">
                        <input type="checkbox" defaultChecked />
                        <span className="custom-circle"></span>
                        <span className="ing-name">Chicken Breast</span>
                      </label>
                      <span className="ing-amount">{formatAmount(300, 'g')}</span>
                    </li>
                    <li className="checklist-item">
                      <label className="checkbox-container">
                        <input type="checkbox" />
                        <span className="custom-circle"></span>
                        <span className="ing-name">Garlic Cloves</span>
                      </label>
                      <span className="ing-amount">{formatAmount(5, 'units')}</span>
                    </li>
                    <li className="checklist-item">
                      <label className="checkbox-container">
                        <input type="checkbox" />
                        <span className="custom-circle"></span>
                        <span className="ing-name">Bird's Eye Chillies</span>
                      </label>
                      <span className="ing-amount">{formatAmount(4, 'units')}</span>
                    </li>
                    <li className="checklist-item">
                      <label className="checkbox-container">
                        <input type="checkbox" />
                        <span className="custom-circle"></span>
                        <span className="ing-name">Holy Basil Leaves</span>
                      </label>
                      <span className="ing-amount">{formatAmount(1, 'cup')}</span>
                    </li>
                  </>
                )}
              </ul>

              <button className="btn-export-list">
                <Icon.ShoppingBag size={18} /> Export to List
              </button>
            </div>

          </aside>

        </div>

        <section className="community-section">
          <h2>Community <span className="badge-count">24 Reviews</span></h2>

          <div className="comment-input-box">
            <input type="text" placeholder="Share your experience..." />
            <button className="btn-post">Post</button>
          </div>

          <div className="comments-list">
            <div className="comment-item">
              <div className="avatar">SJ</div>
              <div className="comment-body">
                <div className="comment-author">
                  <strong>Sam Jenkins</strong>
                  <span className="comment-time">2 days ago</span>
                </div>
                <p>Absolutely loved it! I swapped out Thai Basil as it was out of stock locally. Cut the technique of flash frying garlic first, absolute game changer! 🔥</p>
                <div className="comment-actions">
                  <span>♥ 142</span>
                  <span>Reply</span>
                </div>
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
};