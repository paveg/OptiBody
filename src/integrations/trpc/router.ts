import { TRPCError } from '@trpc/server'
import type { TRPCRouterRecord } from '@trpc/server'
import { z } from 'zod'

import { createTRPCRouter, publicProcedure } from './init'
import { MOCK_FOODS, MOCK_EXERCISES, MOCK_USER_PROFILE } from '../../data/mock-data'
import { calculateNutritionGoals, calculateDailyNutrition, calculateProgress } from '@/lib/calculations'
import type { UserProfile, FoodLog, WorkoutSession, ProgressEntry } from '../../types'

// Mock data storage (in real app, this would be a database)
let userProfiles: UserProfile[] = [MOCK_USER_PROFILE]
let foodLogs: FoodLog[] = []
let workoutSessions: WorkoutSession[] = []
let progressEntries: ProgressEntry[] = []

const userRouter = {
  getProfile: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const profile = userProfiles.find(p => p.id === input.id)
      if (!profile) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'User not found' })
      }
      return profile
    }),

  updateProfile: publicProcedure
    .input(z.object({
      id: z.string(),
      name: z.string().optional(),
      email: z.string().email().optional(),
      age: z.number().min(1).max(120).optional(),
      gender: z.enum(['male', 'female']).optional(),
      height: z.number().min(100).max(250).optional(),
      weight: z.number().min(30).max(300).optional(),
      activityLevel: z.enum(['sedentary', 'light', 'moderate', 'active', 'very_active']).optional(),
      goal: z.enum(['weight_loss', 'maintenance', 'muscle_gain']).optional(),
    }))
    .mutation(async ({ input }) => {
      const profileIndex = userProfiles.findIndex(p => p.id === input.id)
      if (profileIndex === -1) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'User not found' })
      }

      const updatedProfile = { ...userProfiles[profileIndex], ...input, updatedAt: new Date() }
      
      // Recalculate nutrition goals if relevant fields changed
      if (input.weight || input.height || input.age || input.gender || input.activityLevel || input.goal) {
        const nutritionGoals = calculateNutritionGoals(updatedProfile)
        updatedProfile.tdee = nutritionGoals.calories
        updatedProfile.targetCalories = nutritionGoals.calories
        updatedProfile.targetProtein = nutritionGoals.protein
        updatedProfile.targetFat = nutritionGoals.fat
        updatedProfile.targetCarbs = nutritionGoals.carbs
      }

      userProfiles[profileIndex] = updatedProfile
      return updatedProfile
    }),

  calculateTDEE: publicProcedure
    .input(z.object({
      weight: z.number(),
      height: z.number(),
      age: z.number(),
      gender: z.enum(['male', 'female']),
      activityLevel: z.enum(['sedentary', 'light', 'moderate', 'active', 'very_active']),
      goal: z.enum(['weight_loss', 'maintenance', 'muscle_gain']),
    }))
    .query(async ({ input }) => {
      return calculateNutritionGoals(input)
    }),
} satisfies TRPCRouterRecord

const foodRouter = {
  search: publicProcedure
    .input(z.object({
      query: z.string().min(1),
      category: z.string().optional(),
      limit: z.number().default(10),
    }))
    .query(async ({ input }) => {
      let foods = MOCK_FOODS
      
      if (input.category) {
        foods = foods.filter(food => food.category === input.category)
      }
      
      if (input.query) {
        const query = input.query.toLowerCase()
        foods = foods.filter(food => 
          food.name.toLowerCase().includes(query) ||
          food.brand?.toLowerCase().includes(query)
        )
      }
      
      return foods.slice(0, input.limit)
    }),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const food = MOCK_FOODS.find(f => f.id === input.id)
      if (!food) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Food not found' })
      }
      return food
    }),

  getCategories: publicProcedure
    .query(async () => {
      const categories = [...new Set(MOCK_FOODS.map(food => food.category))]
      return categories.sort()
    }),
} satisfies TRPCRouterRecord

const nutritionRouter = {
  logFood: publicProcedure
    .input(z.object({
      userId: z.string(),
      foodId: z.string(),
      quantity: z.number().min(0.1),
      mealType: z.enum(['breakfast', 'lunch', 'dinner', 'snack']),
    }))
    .mutation(async ({ input }) => {
      const food = MOCK_FOODS.find(f => f.id === input.foodId)
      if (!food) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Food not found' })
      }

      const foodLog: FoodLog = {
        id: Math.random().toString(36).substr(2, 9),
        userId: input.userId,
        foodId: input.foodId,
        quantity: input.quantity,
        mealType: input.mealType,
        loggedAt: new Date(),
        food,
      }

      foodLogs.push(foodLog)
      return foodLog
    }),

  getDailyLogs: publicProcedure
    .input(z.object({
      userId: z.string(),
      date: z.string().transform(str => new Date(str)),
    }))
    .query(async ({ input }) => {
      const startOfDay = new Date(input.date)
      startOfDay.setHours(0, 0, 0, 0)
      const endOfDay = new Date(input.date)
      endOfDay.setHours(23, 59, 59, 999)

      const logs = foodLogs.filter(log => 
        log.userId === input.userId &&
        log.loggedAt >= startOfDay &&
        log.loggedAt <= endOfDay
      )

      return logs.map(log => ({
        ...log,
        food: MOCK_FOODS.find(f => f.id === log.foodId)
      }))
    }),

  getDailyNutrition: publicProcedure
    .input(z.object({
      userId: z.string(),
      date: z.string().transform(str => new Date(str)),
    }))
    .query(async ({ input }) => {
      const startOfDay = new Date(input.date)
      startOfDay.setHours(0, 0, 0, 0)
      const endOfDay = new Date(input.date)
      endOfDay.setHours(23, 59, 59, 999)

      const logs = foodLogs.filter(log => 
        log.userId === input.userId &&
        log.loggedAt >= startOfDay &&
        log.loggedAt <= endOfDay
      ).map(log => ({
        quantity: log.quantity,
        food: MOCK_FOODS.find(f => f.id === log.foodId)!
      }))

      return calculateDailyNutrition(logs)
    }),

  deleteLog: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      const index = foodLogs.findIndex(log => log.id === input.id)
      if (index === -1) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Food log not found' })
      }
      foodLogs.splice(index, 1)
      return true
    }),
} satisfies TRPCRouterRecord

const exerciseRouter = {
  search: publicProcedure
    .input(z.object({
      query: z.string().optional(),
      category: z.enum(['strength', 'cardio', 'flexibility', 'sports']).optional(),
      muscleGroup: z.string().optional(),
      difficulty: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
      limit: z.number().default(20),
    }))
    .query(async ({ input }) => {
      let exercises = MOCK_EXERCISES

      if (input.category) {
        exercises = exercises.filter(ex => ex.category === input.category)
      }

      if (input.muscleGroup) {
        exercises = exercises.filter(ex => ex.muscleGroups.includes(input.muscleGroup!))
      }

      if (input.difficulty) {
        exercises = exercises.filter(ex => ex.difficulty === input.difficulty)
      }

      if (input.query) {
        const query = input.query.toLowerCase()
        exercises = exercises.filter(ex => 
          ex.name.toLowerCase().includes(query) ||
          ex.muscleGroups.some(mg => mg.toLowerCase().includes(query))
        )
      }

      return exercises.slice(0, input.limit)
    }),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const exercise = MOCK_EXERCISES.find(ex => ex.id === input.id)
      if (!exercise) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Exercise not found' })
      }
      return exercise
    }),
} satisfies TRPCRouterRecord

const workoutRouter = {
  startSession: publicProcedure
    .input(z.object({
      userId: z.string(),
      name: z.string(),
    }))
    .mutation(async ({ input }) => {
      const session: WorkoutSession = {
        id: Math.random().toString(36).substr(2, 9),
        userId: input.userId,
        name: input.name,
        startTime: new Date(),
        sets: [],
      }

      workoutSessions.push(session)
      return session
    }),

  addSet: publicProcedure
    .input(z.object({
      sessionId: z.string(),
      exerciseId: z.string(),
      reps: z.number().min(1),
      weight: z.number().optional(),
      duration: z.number().optional(),
      distance: z.number().optional(),
      restTime: z.number().optional(),
      rpe: z.number().min(1).max(10).optional(),
    }))
    .mutation(async ({ input }) => {
      const session = workoutSessions.find(s => s.id === input.sessionId)
      if (!session) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Workout session not found' })
      }

      const set = {
        id: Math.random().toString(36).substr(2, 9),
        exerciseId: input.exerciseId,
        reps: input.reps,
        weight: input.weight,
        duration: input.duration,
        distance: input.distance,
        restTime: input.restTime,
        rpe: input.rpe,
      }

      session.sets.push(set)
      return set
    }),

  finishSession: publicProcedure
    .input(z.object({
      sessionId: z.string(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const session = workoutSessions.find(s => s.id === input.sessionId)
      if (!session) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Workout session not found' })
      }

      session.endTime = new Date()
      session.notes = input.notes
      
      // Calculate total volume
      session.totalVolume = session.sets.reduce((total, set) => {
        return total + (set.reps * (set.weight || 0))
      }, 0)

      return session
    }),

  getSessions: publicProcedure
    .input(z.object({
      userId: z.string(),
      limit: z.number().default(10),
    }))
    .query(async ({ input }) => {
      return workoutSessions
        .filter(session => session.userId === input.userId)
        .sort((a, b) => b.startTime.getTime() - a.startTime.getTime())
        .slice(0, input.limit)
    }),
} satisfies TRPCRouterRecord

const progressRouter = {
  addEntry: publicProcedure
    .input(z.object({
      userId: z.string(),
      weight: z.number().optional(),
      bodyFat: z.number().optional(),
      measurements: z.object({
        chest: z.number().optional(),
        waist: z.number().optional(),
        hips: z.number().optional(),
        arms: z.number().optional(),
        thighs: z.number().optional(),
      }).optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const entry: ProgressEntry = {
        id: Math.random().toString(36).substr(2, 9),
        userId: input.userId,
        date: new Date(),
        weight: input.weight,
        bodyFat: input.bodyFat,
        measurements: input.measurements,
        notes: input.notes,
      }

      progressEntries.push(entry)
      return entry
    }),

  getEntries: publicProcedure
    .input(z.object({
      userId: z.string(),
      limit: z.number().default(30),
    }))
    .query(async ({ input }) => {
      return progressEntries
        .filter(entry => entry.userId === input.userId)
        .sort((a, b) => b.date.getTime() - a.date.getTime())
        .slice(0, input.limit)
    }),

  getLatest: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ input }) => {
      const entries = progressEntries
        .filter(entry => entry.userId === input.userId)
        .sort((a, b) => b.date.getTime() - a.date.getTime())
      
      return entries[0] || null
    }),
} satisfies TRPCRouterRecord

export const trpcRouter = createTRPCRouter({
  user: userRouter,
  food: foodRouter,
  nutrition: nutritionRouter,
  exercise: exerciseRouter,
  workout: workoutRouter,
  progress: progressRouter,
})

export type TRPCRouter = typeof trpcRouter
