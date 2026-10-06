import axios from 'axios';

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api/',
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface Ingredient {
  id: number;
  name: string;
}

export interface RecipeIngredient {
  id: number;
  ingredient: Ingredient;
  amount: number;
  unit: string;
}

export interface Recipe {
  id: number;
  title: string;
  description: string;
  prep_time: number;
  difficulty: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  created_at: string;
  ingredients?: RecipeIngredient[];
  instructions?: string[];
}

export const getRecipes = async (): Promise<Recipe[]> => {
  const response = await api.get<Recipe[]>('recipes/');
  return response.data;
};

export const fetchRecipeById = async (id: string): Promise<Recipe> => {
  const response = await api.get<Recipe>(`recipes/${id}/`);
  return response.data;
};

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export const fetchRecipes = async (page: number = 1): Promise<PaginatedResponse<Recipe>> => {
  const response = await fetch(`http://127.0.0.1:8000/api/recipes/?page=${page}`);
  if (!response.ok) {
    throw new Error('Nie udało się pobrać przepisów');
  }
  return response.json();
};

export default api;