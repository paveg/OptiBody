import type { ActivityLevel, Goal } from '../types'

export const ACTIVITY_LEVELS: ActivityLevel[] = [
  {
    key: 'sedentary',
    label: 'Sedentary',
    description: 'Little or no exercise',
    multiplier: 1.2,
  },
  {
    key: 'light',
    label: 'Lightly Active',
    description: 'Light exercise/sports 1-3 days/week',
    multiplier: 1.375,
  },
  {
    key: 'moderate',
    label: 'Moderately Active',
    description: 'Moderate exercise/sports 3-5 days/week',
    multiplier: 1.55,
  },
  {
    key: 'active',
    label: 'Very Active',
    description: 'Hard exercise/sports 6-7 days a week',
    multiplier: 1.725,
  },
  {
    key: 'very_active',
    label: 'Extra Active',
    description: 'Very hard exercise & physical job or 2x training',
    multiplier: 1.9,
  },
]

export const GOALS: Goal[] = [
  {
    key: 'weight_loss',
    label: 'Weight Loss',
    description: 'Lose 0.5-1kg per week',
    calorieAdjustment: -500,
  },
  {
    key: 'maintenance',
    label: 'Maintenance',
    description: 'Maintain current weight',
    calorieAdjustment: 0,
  },
  {
    key: 'muscle_gain',
    label: 'Muscle Gain',
    description: 'Gain 0.25-0.5kg per week',
    calorieAdjustment: 300,
  },
]

export const MACRO_RATIOS = {
  // Protein per kg of body weight
  PROTEIN_MIN: 1.6,
  PROTEIN_MAX: 2.2,
  
  // Fat percentage of total calories
  FAT_MIN: 0.20,
  FAT_MAX: 0.35,
  
  // Calories per gram
  PROTEIN_CALORIES: 4,
  CARB_CALORIES: 4,
  FAT_CALORIES: 9,
  
  // Default protein intake (g/kg body weight)
  DEFAULT_PROTEIN_RATIO: 2.0,
  
  // Default fat percentage of total calories
  DEFAULT_FAT_PERCENTAGE: 0.25,
}

export const MEAL_TYPES = [
  { key: 'breakfast', label: 'Breakfast' },
  { key: 'lunch', label: 'Lunch' },
  { key: 'dinner', label: 'Dinner' },
  { key: 'snack', label: 'Snack' },
] as const

export const EXERCISE_CATEGORIES = [
  { key: 'strength', label: 'Strength Training' },
  { key: 'cardio', label: 'Cardiovascular' },
  { key: 'flexibility', label: 'Flexibility' },
  { key: 'sports', label: 'Sports' },
] as const

export const MUSCLE_GROUPS = [
  'Chest',
  'Back',
  'Shoulders',
  'Arms',
  'Legs',
  'Glutes',
  'Core',
  'Calves',
  'Forearms',
] as const

export const EQUIPMENT_TYPES = [
  'Barbell',
  'Dumbbell',
  'Machine',
  'Cable',
  'Bodyweight',
  'Resistance Band',
  'Kettlebell',
  'Medicine Ball',
  'None',
] as const

export const FOOD_CATEGORIES = [
  'Protein',
  'Grains',
  'Vegetables',
  'Fruits',
  'Dairy',
  'Fats & Oils',
  'Snacks',
  'Beverages',
  'Condiments',
  'Supplements',
] as const
