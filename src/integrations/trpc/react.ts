import type { UserProfile, WorkoutSession, ProgressEntry } from '../../types'

// Simple mock client for development
export const useTRPC = () => ({
  user: {
    getProfile: {
      useQuery: (_params: { id: string }) => ({
        data: {
          id: '1',
          name: 'Demo User',
          email: 'demo@optibody.com',
          age: 30,
          gender: 'male' as const,
          height: 175,
          weight: 75,
          activityLevel: 'moderate' as const,
          goal: 'muscle_gain' as const,
          tdee: 2340,
          targetCalories: 2640,
          targetProtein: 150,
          targetFat: 73,
          targetCarbs: 330,
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date(),
        } as UserProfile,
        isLoading: false,
        error: null,
      }),
    },
  },
  nutrition: {
    getDailyNutrition: {
      useQuery: (_params: { userId: string; date: string }) => ({
        data: {
          calories: 0,
          protein: 0,
          fat: 0,
          carbs: 0,
          fiber: 0,
          sugar: 0,
          sodium: 0,
        },
        isLoading: false,
        error: null,
      }),
    },
  },
  workout: {
    getSessions: {
      useQuery: (_params: { userId: string; limit: number }) => ({
        data: [] as WorkoutSession[],
        isLoading: false,
        error: null,
      }),
    },
  },
  progress: {
    getLatest: {
      useQuery: (_params: { userId: string }) => ({
        data: null as ProgressEntry | null,
        isLoading: false,
        error: null,
      }),
    },
  },
})
