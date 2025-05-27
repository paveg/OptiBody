import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from './ui/badge'
import { Progress } from './ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { Button } from './ui/button'
import { useTRPC } from '../integrations/trpc/react'
import { calculateProgress, calculateMacroPercentages } from '@/lib/calculations'
import { Activity, Target, Utensils, Dumbbell, TrendingUp } from 'lucide-react'

interface DashboardProps {
  userId: string
}

export const Dashboard = ({ userId }: DashboardProps) => {
  const [selectedDate] = useState(new Date().toISOString().split('T')[0])
  const trpc = useTRPC()
  
  const { data: profile } = trpc.user.getProfile.useQuery({ id: userId })
  const { data: dailyNutrition } = trpc.nutrition.getDailyNutrition.useQuery({
    userId,
    date: selectedDate,
  })
  const { data: recentWorkouts } = trpc.workout.getSessions.useQuery({
    userId,
    limit: 5,
  })
  const { data: latestProgress } = trpc.progress.getLatest.useQuery({ userId })

  if (!profile) {
    return <div>Loading...</div>
  }

  const macroPercentages = calculateMacroPercentages(
    profile.targetProtein,
    profile.targetFat,
    profile.targetCarbs
  )

  const calorieProgress = dailyNutrition 
    ? calculateProgress(dailyNutrition.calories, profile.targetCalories)
    : 0

  const proteinProgress = dailyNutrition 
    ? calculateProgress(dailyNutrition.protein, profile.targetProtein)
    : 0

  const fatProgress = dailyNutrition 
    ? calculateProgress(dailyNutrition.fat, profile.targetFat)
    : 0

  const carbProgress = dailyNutrition 
    ? calculateProgress(dailyNutrition.carbs, profile.targetCarbs)
    : 0

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Welcome back, {profile.name}!</h1>
          <p className="text-gray-600 mt-1">Track your fitness journey and reach your goals</p>
        </div>
        <Badge variant="secondary" className="text-sm">
          Goal: {profile.goal.replace('_', ' ').charAt(0).toUpperCase() + profile.goal.replace('_', ' ').slice(1)}
        </Badge>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Target Calories</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{profile.targetCalories}</div>
            <p className="text-xs text-muted-foreground">
              TDEE: {profile.tdee} kcal
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Calories</CardTitle>
            <Utensils className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dailyNutrition?.calories || 0}
            </div>
            <Progress value={calorieProgress} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {calorieProgress}% of goal
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Weight</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {latestProgress?.weight || profile.weight} kg
            </div>
            <p className="text-xs text-muted-foreground">
              Height: {profile.height} cm
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Activity Level</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">
              {profile.activityLevel.replace('_', ' ')}
            </div>
            <p className="text-xs text-muted-foreground">
              Recent workouts: {recentWorkouts?.length || 0}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="nutrition" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="nutrition">Nutrition</TabsTrigger>
          <TabsTrigger value="workouts">Workouts</TabsTrigger>
          <TabsTrigger value="progress">Progress</TabsTrigger>
          <TabsTrigger value="plan">AI Coach</TabsTrigger>
        </TabsList>

        <TabsContent value="nutrition" className="space-y-6">
          {/* Macro Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Today's Macros</CardTitle>
                <CardDescription>Track your protein, fat, and carb intake</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Protein</span>
                    <span>{dailyNutrition?.protein || 0}g / {profile.targetProtein}g</span>
                  </div>
                  <Progress value={proteinProgress} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Fat</span>
                    <span>{dailyNutrition?.fat || 0}g / {profile.targetFat}g</span>
                  </div>
                  <Progress value={fatProgress} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Carbs</span>
                    <span>{dailyNutrition?.carbs || 0}g / {profile.targetCarbs}g</span>
                  </div>
                  <Progress value={carbProgress} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Macro Distribution</CardTitle>
                <CardDescription>Your target macro breakdown</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-blue-600">
                      {macroPercentages.proteinPercent}%
                    </div>
                    <div className="text-sm text-gray-600">Protein</div>
                    <div className="text-xs text-gray-500">{profile.targetProtein}g</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">
                      {macroPercentages.fatPercent}%
                    </div>
                    <div className="text-sm text-gray-600">Fat</div>
                    <div className="text-xs text-gray-500">{profile.targetFat}g</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-orange-600">
                      {macroPercentages.carbPercent}%
                    </div>
                    <div className="text-sm text-gray-600">Carbs</div>
                    <div className="text-xs text-gray-500">{profile.targetCarbs}g</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Log food or view detailed nutrition tracking</CardDescription>
            </CardHeader>
            <CardContent className="flex gap-4">
              <Button>Log Food</Button>
              <Button variant="outline">View Food Diary</Button>
              <Button variant="outline">Meal Suggestions</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="workouts" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Workouts</CardTitle>
                <CardDescription>Your latest training sessions</CardDescription>
              </CardHeader>
              <CardContent>
                {recentWorkouts && recentWorkouts.length > 0 ? (
                  <div className="space-y-3">
                    {recentWorkouts.map((workout) => (
                      <div key={workout.id} className="flex justify-between items-center p-3 border rounded">
                        <div>
                          <div className="font-medium">{workout.name}</div>
                          <div className="text-sm text-gray-600">
                            {new Date(workout.startTime).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">{workout.sets.length} exercises</div>
                          <div className="text-sm text-gray-600">
                            {workout.totalVolume ? `${workout.totalVolume}kg total` : ''}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600">No workouts recorded yet. Start your first session!</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Workout Actions</CardTitle>
                <CardDescription>Start a new session or browse exercises</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button className="w-full">
                  <Dumbbell className="mr-2 h-4 w-4" />
                  Start Workout
                </Button>
                <Button variant="outline" className="w-full">Browse Exercises</Button>
                <Button variant="outline" className="w-full">Workout Templates</Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="progress" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Progress Tracking</CardTitle>
              <CardDescription>Monitor your body composition and measurements</CardDescription>
            </CardHeader>
            <CardContent>
              {latestProgress ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {latestProgress.weight && (
                    <div className="text-center">
                      <div className="text-2xl font-bold">{latestProgress.weight}kg</div>
                      <div className="text-sm text-gray-600">Weight</div>
                    </div>
                  )}
                  {latestProgress.bodyFat && (
                    <div className="text-center">
                      <div className="text-2xl font-bold">{latestProgress.bodyFat}%</div>
                      <div className="text-sm text-gray-600">Body Fat</div>
                    </div>
                  )}
                  {latestProgress.measurements?.waist && (
                    <div className="text-center">
                      <div className="text-2xl font-bold">{latestProgress.measurements.waist}cm</div>
                      <div className="text-sm text-gray-600">Waist</div>
                    </div>
                  )}
                  {latestProgress.measurements?.chest && (
                    <div className="text-center">
                      <div className="text-2xl font-bold">{latestProgress.measurements.chest}cm</div>
                      <div className="text-sm text-gray-600">Chest</div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-gray-600">No progress data yet. Add your first measurement!</p>
              )}
              <Button className="mt-4">Add Progress Entry</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="plan" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>AI Coaching Insights</CardTitle>
              <CardDescription>Personalized recommendations based on your progress</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-blue-900">Nutrition Recommendation</h4>
                <p className="text-blue-800 mt-1">
                  You're {calorieProgress < 80 ? 'under' : calorieProgress > 120 ? 'over' : 'on track with'} your daily calorie goal. 
                  {calorieProgress < 80 && ' Consider adding a protein-rich snack to meet your targets.'}
                  {calorieProgress > 120 && ' Focus on lower-calorie, nutrient-dense foods for the rest of the day.'}
                  {calorieProgress >= 80 && calorieProgress <= 120 && ' Keep up the great work maintaining your calorie balance!'}
                </p>
              </div>
              
              <div className="p-4 bg-green-50 rounded-lg">
                <h4 className="font-semibold text-green-900">Workout Suggestion</h4>
                <p className="text-green-800 mt-1">
                  Based on your {profile.goal.replace('_', ' ')} goal and {profile.activityLevel} activity level,
                  we recommend {profile.goal === 'muscle_gain' ? 'strength training 3-4 times per week' : 
                  profile.goal === 'weight_loss' ? 'combining cardio and strength training' : 
                  'maintaining your current activity level'}.
                </p>
              </div>

              <div className="p-4 bg-purple-50 rounded-lg">
                <h4 className="font-semibold text-purple-900">Progress Insights</h4>
                <p className="text-purple-800 mt-1">
                  Your current macro split is {macroPercentages.proteinPercent}% protein, {macroPercentages.fatPercent}% fat, 
                  and {macroPercentages.carbPercent}% carbs. This distribution is well-suited for your {profile.goal.replace('_', ' ')} goal.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
