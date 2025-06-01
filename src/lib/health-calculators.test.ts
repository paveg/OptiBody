import { describe, expect, it } from "vitest";
import { type UserMetrics, healthCalculator } from "./health-calculators";

describe("Health Calculators", () => {
	describe("calculateBMRAndTDEE", () => {
		it("should calculate BMR and TDEE correctly for male", () => {
			const metrics: UserMetrics = {
				gender: "male",
				weight: 70,
				height: 175,
				age: 30,
				activityLevel: "sedentary",
			};

			const result = healthCalculator.calculateBMRAndTDEE(metrics);

			expect(result.bmr).toBe(1649);
			expect(result.tdee).toBe(1979);
			expect(result.formula).toBe("Mifflin-St Jeor Equation");
		});

		it("should calculate BMR and TDEE correctly for female", () => {
			const metrics: UserMetrics = {
				gender: "female",
				weight: 60,
				height: 165,
				age: 25,
				activityLevel: "lightly_active",
			};

			const result = healthCalculator.calculateBMRAndTDEE(metrics);

			expect(result.bmr).toBe(1345);
			expect(result.tdee).toBe(1850);
			expect(result.formula).toBe("Mifflin-St Jeor Equation");
		});

		it("should use Katch-McArdle formula when body fat percentage is provided", () => {
			const metrics: UserMetrics = {
				gender: "male",
				weight: 70,
				height: 175,
				age: 30,
				activityLevel: "moderately_active",
				bodyFatPercentage: 15,
			};

			const result = healthCalculator.calculateBMRAndTDEE(metrics);

			expect(result.formula).toBe("Katch-McArdle Formula");
			expect(result.bmr).toBeGreaterThan(0);
			expect(result.tdee).toBeGreaterThan(result.bmr);
		});

		it("should calculate TDEE correctly with very active level", () => {
			const metrics: UserMetrics = {
				gender: "male",
				weight: 70,
				height: 175,
				age: 30,
				activityLevel: "very_active",
			};

			const result = healthCalculator.calculateBMRAndTDEE(metrics);

			expect(result.tdee).toBe(2844);
		});
	});
});
