export interface UserProfile {
  id: string
  name: string
  email: string
  age: number
  gender: 'male' | 'female'
  height: number // cm
  weight: number // kg
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active'
  goal: 'weight_loss' | 'maintenance' | 'muscle_gain'
  tdee: number
  targetCalories: number
  targetProtein: number
  targetFat: number
  targetCarbs: number
  createdAt: Date
  updatedAt: Date
}

export interface Food {
  id: string
  name: string
  brand?: string
  servingSize: number
  servingUnit: string
  calories: number
  protein: number
  fat: number
  carbs: number
  fiber: number
  sugar: number
  sodium: number
  category: string
  barcode?: string
}

export interface FoodLog {
  id: string
  userId: string
  foodId: string
  quantity: number
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack'
  loggedAt: Date
  food?: Food
}

export interface Exercise {
  id: string
  name: string
  category: 'strength' | 'cardio' | 'flexibility' | 'sports'
  muscleGroups: string[]
  equipment: string[]
  instructions: string[]
  difficulty: 'beginner' | 'intermediate' | 'advanced'
}

export interface WorkoutSet {
  id: string
  exerciseId: string
  reps: number
  weight?: number
  duration?: number // seconds
  distance?: number // meters
  restTime?: number // seconds
  rpe?: number // rate of perceived exertion 1-10
}

export interface WorkoutSession {
  id: string
  userId: string
  name: string
  startTime: Date
  endTime?: Date
  sets: WorkoutSet[]
  notes?: string
  totalVolume?: number
}

export interface ProgressEntry {
  id: string
  userId: string
  date: Date
  weight?: number
  bodyFat?: number
  measurements?: {
    chest?: number
    waist?: number
    hips?: number
    arms?: number
    thighs?: number
  }
  photos?: string[]
  notes?: string
}

export interface NutritionGoals {
  calories: number
  protein: number
  fat: number
  carbs: number
  fiber: number
  sugar: number
  sodium: number
}

export interface ActivityLevel {
  key: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active'
  label: string
  description: string
  multiplier: number
}

export interface Goal {
  key: 'weight_loss' | 'maintenance' | 'muscle_gain'
  label: string
  description: string
  calorieAdjustment: number // kcal/day
}
