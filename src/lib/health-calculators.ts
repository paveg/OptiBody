export type Gender = 'male' | 'female';

export type ActivityLevel = 
  | 'sedentary'        // ほとんど運動しない
  | 'lightly_active'   // 週1-3回の軽い運動
  | 'moderately_active' // 週3-5回の中程度の運動
  | 'very_active'      // 週6-7回の激しい運動
  | 'extra_active';    // 毎日激しい運動/肉体労働

export interface UserMetrics {
  height: number;      // cm
  weight: number;      // kg
  age: number;        // years
  gender: Gender;
  activityLevel: ActivityLevel;
  bodyFatPercentage?: number; // % (将来の拡張用)
}

export interface CalculationResult {
  bmr: number;
  tdee: number;
  formula: string;
}

// 活動レベルの係数
const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  lightly_active: 1.375,
  moderately_active: 1.55,
  very_active: 1.725,
  extra_active: 1.9,
};

// BMR計算の抽象インターフェース（将来の拡張性のため）
interface BMRCalculator {
  calculate(metrics: UserMetrics): number;
  getName(): string;
  isApplicable(metrics: UserMetrics): boolean;
}

// ミフリン・セントジョー式の実装
class MifflinStJeorCalculator implements BMRCalculator {
  calculate(metrics: UserMetrics): number {
    const { weight, height, age, gender } = metrics;
    
    // 男性: BMR = 10 × 体重(kg) + 6.25 × 身長(cm) - 5 × 年齢 + 5
    // 女性: BMR = 10 × 体重(kg) + 6.25 × 身長(cm) - 5 × 年齢 - 161
    const baseBMR = 10 * weight + 6.25 * height - 5 * age;
    const genderAdjustment = gender === 'male' ? 5 : -161;
    
    return baseBMR + genderAdjustment;
  }

  getName(): string {
    return 'Mifflin-St Jeor Equation';
  }

  isApplicable(metrics: UserMetrics): boolean {
    // 体脂肪率が不要な計算式
    return true;
  }
}

// 将来の拡張用：キャッチ・マカードル式のスタブ
class KatchMcArdleCalculator implements BMRCalculator {
  calculate(metrics: UserMetrics): number {
    if (!metrics.bodyFatPercentage) {
      throw new Error('Body fat percentage is required for Katch-McArdle formula');
    }
    
    const { weight, bodyFatPercentage } = metrics;
    const leanBodyMass = weight * (1 - bodyFatPercentage / 100);
    
    // BMR = 370 + (21.6 × 除脂肪体重)
    return 370 + 21.6 * leanBodyMass;
  }

  getName(): string {
    return 'Katch-McArdle Formula';
  }

  isApplicable(metrics: UserMetrics): boolean {
    return !!metrics.bodyFatPercentage;
  }
}

// 計算エンジン
export class HealthCalculator {
  private calculators: BMRCalculator[] = [
    new KatchMcArdleCalculator(),
    new MifflinStJeorCalculator(),
  ];

  calculateBMRAndTDEE(metrics: UserMetrics): CalculationResult {
    // 適用可能な計算式を選択（優先順位：より正確な式を優先）
    const calculator = this.calculators.find(calc => calc.isApplicable(metrics));
    
    if (!calculator) {
      throw new Error('No applicable formula found for the given metrics');
    }

    const bmr = calculator.calculate(metrics);
    const tdee = this.calculateTDEE(bmr, metrics.activityLevel);

    return {
      bmr: Math.round(bmr),
      tdee: Math.round(tdee),
      formula: calculator.getName(),
    };
  }

  private calculateTDEE(bmr: number, activityLevel: ActivityLevel): number {
    return bmr * ACTIVITY_MULTIPLIERS[activityLevel];
  }

  // 活動レベルの選択肢を取得
  static getActivityLevelOptions() {
    return [
      { value: 'sedentary', label: 'ほとんど運動しない', description: 'デスクワーク中心' },
      { value: 'lightly_active', label: '軽い運動', description: '週1-3回の軽い運動' },
      { value: 'moderately_active', label: '中程度の運動', description: '週3-5回の運動' },
      { value: 'very_active', label: '激しい運動', description: '週6-7回の激しい運動' },
      { value: 'extra_active', label: '非常に激しい運動', description: '毎日激しい運動/肉体労働' },
    ];
  }
}

// エクスポート
export const healthCalculator = new HealthCalculator();