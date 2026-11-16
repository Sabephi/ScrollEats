import React, { useState, useEffect } from 'react';
import { RotateCcw } from 'lucide-react';
import './FiltersSidebar.css';

interface FiltersState {
  sortBy: string;
  caloriesMin: number;
  caloriesMax: number;
  proteinMin: number;
  proteinMax: number;
  carbsMin: number;
  carbsMax: number;
  fatMin: number;
  fatMax: number;
  prepTime: string;
  difficulty: string[];
  ratings: number | null;
  mealType: string[];
  cuisine: string[];
  categories: string[];
  allergens: string[];
}

interface FiltersSidebarProps {
  filters: FiltersState;
  onApply: (newFilters: FiltersState) => void;
  onReset: () => void;
  activeCount: number;
}

export const FiltersSidebar: React.FC<FiltersSidebarProps> = ({
  filters,
  onApply,
  onReset,
  activeCount,
}) => {
  const [draftFilters, setDraftFilters] = useState<FiltersState>(filters);

  useEffect(() => {
    setDraftFilters(filters);
  }, [filters]);

  const toggleArrayFilter = (field: keyof FiltersState, value: string) => {
    setDraftFilters((prev) => {
      const list = prev[field] as string[];
      return {
        ...prev,
        [field]: list.includes(value) ? list.filter((item) => item !== value) : [...list, value],
      };
    });
  };

  return (
    <aside className="filters-sidebar card">
      <div className="filters-header">
        <h3>Filters & Sort</h3>
        <button className="btn-reset" onClick={onReset}>
          <RotateCcw size={14} /> Reset
        </button>
      </div>

      <div className="filter-section">
        <label className="filter-title">SORT BY</label>
        <div className="filter-chips-grid">
          {['Popular', 'Newest', 'Highest Rated', 'Quickest'].map((sort) => (
            <button
              key={sort}
              type="button"
              className={`tag-chip ${draftFilters.sortBy === sort ? 'active' : ''}`}
              onClick={() => setDraftFilters((prev) => ({ ...prev, sortBy: sort }))}
            >
              {sort}
            </button>
          ))}
        </div>
      </div>

      <div className="filter-section">
        <div className="filter-title-row">
          <label className="filter-title">MACRONUTRIENTS & CALORIES</label>
          <span className="filter-range-val">RANGE (MIN - MAX)</span>
        </div>

        <div className="range-group">
          <div className="range-label-row">
            <span>Calories</span>
            <span>{draftFilters.caloriesMin} - {draftFilters.caloriesMax} kcal</span>
          </div>
          <div className="double-range-inputs">
            <input
              type="range"
              min="0"
              max="1000"
              step="50"
              value={draftFilters.caloriesMin}
              onChange={(e) => setDraftFilters(prev => ({ ...prev, caloriesMin: Math.min(Number(e.target.value), prev.caloriesMax) }))}
            />
            <input
              type="range"
              min="0"
              max="1000"
              step="50"
              value={draftFilters.caloriesMax}
              onChange={(e) => setDraftFilters(prev => ({ ...prev, caloriesMax: Math.max(Number(e.target.value), prev.caloriesMin) }))}
            />
          </div>
        </div>

        <div className="range-group">
          <div className="range-label-row">
            <span>Protein</span>
            <span>{draftFilters.proteinMin}g - {draftFilters.proteinMax}g</span>
          </div>
          <div className="double-range-inputs">
            <input
              type="range"
              min="0"
              max="100"
              value={draftFilters.proteinMin}
              onChange={(e) => setDraftFilters(prev => ({ ...prev, proteinMin: Math.min(Number(e.target.value), prev.proteinMax) }))}
            />
            <input
              type="range"
              min="0"
              max="100"
              value={draftFilters.proteinMax}
              onChange={(e) => setDraftFilters(prev => ({ ...prev, proteinMax: Math.max(Number(e.target.value), prev.proteinMin) }))}
            />
          </div>
        </div>

        <div className="range-group">
          <div className="range-label-row">
            <span>Carbs</span>
            <span>{draftFilters.carbsMin}g - {draftFilters.carbsMax}g</span>
          </div>
          <div className="double-range-inputs">
            <input
              type="range"
              min="0"
              max="150"
              value={draftFilters.carbsMin}
              onChange={(e) => setDraftFilters(prev => ({ ...prev, carbsMin: Math.min(Number(e.target.value), prev.carbsMax) }))}
            />
            <input
              type="range"
              min="0"
              max="150"
              value={draftFilters.carbsMax}
              onChange={(e) => setDraftFilters(prev => ({ ...prev, carbsMax: Math.max(Number(e.target.value), prev.carbsMin) }))}
            />
          </div>
        </div>

        <div className="range-group">
          <div className="range-label-row">
            <span>Fat</span>
            <span>{draftFilters.fatMin}g - {draftFilters.fatMax}g</span>
          </div>
          <div className="double-range-inputs">
            <input
              type="range"
              min="0"
              max="100"
              value={draftFilters.fatMin}
              onChange={(e) => setDraftFilters(prev => ({ ...prev, fatMin: Math.min(Number(e.target.value), prev.fatMax) }))}
            />
            <input
              type="range"
              min="0"
              max="100"
              value={draftFilters.fatMax}
              onChange={(e) => setDraftFilters(prev => ({ ...prev, fatMax: Math.max(Number(e.target.value), prev.fatMin) }))}
            />
          </div>
        </div>
      </div>

      <div className="filter-section">
        <label className="filter-title">PREP TIME</label>
        <div className="filter-chips-grid">
          {['< 15 min', '< 30 min', '45+ min'].map((time) => (
            <button
              key={time}
              type="button"
              className={`tag-chip ${draftFilters.prepTime === time ? 'active' : ''}`}
              onClick={() => setDraftFilters((prev) => ({ ...prev, prepTime: prev.prepTime === time ? '' : time }))}
            >
              {time}
            </button>
          ))}
        </div>
      </div>

      <div className="filter-section">
        <label className="filter-title">DIFFICULTY</label>
        <div className="filter-chips-grid">
          {['Easy', 'Medium', 'Chef Level'].map((diff) => (
            <button
              key={diff}
              type="button"
              className={`tag-chip ${draftFilters.difficulty.includes(diff) ? 'active' : ''}`}
              onClick={() => toggleArrayFilter('difficulty', diff)}
            >
              {diff}
            </button>
          ))}
        </div>
      </div>

      <div className="filter-section">
        <label className="filter-title">MEAL TYPE</label>
        <div className="filter-chips-grid">
          {['Breakfast', 'Lunch', 'Dinner', 'Snack', 'Dessert', 'Drink'].map((type) => (
            <button
              key={type}
              type="button"
              className={`tag-chip ${draftFilters.mealType.includes(type) ? 'active' : ''}`}
              onClick={() => toggleArrayFilter('mealType', type)}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      <div className="filter-section">
        <label className="filter-title">CUISINE</label>
        <div className="filter-chips-grid">
          {['Mediterranean', 'Italian', 'Mexican', 'American', 'French', 'Japanese', 'Chinese', 'Thai', 'Korean', 'Indian', 'Middle Eastern', 'Eastern European'].map((cuisine) => (
            <button
              key={cuisine}
              type="button"
              className={`tag-chip ${draftFilters.cuisine.includes(cuisine) ? 'active' : ''}`}
              onClick={() => toggleArrayFilter('cuisine', cuisine)}
            >
              {cuisine}
            </button>
          ))}
        </div>
      </div>

      <div className="filter-section">
        <label className="filter-title">CATEGORIES</label>
        <div className="filter-chips-grid">
          {['Athletes', 'Vegan', 'Quick & Easy'].map((cat) => (
            <button
              key={cat}
              type="button"
              className={`tag-chip ${draftFilters.categories.includes(cat) ? 'active' : ''}`}
              onClick={() => toggleArrayFilter('categories', cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="filter-section">
        <label className="filter-title">ALLERGENS</label>
        <div className="filter-chips-grid">
          {['Gluten-free', 'Dairy-free', 'Nut-free', 'Soy-free'].map((allergen) => (
            <button
              key={allergen}
              type="button"
              className={`tag-chip ${draftFilters.allergens.includes(allergen) ? 'active' : ''}`}
              onClick={() => toggleArrayFilter('allergens', allergen)}
            >
              {allergen}
            </button>
          ))}
        </div>
      </div>

      <button className="btn-apply-filters" onClick={() => onApply(draftFilters)}>
        Apply Filters ({activeCount} Active)
      </button>
    </aside>
  );
};