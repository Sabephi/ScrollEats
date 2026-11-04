import axios from 'axios';

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api/',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user_id');
      window.location.href = '/auth';
    }
    return Promise.reject(error);
  }
);

export interface Ingredient {
  id: number;
  name: string;
}

export interface RecipeIngredient {
  id?: number;
  ingredient?: number | Ingredient;
  ingredient_name?: string;
  amount: number;
  unit: string;
}

export interface StepItem {
  text: string;
  image?: string | null;
}

export interface Recipe {
  id?: number;
  title: string;
  description: string;
  prep_time: number;
  difficulty: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  image?: string | null;
  image_url?: string;
  get_image?: string;
  created_at?: string;
  ingredients?: RecipeIngredient[];
  instructions?: (string | StepItem)[];
  favorites?: number[];
  is_favorited?: boolean;
  author_username?: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export const fetchRecipes = async (page: number = 1): Promise<PaginatedResponse<Recipe>> => {
  const token = localStorage.getItem('access_token');
  const response = await api.get<PaginatedResponse<Recipe>>(`recipes/?page=${page}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });
  return response.data;
};

export const fetchRecipeById = async (id: string | number): Promise<Recipe> => {
  const token = localStorage.getItem('access_token');
  const response = await api.get<Recipe>(`recipes/${id}/`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });
  return response.data;
};

export const createRecipe = async (recipeData: any, imageFile?: File | null): Promise<Recipe> => {
  const token = localStorage.getItem('access_token');
  const formData = new FormData();

  Object.keys(recipeData).forEach((key) => {
    if (key === 'ingredients' || key === 'instructions') {
      formData.append(key, JSON.stringify(recipeData[key]));
    } else if (recipeData[key] !== undefined && recipeData[key] !== null) {
      formData.append(key, recipeData[key]);
    }
  });

  if (imageFile) {
    formData.append('image', imageFile);
  }

  const response = await api.post<Recipe>('recipes/', formData, {
    headers: { 
      Authorization: `Bearer ${token}`,
      'Content-Type': 'multipart/form-data',
    }
  });
  return response.data;
};

export const toggleFavorite = async (recipeId: number) => {
  const token = localStorage.getItem('access_token');
  const response = await api.post(`recipes/${recipeId}/toggle_favorite/`, {}, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const fetchFavorites = async (page: number = 1): Promise<PaginatedResponse<Recipe>> => {
  const token = localStorage.getItem('access_token');
  const response = await api.get<PaginatedResponse<Recipe>>(`recipes/my_favorites/?page=${page}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export default api;