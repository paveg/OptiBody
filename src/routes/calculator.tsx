import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "~/components/ui/select";
import {
	type ActivityLevel,
	type CalculationResult,
	type Gender,
	HealthCalculator,
	type UserMetrics,
	healthCalculator,
} from "~/lib/health-calculators";

export const Route = createFileRoute("/calculator")({
	component: CalculatorPage,
});

function CalculatorPage() {
	const [metrics, setMetrics] = useState<Partial<UserMetrics>>({
		gender: "male",
		activityLevel: "moderately_active",
	});
	const [result, setResult] = useState<CalculationResult | null>(null);
	const [errors, setErrors] = useState<Record<string, string>>({});

	const validateForm = (): boolean => {
		const newErrors: Record<string, string> = {};

		if (!metrics.height || metrics.height <= 0) {
			newErrors.height = "身長を入力してください";
		}
		if (!metrics.weight || metrics.weight <= 0) {
			newErrors.weight = "体重を入力してください";
		}
		if (!metrics.age || metrics.age <= 0 || metrics.age > 120) {
			newErrors.age = "正しい年齢を入力してください";
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleCalculate = () => {
		if (!validateForm()) return;

		try {
			const result = healthCalculator.calculateBMRAndTDEE(
				metrics as UserMetrics,
			);
			setResult(result);
		} catch (error) {
			console.error("計算エラー:", error);
		}
	};

	const activityOptions = HealthCalculator.getActivityLevelOptions();

	return (
		<div className="container mx-auto max-w-2xl px-4 py-8">
			<h1 className="text-3xl font-bold mb-8">BMR & TDEE 計算機</h1>

			<div className="bg-white rounded-lg shadow-md p-6 mb-8">
				<h2 className="text-xl font-semibold mb-6">
					あなたの情報を入力してください
				</h2>

				<div className="space-y-4">
					{/* 身長 */}
					<div>
						<Label htmlFor="height">身長 (cm)</Label>
						<Input
							id="height"
							type="number"
							placeholder="170"
							value={metrics.height || ""}
							onChange={(e) =>
								setMetrics({ ...metrics, height: Number(e.target.value) })
							}
							className={errors.height ? "border-red-500" : ""}
						/>
						{errors.height && (
							<p className="text-red-500 text-sm mt-1">{errors.height}</p>
						)}
					</div>

					{/* 体重 */}
					<div>
						<Label htmlFor="weight">体重 (kg)</Label>
						<Input
							id="weight"
							type="number"
							placeholder="65"
							value={metrics.weight || ""}
							onChange={(e) =>
								setMetrics({ ...metrics, weight: Number(e.target.value) })
							}
							className={errors.weight ? "border-red-500" : ""}
						/>
						{errors.weight && (
							<p className="text-red-500 text-sm mt-1">{errors.weight}</p>
						)}
					</div>

					{/* 年齢 */}
					<div>
						<Label htmlFor="age">年齢</Label>
						<Input
							id="age"
							type="number"
							placeholder="30"
							value={metrics.age || ""}
							onChange={(e) =>
								setMetrics({ ...metrics, age: Number(e.target.value) })
							}
							className={errors.age ? "border-red-500" : ""}
						/>
						{errors.age && (
							<p className="text-red-500 text-sm mt-1">{errors.age}</p>
						)}
					</div>

					{/* 性別 */}
					<div>
						<Label htmlFor="gender">性別</Label>
						<Select
							value={metrics.gender}
							onValueChange={(value) =>
								setMetrics({ ...metrics, gender: value as Gender })
							}
						>
							<SelectTrigger className="w-full">
								<SelectValue placeholder="性別を選択" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="male">男性</SelectItem>
								<SelectItem value="female">女性</SelectItem>
							</SelectContent>
						</Select>
					</div>

					{/* 運動レベル */}
					<div>
						<Label htmlFor="activity">運動レベル</Label>
						<Select
							value={metrics.activityLevel}
							onValueChange={(value) =>
								setMetrics({
									...metrics,
									activityLevel: value as ActivityLevel,
								})
							}
						>
							<SelectTrigger className="w-full">
								<SelectValue placeholder="運動レベルを選択" />
							</SelectTrigger>
							<SelectContent>
								{activityOptions.map((option) => (
									<SelectItem key={option.value} value={option.value}>
										<div>
											<div className="font-medium">{option.label}</div>
											<div className="text-sm text-gray-500">
												{option.description}
											</div>
										</div>
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					<Button onClick={handleCalculate} className="w-full mt-6">
						計算する
					</Button>
				</div>
			</div>

			{/* 結果表示 */}
			{result && (
				<div className="bg-blue-50 rounded-lg shadow-md p-6">
					<h2 className="text-xl font-semibold mb-4">計算結果</h2>

					<div className="space-y-3">
						<div className="flex justify-between items-center p-3 bg-white rounded">
							<span className="font-medium">基礎代謝率 (BMR)</span>
							<span className="text-2xl font-bold text-blue-600">
								{result.bmr} kcal/日
							</span>
						</div>

						<div className="flex justify-between items-center p-3 bg-white rounded">
							<span className="font-medium">総消費エネルギー (TDEE)</span>
							<span className="text-2xl font-bold text-green-600">
								{result.tdee} kcal/日
							</span>
						</div>

						<div className="text-sm text-gray-600 mt-4">
							<p>計算式: {result.formula}</p>
							<p className="mt-2">
								BMR: 安静時に消費される最小限のエネルギー
								<br />
								TDEE: 日常生活で消費される総エネルギー
							</p>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
