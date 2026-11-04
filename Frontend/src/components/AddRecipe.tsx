import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, X, Camera, Image as ImageIcon, Clock } from 'lucide-react';
import { createRecipe, type RecipeIngredient } from '../api';
import './AddRecipe.css';

export const AddRecipe: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isAuthenticated, setIsAuthenticated] = useState(true);

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    prep_time: 0,
    difficulty: 'beginner',
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
  });

  const [ingredients, setIngredients] = useState<RecipeIngredient[]>([
    { ingredient_name: '', amount: 1, unit: 'szt' },
    { ingredient_name: '', amount: 1, unit: 'szt' },
  ]);


  const [instructions, setInstructions] = useState<{ text: string; image: string; file?: File; preview?: string }>([
    { text: '', image: '' },
  ]);

  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    setIsAuthenticated(!!token);
  }, []);

  const handleFileSelect = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleStepFileSelect = (index: number, file: File) => {
    if (file && file.type.startsWith('image/')) {
      const updated = [...instructions];
      updated[index].file = file;
      updated[index].preview = URL.createObjectURL(file);
      setInstructions(updated);
    }
  };

  const handleStepDrop = (index: number, e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleStepFileSelect(index, e.dataTransfer.files[0]);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleIngredientChange = (
    index: number,
    field: keyof RecipeIngredient,
    value: any
  ) => {
    const updated = [...ingredients];
    updated[index] = { ...updated[index], [field]: value } as RecipeIngredient;
    setIngredients(updated);
  };

  const addIngredient = () => {
    setIngredients([...ingredients, { ingredient_name: '', amount: 1, unit: 'szt' }]);
  };

  const removeIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const handleInstructionChange = (index: number, field: 'text' | 'image', value: string) => {
    const updated = [...instructions];
    updated[index][field] = value;
    setInstructions(updated);
  };

  const addInstruction = () => {
    setInstructions([...instructions, { text: '', image: '' }]);
  };

  const removeInstruction = (index: number) => {
    setInstructions(instructions.filter((_, i) => i !== index));
  };

  const toggleCategory = (cat: string) => {
    setCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) return;

    setLoading(true);
    setError(null);

    const formattedInstructions = instructions
      .filter((step) => step.text.trim() !== '')
      .map((step) => ({
        text: step.text.trim(),
        image: step.preview || step.image.trim() || null,
      }));

    const formattedIngredients = ingredients
      .filter((ing) => (ing.ingredient_name || '').trim() !== '')
      .map((ing) => ({
        name: ing.ingredient_name,
        ingredient_name: ing.ingredient_name,
        amount: ing.amount,
        unit: ing.unit,
      }));

    const payload = {
      ...formData,
      prep_time: Number(formData.prep_time),
      calories: Number(formData.calories),
      protein: Number(formData.protein),
      carbs: Number(formData.carbs),
      fat: Number(formData.fat),
      ingredients: formattedIngredients,
      instructions: formattedInstructions,
    };

    try {
      const created = await createRecipe(payload, imageFile);
      navigate(`/recipes/${created.id}`);
    } catch (err: any) {
      console.error(err);
      setError('Błąd podczas zapisywania przepisu. Upewnij się, że jesteś zalogowany.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-recipe-page">
      <header className="page-header">
        <h1>Create New Recipe</h1>
        <p>Share your culinary masterpiece with the ScrollEats community.</p>
      </header>

      {error && <div className="error-banner">{error}</div>}

      <form onSubmit={handleSubmit} className="create-recipe-grid">
        <div className="left-column">
          <div
            className="card cover-upload-card"
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => document.getElementById('cover-file-input')?.click()}
            style={{ cursor: 'pointer', position: 'relative' }}
          >
            <input
              id="cover-file-input"
              type="file"
              accept="image/png, image/jpeg, image/jpg"
              style={{ display: 'none' }}
              onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
            />

            {imagePreview ? (
              <div style={{ width: '100%', height: '200px', overflow: 'hidden', borderRadius: '12px' }}>
                <img
                  src={imagePreview}
                  alt="Cover Preview"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
            ) : (
              <>
                <Camera className="upload-icon" size={32} />
                <p className="upload-title">Drag & drop cover photo or click to browse</p>
                <p className="upload-subtitle">SUPPORTS JPG, PNG (MAX 10MB)</p>
              </>
            )}
          </div>

          <div className="card form-details-card">
            <div className="form-group">
              <label>RECIPE TITLE</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="e.g. Seared Scallops with Emerald Pea Puree"
                required
              />
            </div>

            <div className="form-group">
              <label>SHORT DESCRIPTION</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                placeholder="Describe the flavor profile and inspiration..."
              />
            </div>

            <div className="form-row-2">
              <div className="form-group">
                <label>PREP TIME (MIN)</label>
                <div className="input-with-icon">
                  <Clock size={16} className="input-icon" />
                  <input
                    type="number"
                    name="prep_time"
                    value={formData.prep_time}
                    onChange={handleInputChange}
                    min={1}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>DIFFICULTY</label>
                <select
                  name="difficulty"
                  value={formData.difficulty}
                  onChange={handleInputChange}
                >
                  <option value="beginner">Beginner</option>
                  <option value="medium">Medium</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
            </div>
          </div>

          <div className="section-header-row">
            <h2>Cooking Steps</h2>
            <button type="button" className="btn-add-step" onClick={addInstruction}>
              <Plus size={16} /> Add Step
            </button>
          </div>

          <div className="steps-container">
            {instructions.map((step, idx) => (
              <div key={idx} className="card step-input-card">
                <div className="step-card-header">
                  <div className="step-number-circle">{idx + 1}</div>
                  <textarea
                    placeholder="Explain this step in detail..."
                    value={step.text}
                    onChange={(e) => handleInstructionChange(idx, 'text', e.target.value)}
                    rows={2}
                    required
                  />
                  {instructions.length > 1 && (
                    <button
                      type="button"
                      className="btn-remove-step"
                      onClick={() => removeInstruction(idx)}
                    >
                      <X size={18} />
                    </button>
                  )}
                </div>

                <div
                  className="step-image-upload"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => handleStepDrop(idx, e)}
                  onClick={() => document.getElementById(`step-file-input-${idx}`)?.click()}
                  style={{ cursor: 'pointer', position: 'relative', marginTop: '10px' }}
                >
                  <input
                    id={`step-file-input-${idx}`}
                    type="file"
                    accept="image/png, image/jpeg, image/jpg"
                    style={{ display: 'none' }}
                    onChange={(e) => e.target.files?.[0] && handleStepFileSelect(idx, e.target.files[0])}
                  />

                  {step.preview ? (
                    <div style={{ width: '100%', height: '120px', overflow: 'hidden', borderRadius: '8px' }}>
                      <img
                        src={step.preview}
                        alt={`Step ${idx + 1} preview`}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#1c211f', padding: '8px 12px', borderRadius: '8px', border: '1px solid #37413b' }}>
                      <ImageIcon size={18} color="#8e9b94" />
                      <input
                        type="url"
                        placeholder="Image URL or click/drag to upload step photo"
                        value={step.image}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => handleInstructionChange(idx, 'image', e.target.value)}
                        style={{ background: 'transparent', border: 'none', color: '#fff', width: '100%', outline: 'none' }}
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="right-column">
          <div className="macros-grid">
            <div className="macro-card calories">
              <div className="macro-label">CALORIES</div>
              <div className="macro-value-row">
                <input
                  type="number"
                  name="calories"
                  value={formData.calories}
                  onChange={handleInputChange}
                  min={0}
                />
                <span className="macro-unit">kcal</span>
              </div>
            </div>

            <div className="macro-card protein">
              <div className="macro-label">PROTEIN</div>
              <div className="macro-value-row">
                <input
                  type="number"
                  name="protein"
                  value={formData.protein}
                  onChange={handleInputChange}
                  min={0}
                />
                <span className="macro-unit">g</span>
              </div>
            </div>

            <div className="macro-card carbs">
              <div className="macro-label">CARBS</div>
              <div className="macro-value-row">
                <input
                  type="number"
                  name="carbs"
                  value={formData.carbs}
                  onChange={handleInputChange}
                  min={0}
                />
                <span className="macro-unit">g</span>
              </div>
            </div>

            <div className="macro-card fat">
              <div className="macro-label">FAT</div>
              <div className="macro-value-row">
                <input
                  type="number"
                  name="fat"
                  value={formData.fat}
                  onChange={handleInputChange}
                  min={0}
                />
                <span className="macro-unit">g</span>
              </div>
            </div>
          </div>

          <div className="card ingredients-card">
            <div className="ingredients-card-header">
              <h3>Ingredients</h3>
              <button type="button" className="btn-circle-add" onClick={addIngredient}>
                <Plus size={16} />
              </button>
            </div>

            <div className="ingredients-inputs-list">
              {ingredients.map((ing, idx) => (
                <div key={idx} className="ingredient-input-row" style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                  <input
                    type="text"
                    className="ing-name"
                    placeholder="e.g. Fresh Cilantro"
                    value={ing.ingredient_name}
                    onChange={(e) => handleIngredientChange(idx, 'ingredient_name', e.target.value)}
                    style={{ flex: 1 }}
                  />
                  <input
                    type="number"
                    className="ing-amount"
                    placeholder="Qty"
                    value={ing.amount}
                    min={0}
                    step="0.1"
                    onChange={(e) => handleIngredientChange(idx, 'amount', parseFloat(e.target.value) || 0)}
                    style={{ width: '70px', padding: '0.75rem', borderRadius: '8px', border: '1px solid #37413b', background: '#1c211f', color: '#fff' }}
                  />
                  <input
                    type="text"
                    className="ing-unit"
                    placeholder="Unit"
                    value={ing.unit}
                    onChange={(e) => handleIngredientChange(idx, 'unit', e.target.value)}
                    style={{ width: '90px', padding: '0.75rem', borderRadius: '8px', border: '1px solid #37413b', background: '#1c211f', color: '#fff' }}
                  />
                  <button
                    type="button"
                    className="btn-remove-ing"
                    onClick={() => removeIngredient(idx)}
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="card categories-card">
            <div className="cat-section">
              <label className="cat-section-title">CATEGORIES</label>
              <div className="tags-container">
                {['Athletes', 'Vegan', 'Desserts', 'Quick & Easy'].map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    className={`tag-chip ${categories.includes(cat) ? 'active' : ''}`}
                    onClick={() => toggleCategory(cat)}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="cat-section">
              <label className="cat-section-title">ALLERGENS</label>
              <div className="allergens-grid">
                {['Gluten-free', 'Dairy-free', 'Nut-free', 'Soy-free'].map((allergen) => (
                  <label key={allergen} className="custom-checkbox-label">
                    <input type="checkbox" className="custom-checkbox-input" />
                    <span className="custom-checkbox-circle"></span>
                    <span className="checkbox-text">{allergen}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {!isAuthenticated && (
            <div style={{ color: '#ef4444', marginBottom: '10px', fontSize: '14px', textAlign: 'center' }}>
              Zaloguj się, aby móc opublikować przepis.
            </div>
          )}

          <button
            type="submit"
            className="btn-publish"
            disabled={loading || !isAuthenticated}
            style={{ opacity: isAuthenticated ? 1 : 0.5, cursor: isAuthenticated ? 'pointer' : 'not-allowed' }}
          >
            {loading ? 'PUBLISHING...' : 'PUBLISH RECIPE'}
          </button>

          <button type="button" className="btn-draft" onClick={() => navigate('/')}>
            Save as Draft
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddRecipe;