import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit3, Flame, X, ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { fetchFavorites, type Recipe } from '../api';
import './MealPlan.css';

interface MealSlot {
  id: string;
  name: string;
  recipe: Recipe | null;
}

interface DayPlan {
  id: string;
  dayName: string;
  dateStr: string;
  fullDate: Date;
  meals: MealSlot[];
}

interface MacrosGoal {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

const DEFAULT_GOALS: MacrosGoal = { calories: 2200, protein: 180, carbs: 250, fats: 70 };

const getWeekDays = (baseDate: Date): DayPlan[] => {
  const curr = new Date(baseDate);
  const day = curr.getDay();
  const diffToMonday = curr.getDate() - day + (day === 0 ? -6 : 1);
  
  const monday = new Date(curr.setDate(diffToMonday));
  monday.setHours(0, 0, 0, 0);

  const days: DayPlan[] = [];
  const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  for (let i = 0; i < 7; i++) {
    const nextDay = new Date(monday);
    nextDay.setDate(monday.getDate() + i);

    const dateStr = nextDay.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    
    days.push({
      id: nextDay.toISOString().split('T')[0],
      dayName: dayNames[i],
      dateStr: dateStr,
      fullDate: nextDay,
      meals: [
        { id: 'm1', name: 'Breakfast', recipe: null },
        { id: 'm2', name: 'Lunch', recipe: null },
        { id: 'm3', name: 'Dinner', recipe: null }
      ]
    });
  }

  return days;
};

export const MealPlan: React.FC = () => {
  const navigate = useNavigate();

  const isLoggedIn = !!localStorage.getItem('access_token');
  const currentUsername = localStorage.getItem('username') || '';

  const [currentWeekBaseDate, setCurrentWeekBaseDate] = useState<Date>(new Date());
  const [weekPlan, setWeekPlan] = useState<DayPlan[]>([]);
  
  const [goals, setGoals] = useState<MacrosGoal>(DEFAULT_GOALS);
  const [activeDayIndex, setActiveDayIndex] = useState<number>(0);
  const [favorites, setFavorites] = useState<Recipe[]>([]);

  const [isGoalsModalOpen, setIsGoalsModalOpen] = useState(false);
  const [editGoalForm, setEditGoalForm] = useState<MacrosGoal>(DEFAULT_GOALS);
  const [recipeModalInfo, setRecipeModalInfo] = useState<{ dayIdx: number, mealIdx: number } | null>(null);
  const [nameModalInfo, setNameModalInfo] = useState<{ dayIdx: number, mealIdx: number, currentName: string } | null>(null);
  const [newMealName, setNewMealName] = useState("");

  useEffect(() => {
    const days = getWeekDays(currentWeekBaseDate);
    const mondayKey = days[0].id;

    if (isLoggedIn) {
      const savedGoals = localStorage.getItem(`mealPlan_goals_${currentUsername}`);
      if (savedGoals) setGoals(JSON.parse(savedGoals));

      const savedWeekPlan = localStorage.getItem(`mealPlan_data_${currentUsername}_${mondayKey}`);
      if (savedWeekPlan) {
        try {
          const parsed = JSON.parse(savedWeekPlan);
          const fixedDays = parsed.map((d: any) => ({
            ...d,
            fullDate: new Date(d.fullDate)
          }));
          setWeekPlan(fixedDays);
        } catch (e) {
          setWeekPlan(days);
        }
      } else {
        setWeekPlan(days);
      }
    } else {
      setWeekPlan(days);
    }
  }, [currentWeekBaseDate, isLoggedIn, currentUsername]);

  useEffect(() => {
    if (isLoggedIn && weekPlan.length > 0) {
      const mondayKey = weekPlan[0].id;
      localStorage.setItem(`mealPlan_data_${currentUsername}_${mondayKey}`, JSON.stringify(weekPlan));
    }
  }, [weekPlan, isLoggedIn, currentUsername]);

  useEffect(() => {
    if (!isLoggedIn) return;
    const loadFavorites = async () => {
      try {
        const data = await fetchFavorites(1);
        const arr = Array.isArray(data) ? data : (data.results || []);
        setFavorites(arr);
      } catch (err) {
        console.error("Błąd pobierania ulubionych", err);
      }
    };
    loadFavorites();
  }, [isLoggedIn]);

  if (!isLoggedIn) {
    return (
      <div className="planner-page planner-blocked">
        <h2>Dostęp zablokowany</h2>
        <p>Musisz być zalogowany, aby tworzyć swój własny plan posiłków.</p>
        <button className="btn-login-prompt" onClick={() => navigate('/auth')}>Zaloguj się</button>
      </div>
    );
  }

  const today = new Date();
  
  const minDate = new Date();
  minDate.setMonth(today.getMonth() - 1);

  const maxDate = new Date();
  maxDate.setMonth(today.getMonth() + 1);

  const handlePrevWeek = () => {
    const newDate = new Date(currentWeekBaseDate);
    newDate.setDate(newDate.getDate() - 7);
    if (newDate >= minDate) {
      setCurrentWeekBaseDate(newDate);
    }
  };

  const handleNextWeek = () => {
    const newDate = new Date(currentWeekBaseDate);
    newDate.setDate(newDate.getDate() + 7);
    if (newDate <= maxDate) {
      setCurrentWeekBaseDate(newDate);
    }
  };

  const handleResetToCurrentWeek = () => {
    setCurrentWeekBaseDate(new Date());
    setActiveDayIndex(0);
  };

  const canGoPrev = (() => {
    const testDate = new Date(currentWeekBaseDate);
    testDate.setDate(testDate.getDate() - 7);
    return testDate >= minDate;
  })();

  const canGoNext = (() => {
    const testDate = new Date(currentWeekBaseDate);
    testDate.setDate(testDate.getDate() + 7);
    return testDate <= maxDate;
  })();

  if (weekPlan.length === 0) return null;

  const startDateStr = weekPlan[0].dateStr;
  const endDateStr = weekPlan[6].dateStr;
  const yearStr = weekPlan[0].fullDate.getFullYear();

  const activeDay = weekPlan[activeDayIndex] || weekPlan[0];
  const dayMacros = activeDay.meals.reduce((acc, meal) => {
    if (meal.recipe) {
      acc.calories += meal.recipe.calories || 0;
      acc.protein += meal.recipe.protein || 0;
      acc.carbs += meal.recipe.carbs || 0;
      acc.fats += meal.recipe.fat || 0;
    }
    return acc;
  }, { calories: 0, protein: 0, carbs: 0, fats: 0 });

  const getPct = (current: number, goal: number) => Math.min(100, Math.round((current / (goal || 1)) * 100));

  const handleSaveGoals = (e: React.FormEvent) => {
    e.preventDefault();
    setGoals(editGoalForm);
    localStorage.setItem(`mealPlan_goals_${currentUsername}`, JSON.stringify(editGoalForm));
    setIsGoalsModalOpen(false);
  };

  const handleAddMealRow = (dayIdx: number) => {
    const updated = [...weekPlan];
    updated[dayIdx].meals.push({
      id: Date.now().toString(),
      name: 'Snack',
      recipe: null
    });
    setWeekPlan(updated);
  };

  const handleSaveMealName = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameModalInfo || !newMealName.trim()) return;
    const updated = [...weekPlan];
    updated[nameModalInfo.dayIdx].meals[nameModalInfo.mealIdx].name = newMealName;
    setWeekPlan(updated);
    setNameModalInfo(null);
  };

  const handleSelectRecipe = (recipe: Recipe) => {
    if (!recipeModalInfo) return;
    const updated = [...weekPlan];
    updated[recipeModalInfo.dayIdx].meals[recipeModalInfo.mealIdx].recipe = recipe;
    setWeekPlan(updated);
    setRecipeModalInfo(null);
  };

  const handleRemoveRecipe = (e: React.MouseEvent, dayIdx: number, mealIdx: number) => {
    e.stopPropagation();
    const updated = [...weekPlan];
    updated[dayIdx].meals[mealIdx].recipe = null;
    setWeekPlan(updated);
  };

  return (
    <div className="planner-page">
      <header className="planner-header">
        <div className="planner-title-section">
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '8px', flexWrap: 'wrap' }}>
            <h1>Weekly Plan</h1>
            <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', padding: '4px' }}>
              <button 
                onClick={handlePrevWeek} 
                disabled={!canGoPrev} 
                title="Poprzedni tydzień (maks. 1 miesiąc)" 
                style={{ background: 'transparent', border: 'none', color: canGoPrev ? 'white' : '#4b5563', cursor: canGoPrev ? 'pointer' : 'not-allowed', padding: '4px 8px', display: 'flex', alignItems: 'center' }}
              >
                <ChevronLeft size={16} /> Tydzień w tył
              </button>
              
              <button onClick={handleResetToCurrentWeek} title="Dzisiaj / Aktualny tydzień" style={{ background: 'rgba(16,185,129,0.2)', border: 'none', color: '#10b981', cursor: 'pointer', padding: '4px 10px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                Aktualny tydzień
              </button>
              
              <button 
                onClick={handleNextWeek} 
                disabled={!canGoNext} 
                title="Następny tydzień (maks. 1 miesiąc)" 
                style={{ background: 'transparent', border: 'none', color: canGoNext ? 'white' : '#4b5563', cursor: canGoNext ? 'pointer' : 'not-allowed', padding: '4px 8px', display: 'flex', alignItems: 'center' }}
              >
                Tydzień w przód <ChevronRight size={16} />
              </button>
            </div>
          </div>
          
          <div className="planner-dates">
            <CalendarIcon size={14} style={{ marginRight: '4px' }} />
            {startDateStr} - {endDateStr}, {yearStr} <span className="badge-active-week">ACTIVE WEEK</span>
            <button className="btn-set-goals" onClick={() => { setEditGoalForm(goals); setIsGoalsModalOpen(true); }}>
              Ustaw Cele
            </button>
          </div>
        </div>

        <div className="planner-goals-section">
          <div className="goal-track">
            <div className="goal-header">
              <span className="label">Calories</span>
              <span className="values">{dayMacros.calories}<span>/{goals.calories}</span></span>
            </div>
            <div className="bar-bg"><div className="bar-fill fill-cals" style={{ width: `${getPct(dayMacros.calories, goals.calories)}%` }}></div></div>
          </div>
          <div className="goal-track">
            <div className="goal-header">
              <span className="label">Protein</span>
              <span className="values">{dayMacros.protein}g<span>/{goals.protein}g</span></span>
            </div>
            <div className="bar-bg"><div className="bar-fill fill-prot" style={{ width: `${getPct(dayMacros.protein, goals.protein)}%` }}></div></div>
          </div>
          <div className="goal-track">
            <div className="goal-header">
              <span className="label">Carbs</span>
              <span className="values">{dayMacros.carbs}g<span>/{goals.carbs}g</span></span>
            </div>
            <div className="bar-bg"><div className="bar-fill fill-carbs" style={{ width: `${getPct(dayMacros.carbs, goals.carbs)}%` }}></div></div>
          </div>
          <div className="goal-track">
            <div className="goal-header">
              <span className="label">Fats</span>
              <span className="values">{dayMacros.fats}g<span>/{goals.fats}g</span></span>
            </div>
            <div className="bar-bg"><div className="bar-fill fill-fats" style={{ width: `${getPct(dayMacros.fats, goals.fats)}%` }}></div></div>
          </div>
        </div>
      </header>

      <div className="planner-grid">
        {weekPlan.map((day, dIdx) => (
          <div key={day.id} className={`day-column ${dIdx === activeDayIndex ? 'active' : ''}`}>
            
            <div className="day-header" onClick={() => setActiveDayIndex(dIdx)}>
              <h3>{day.dayName}</h3>
              <p>{day.dateStr}</p>
            </div>

            {day.meals.map((meal, mIdx) => (
              <div key={meal.id} className="meal-slot-container">
                <div className="meal-slot-header">
                  <span className="meal-name">{meal.name}</span>
                  <button 
                    className="btn-edit-meal"
                    onClick={() => {
                      setNewMealName(meal.name);
                      setNameModalInfo({ dayIdx: dIdx, mealIdx: mIdx, currentName: meal.name });
                    }}
                  >
                    <Edit3 size={12} />
                  </button>
                </div>

                {meal.recipe ? (
                  <div className="meal-card filled" onClick={() => setRecipeModalInfo({ dayIdx: dIdx, mealIdx: mIdx })}>
                    <button className="btn-remove-meal" onClick={(e) => handleRemoveRecipe(e, dIdx, mIdx)}>
                      <X size={14} />
                    </button>
                    <div className="filled-image-wrapper">
                      <img src={meal.recipe.get_image || meal.recipe.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80'} alt="Recipe" />
                    </div>
                    <div className="filled-info">
                      <p className="filled-title">{meal.recipe.title}</p>
                      <span className="filled-cals"><Flame size={12} /> {meal.recipe.calories || 0} kcal</span>
                    </div>
                  </div>
                ) : (
                  <div className="meal-card empty" onClick={() => setRecipeModalInfo({ dayIdx: dIdx, mealIdx: mIdx })}>
                    <div className="empty-icon-circle"><Plus size={16} /></div>
                    <p className="empty-text">PLAN {meal.name.toUpperCase()}</p>
                    <p className="empty-subtext">Add recipe</p>
                  </div>
                )}
              </div>
            ))}

            <button className="btn-add-meal-row" onClick={() => handleAddMealRow(dIdx)}>
              <Plus size={14} /> Add Meal
            </button>
          </div>
        ))}
      </div>

      {isGoalsModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Ustaw Cele Dzienne</h2>
            <form onSubmit={handleSaveGoals}>
              <div className="form-group">
                <label>Kalorie (kcal)</label>
                <input type="number" value={editGoalForm.calories} onChange={e => setEditGoalForm({...editGoalForm, calories: Number(e.target.value)})} />
              </div>
              <div className="form-group">
                <label>Białko (g)</label>
                <input type="number" value={editGoalForm.protein} onChange={e => setEditGoalForm({...editGoalForm, protein: Number(e.target.value)})} />
              </div>
              <div className="form-group">
                <label>Węglowodany (g)</label>
                <input type="number" value={editGoalForm.carbs} onChange={e => setEditGoalForm({...editGoalForm, carbs: Number(e.target.value)})} />
              </div>
              <div className="form-group">
                <label>Tłuszcze (g)</label>
                <input type="number" value={editGoalForm.fats} onChange={e => setEditGoalForm({...editGoalForm, fats: Number(e.target.value)})} />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setIsGoalsModalOpen(false)}>Anuluj</button>
                <button type="submit" className="btn-save">Zapisz</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {nameModalInfo && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '350px' }}>
            <h2>Zmień nazwę posiłku</h2>
            <form onSubmit={handleSaveMealName}>
              <div className="form-group">
                <label>Nowa nazwa (np. Lunch, Snack)</label>
                <input type="text" autoFocus value={newMealName} onChange={e => setNewMealName(e.target.value)} required />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setNameModalInfo(null)}>Anuluj</button>
                <button type="submit" className="btn-save">Zapisz</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {recipeModalInfo && (
        <div className="modal-overlay">
          <div className="modal-content large">
            <h2>Wybierz z ulubionych</h2>
            <p style={{ color: '#9ca3af', marginBottom: '10px' }}>Wybierz przepis, aby dodać go do planu.</p>
            
            {favorites.length === 0 ? (
              <p style={{ textAlign: 'center', padding: '30px' }}>Nie masz jeszcze polubionych przepisów.</p>
            ) : (
              <div className="recipe-select-grid">
                {favorites.map(recipe => (
                  <div 
                    key={recipe.id} 
                    className="meal-card filled" 
                    style={{ aspectRatio: '1/1', cursor: 'pointer' }}
                    onClick={() => handleSelectRecipe(recipe)}
                  >
                    <div className="filled-image-wrapper">
                      <img src={recipe.get_image || recipe.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80'} alt={recipe.title} />
                    </div>
                    <div className="filled-info">
                      <p className="filled-title">{recipe.title}</p>
                      <span className="filled-cals"><Flame size={12} /> {recipe.calories || 0} kcal</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setRecipeModalInfo(null)}>Zamknij</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default MealPlan;