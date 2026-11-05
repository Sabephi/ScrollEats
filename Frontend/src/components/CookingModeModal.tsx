import React, { useState, useEffect } from 'react';
import { X, Clock, Play, Pause, ArrowLeft, ArrowRight, Check, RotateCcw } from 'lucide-react';
import './CookingModeModal.css';

export interface CookingStep {
  title: string;
  description: string;
}

export interface CookingIngredient {
  id: number | string;
  name: string;
  amount: string;
}

interface CookingModeModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipeTitle: string;
  steps: CookingStep[];
  ingredients: CookingIngredient[];
}

export const CookingModeModal: React.FC<CookingModeModalProps> = ({
  isOpen,
  onClose,
  recipeTitle,
  steps,
  ingredients
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [checkedIngredients, setCheckedIngredients] = useState<Set<number | string>>(new Set());
  
  const [timeLeft, setTimeLeft] = useState(300); // domyślnie 5 minut w sekundach
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  
  // Stany do edycji czasu
  const [isEditingTime, setIsEditingTime] = useState(false);
  const [editTimeValue, setEditTimeValue] = useState("");

  // Obsługa stopera
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft <= 0) {
      setIsTimerRunning(false);
      setTimeLeft(0);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timeLeft]);

  if (!isOpen || steps.length === 0) return null;

  const currentStep = steps[currentStepIndex];
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === steps.length - 1;

  const toggleIngredient = (id: number | string) => {
    const newChecked = new Set(checkedIngredients);
    if (newChecked.has(id)) {
      newChecked.delete(id);
    } else {
      newChecked.add(id);
    }
    setCheckedIngredients(newChecked);
  };

  const handleNext = () => {
    if (!isLastStep) setCurrentStepIndex(prev => prev + 1);
  };

  const handlePrev = () => {
    if (!isFirstStep) setCurrentStepIndex(prev => prev - 1);
  };

  const resetTimer = () => {
    setIsTimerRunning(false);
    setTimeLeft(0); // Zeruje stoper
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Zatwierdzenie nowo wpisanego czasu
  const handleTimeSubmit = () => {
    let newSeconds = 0;
    const value = editTimeValue.trim();
    
    // Obsługa formatu "MM:SS" lub samych minut "MM"
    if (value.includes(':')) {
      const [m, s] = value.split(':');
      newSeconds = (parseInt(m) || 0) * 60 + (parseInt(s) || 0);
    } else {
      // Zakładamy, że podano same minuty (np. wpisanie "5" da 5 minut)
      newSeconds = (parseInt(value) || 0) * 60;
    }

    setTimeLeft(newSeconds);
    setIsEditingTime(false);
  };

  return (
    <div className="cooking-modal-overlay">
      <div className="cooking-modal-content">
        <button className="cooking-close-btn" onClick={onClose}>
          <X size={20} />
        </button>

        {/* Sekcja postępu (Progress Bar) */}
        <div className="cooking-progress-container">
          <div className="cooking-steps-labels">
            {steps.map((step, idx) => {
              const isActive = idx === currentStepIndex;
              const isCompleted = idx < currentStepIndex;
              return (
                <span 
                  key={idx} 
                  className={`step-label ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
                >
                  {`${(idx + 1).toString().padStart(2, '0')} ${step.title.substring(0, 20)}`}
                </span>
              );
            })}
          </div>
          <div className="cooking-progress-bar">
            {steps.map((_, idx) => (
              <div 
                key={idx} 
                className={`progress-segment ${idx === currentStepIndex ? 'active' : ''} ${idx < currentStepIndex ? 'completed' : ''}`}
              />
            ))}
          </div>
        </div>

        {/* Główna treść modalu */}
        <div className="cooking-main-body">
          {/* Lewa kolumna: Opis kroku */}
          <div className="cooking-instructions">
            <h2>{currentStep.title}</h2>
            <p>{currentStep.description}</p>
          </div>

          {/* Prawa kolumna: Składniki z nowym formatowaniem (max-height) */}
          <div className="cooking-ingredients-box">
            <div className="ingredients-header">
              <h3>Potrzebne składniki</h3>
              <span className="ingredients-count">{ingredients.length} items</span>
            </div>
            
            <div className="ingredients-list">
              {ingredients.map((ing) => {
                const isChecked = checkedIngredients.has(ing.id);
                return (
                  <div key={ing.id} className="ingredient-item" onClick={() => toggleIngredient(ing.id)}>
                    <div className={`ingredient-checkbox ${isChecked ? 'checked' : ''}`}>
                      {isChecked && <Check size={12} color="white" />}
                    </div>
                    <span className={`ingredient-name ${isChecked ? 'checked' : ''}`}>
                      {ing.name}
                    </span>
                    <span className="ingredient-amount">{ing.amount}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Stopka: Nawigacja i Stoper */}
        <div className="cooking-footer">
          <button className="btn-nav btn-prev" onClick={handlePrev} disabled={isFirstStep}>
            <ArrowLeft size={18} /> Poprzedni krok
          </button>

          <div className="cooking-timer">
            <div className="timer-display">
              <Clock size={16} /> TIMER
              
              {/* Obsługa wpisywania czasu z klawiatury */}
              {isEditingTime ? (
                <input 
                  type="text"
                  autoFocus
                  className="timer-input"
                  value={editTimeValue}
                  onChange={(e) => setEditTimeValue(e.target.value)}
                  onBlur={handleTimeSubmit}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleTimeSubmit();
                  }}
                  placeholder="00:00"
                />
              ) : (
                <span 
                  className="timer-clickable-text"
                  onClick={() => {
                    if (!isTimerRunning) {
                      setEditTimeValue(formatTime(timeLeft));
                      setIsEditingTime(true);
                    }
                  }}
                  title={!isTimerRunning ? "Kliknij, aby wpisać własny czas" : ""}
                >
                  {formatTime(timeLeft)}
                </span>
              )}
            </div>
            <button 
              className="btn-timer-action" 
              onClick={() => setIsTimerRunning(!isTimerRunning)}
            >
              {isTimerRunning ? <Pause size={14} /> : <Play size={14} fill="#000" />} 
              {isTimerRunning ? 'Pause' : 'Start'}
            </button>
            <button className="btn-timer-reset" onClick={resetTimer} title="Wyzeruj stoper">
              <RotateCcw size={14} /> Reset
            </button>
          </div>

          <button 
            className="btn-nav btn-next" 
            onClick={isLastStep ? onClose : handleNext}
          >
            {isLastStep ? 'Zakończ gotowanie' : `Następny krok`}
            {!isLastStep && <ArrowRight size={18} />}
          </button>
        </div>
      </div>
    </div>
  );
};