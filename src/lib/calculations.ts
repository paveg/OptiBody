import { ACTIVITY_LEVELS, GOALS, MACRO_RATIOS } from './constants'
import type { UserProfile, NutritionGoals } from '../types'

/**
 * Calculate Basal Metabolic Rate using Mifflin-St Jeor Equation
 * Men: BMR = 10 × weight(kg) + 6.25 × height(cm) - 5 × age(years) + 5
 * Women: BMR = 10 × weight(kg) + 6.25 × height(cm) - 5 × age(years) - 161
 */
export function calculateBMR(weight: number, height: number, age: number, gender: 'male' | 'female'): number {
  const baseBMR = 10 * weight + 6.25 * height - 5 * age
  return gender === 'male' ? baseBMR + 5 : baseBMR - 161
}

/**
 * Calculate Total Daily Energy Expenditure
 * TDEE = BMR × Activity Factor
 */
export function calculateTDEE(bmr: number, activityLevel: string): number {
  const activity = ACTIVITY_LEVELS.find(level => level.key === activityLevel)
  if (!activity) {
    throw new Error(`Invalid activity level: ${activityLevel}`)
  }
  return Math.round(bmr * activity.multiplier)
}

/**
 * Calculate target calories based on goal
 */
export function calculateTargetCalories(tdee: number, goal: string): number {
  const goalConfig = GOALS.find(g => g.key === goal)
  if (!goalConfig) {
    throw new Error(`Invalid goal: ${goal}`)
  }
  return Math.max(1200, tdee + goalConfig.calorieAdjustment) // Minimum 1200 calories
}

/**
 * Calculate macro targets based on body weight and target calories
 */
export function calculateMacroTargets(
  weight: number,
  targetCalories: number,
  proteinRatio: number = MACRO_RATIOS.DEFAULT_PROTEIN_RATIO,
  fatPercentage: number = MACRO_RATIOS.DEFAULT_FAT_PERCENTAGE
): { protein: number; fat: number; carbs: number } {
  // Protein: g/kg body weight
  const protein = Math.round(weight * proteinRatio)
  
  // Fat: percentage of total calories
  const fatCalories = targetCalories * fatPercentage
  const fat = Math.round(fatCalories / MACRO_RATIOS.FAT_CALORIES)
  
  // Carbs: remaining calories
  const proteinCalories = protein * MACRO_RATIOS.PROTEIN_CALORIES
  const remainingCalories = targetCalories - proteinCalories - fatCalories
  const carbs = Math.round(remainingCalories / MACRO_RATIOS.CARB_CALORIES)
  
  return { protein, fat, carbs }
}

/**
 * Calculate complete nutrition goals for a user profile
 */
export function calculateNutritionGoals(profile: Partial<UserProfile>): NutritionGoals {
  if (!profile.weight || !profile.height || !profile.age || !profile.gender || !profile.activityLevel || !profile.goal) {
    throw new Error('Missing required profile data for nutrition calculation')
  }

  const bmr = calculateBMR(profile.weight, profile.height, profile.age, profile.gender)
  const tdee = calculateTDEE(bmr, profile.activityLevel)
  const targetCalories = calculateTargetCalories(tdee, profile.goal)
  const macros = calculateMacroTargets(profile.weight, targetCalories)

  return {
    calories: targetCalories,
    protein: macros.protein,
    fat: macros.fat,
    carbs: macros.carbs,
    fiber: Math.round(targetCalories / 1000 * 14), // 14g per 1000 calories
    sugar: Math.round(targetCalories * 0.10 / 4), // Max 10% of calories from added sugar
    sodium: 2300, // mg per day (recommended limit)
  }
}

/**
 * Calculate macro percentages for display
 */
export function calculateMacroPercentages(protein: number, fat: number, carbs: number) {
  const totalCalories = protein * MACRO_RATIOS.PROTEIN_CALORIES + 
                       fat * MACRO_RATIOS.FAT_CALORIES + 
                       carbs * MACRO_RATIOS.CARB_CALORIES

  return {
    proteinPercent: Math.round((protein * MACRO_RATIOS.PROTEIN_CALORIES / totalCalories) * 100),
    fatPercent: Math.round((fat * MACRO_RATIOS.FAT_CALORIES / totalCalories) * 100),
    carbPercent: Math.round((carbs * MACRO_RATIOS.CARB_CALORIES / totalCalories) * 100),
  }
}

/**
 * Calculate daily nutrition totals from food logs
 */
export function calculateDailyNutrition(foodLogs: Array<{
  quantity: number
  food: {
    calories: number
    protein: number
    fat: number
    carbs: number
    fiber: number
    sugar: number
    sodium: number
  }
}>) {
  return foodLogs.reduce(
    (totals, log) => {
      const multiplier = log.quantity
      return {
        calories: totals.calories + log.food.calories * multiplier,
        protein: totals.protein + log.food.protein * multiplier,
        fat: totals.fat + log.food.fat * multiplier,
        carbs: totals.carbs + log.food.carbs * multiplier,
        fiber: totals.fiber + log.food.fiber * multiplier,
        sugar: totals.sugar + log.food.sugar * multiplier,
        sodium: totals.sodium + log.food.sodium * multiplier,
      }
    },
    { calories: 0, protein: 0, fat: 0, carbs: 0, fiber: 0, sugar: 0, sodium: 0 }
  )
}

/**
 * Calculate workout volume (sets × reps × weight)
 */
export function calculateWorkoutVolume(sets: Array<{ reps: number; weight?: number }>) {
  return sets.reduce((total, set) => {
    return total + (set.reps * (set.weight || 0))
  }, 0)
}

/**
 * Calculate progress percentage toward goals
 */
export function calculateProgress(current: number, target: number): number {
  if (target === 0) return 0
  return Math.min(100, Math.round((current / target) * 100))
}

/**
 * Estimate body fat percentage using Navy Method (approximation)
 * This is a simplified version for demo purposes
 */
export function estimateBodyFat(
  gender: 'male' | 'female',
  height: number, // cm
  waist: number, // cm
  neck: number, // cm
  hip?: number // cm (required for females)
): number {
  if (gender === 'female' && !hip) {
    throw new Error('Hip measurement required for female body fat calculation')
  }

  // Convert to inches for Navy formula
  const heightIn = height / 2.54
  const waistIn = waist / 2.54
  const neckIn = neck / 2.54
  const hipIn = hip ? hip / 2.54 : 0

  let bodyFat: number

  if (gender === 'male') {
    bodyFat = 86.010 * Math.log10(waistIn - neckIn) - 70.041 * Math.log10(heightIn) + 36.76
  } else {
    bodyFat = 163.205 * Math.log10(waistIn + hipIn - neckIn) - 97.684 * Math.log10(heightIn) - 78.387
  }

  return Math.max(0, Math.min(50, Math.round(bodyFat * 10) / 10))
}
