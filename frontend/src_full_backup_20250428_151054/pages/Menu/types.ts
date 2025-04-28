import { IngredientRecord, IngredientCategoryRecord, SaladRecord, UserSaladRecord } from '../../pb/types';

// Re-exporting standardized types with shorter names for backwards compatibility
export type Ingredient = IngredientRecord;
export type IngredientCategory = IngredientCategoryRecord & { icon: React.ReactNode };
export type Salad = SaladRecord;
export type UserSalad = UserSaladRecord;

export interface Category {
  id: string;
  name: string;
  icon: string;
}

export interface NutritionFacts {
  protein: number;
  carbs: number;
  fats: number;
}

export interface SaladIngredient {
  id: string;
  quantity: number;
}

export interface CustomSalad {
  ingredients: Record<string, number>;
  name: string;
}

export interface SavedSalad {
  id: string;
  name: string;
  ingredients: Record<string, number>;
}

export interface SuggestedCombination {
  id: string;
  name: string;
  base: string[];
  protein: string[];
  toppings: string[];
  dressing: string[];
  extras: string[];
}

export type RecommendationType = 'balanced' | 'protein' | 'low-cal';

export interface SpeechSynthesisOptions {
  text: string;
  voice?: SpeechSynthesisVoice | null;
  rate?: number;
  pitch?: number;
  volume?: number;
}

export interface UseSpeechSynthesisResult {
  speak: (options: SpeechSynthesisOptions) => void;
  speaking: boolean;
  supported: boolean;
  voices: SpeechSynthesisVoice[];
  cancel: () => void;
  pause: () => void;
  resume: () => void;
}

export interface useSpeechSynthesis {
  (): UseSpeechSynthesisResult;
}

