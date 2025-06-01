import { Link, createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import { useAuth } from "~/hooks/auth";
import {
	type ActivityLevel,
	type CalculationResult,
	type Gender,
	HealthCalculator,
	type UserMetrics,
	healthCalculator,
} from "~/lib/health-calculators";

export const Route = createFileRoute("/")({
	component: HomePage,
});

function HomePage() {
	const { data: authData } = useAuth();
	const [metrics, setMetrics] = useState<Partial<UserMetrics>>({
		gender: "male",
		activityLevel: "moderately_active",
	});
	const [result, setResult] = useState<CalculationResult | null>(null);
	const [errors, setErrors] = useState<Record<string, string>>({});

	const isAuthenticated = !!authData?.user;

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
		<div className="container mx-auto max-w-3xl px-4 py-6">
			<div className="text-center mb-8">
				<h1 className="text-4xl font-bold mb-4">OptiBody</h1>
				<p className="text-lg text-muted-foreground">
					あなたの健康的な体づくりをサポート
				</p>
			</div>

			<div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6 mb-6">
				<div className="mb-6">
					<h2 className="text-xl font-semibold mb-2">BMR & TDEE 計算機</h2>
					<p className="text-sm text-muted-foreground">
						基礎代謝率と総消費エネルギーを計算して、最適なカロリー摂取量を把握
					</p>
				</div>

				<div className="space-y-6">
					{/* 基本情報 - コンパクト */}
					<div className="grid grid-cols-3 gap-4">
						<div className="space-y-2">
							<Label htmlFor="height" className="text-sm font-medium">
								身長 (cm)
							</Label>
							<Input
								id="height"
								type="number"
								placeholder="170"
								value={metrics.height || ""}
								onChange={(e) =>
									setMetrics({ ...metrics, height: Number(e.target.value) })
								}
								className={`h-10 ${errors.height ? "border-destructive" : ""}`}
							/>
							{errors.height && (
								<p className="text-xs text-destructive">{errors.height}</p>
							)}
						</div>

						<div className="space-y-2">
							<Label htmlFor="weight" className="text-sm font-medium">
								体重 (kg)
							</Label>
							<Input
								id="weight"
								type="number"
								placeholder="65"
								value={metrics.weight || ""}
								onChange={(e) =>
									setMetrics({ ...metrics, weight: Number(e.target.value) })
								}
								className={`h-10 ${errors.weight ? "border-destructive" : ""}`}
							/>
							{errors.weight && (
								<p className="text-xs text-destructive">{errors.weight}</p>
							)}
						</div>

						<div className="space-y-2">
							<Label htmlFor="age" className="text-sm font-medium">
								年齢
							</Label>
							<Input
								id="age"
								type="number"
								placeholder="30"
								value={metrics.age || ""}
								onChange={(e) =>
									setMetrics({ ...metrics, age: Number(e.target.value) })
								}
								className={`h-10 ${errors.age ? "border-destructive" : ""}`}
							/>
							{errors.age && (
								<p className="text-xs text-destructive">{errors.age}</p>
							)}
						</div>
					</div>

					{/* 性別 */}
					<div className="space-y-2">
						<Label className="text-sm font-medium">性別</Label>
						<RadioGroup
							value={metrics.gender}
							onValueChange={(value) =>
								setMetrics({ ...metrics, gender: value as Gender })
							}
							className="grid grid-cols-2 gap-4"
						>
							<div className="relative">
								<RadioGroupItem
									value="male"
									id="male"
									className="peer sr-only"
								/>
								<Label
									htmlFor="male"
									className="flex items-center justify-center rounded-lg border-2 border-muted bg-popover p-3 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer transition-colors"
								>
									男性
								</Label>
							</div>
							<div className="relative">
								<RadioGroupItem
									value="female"
									id="female"
									className="peer sr-only"
								/>
								<Label
									htmlFor="female"
									className="flex items-center justify-center rounded-lg border-2 border-muted bg-popover p-3 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer transition-colors"
								>
									女性
								</Label>
							</div>
						</RadioGroup>
					</div>

					{/* 運動レベル */}
					<div className="space-y-3">
						<Label className="text-sm font-medium">運動レベル</Label>
						<RadioGroup
							value={metrics.activityLevel}
							onValueChange={(value) =>
								setMetrics({
									...metrics,
									activityLevel: value as ActivityLevel,
								})
							}
							className="space-y-2"
						>
							{activityOptions.map((option) => (
								<div key={option.value} className="relative">
									<RadioGroupItem
										value={option.value}
										id={option.value}
										className="peer sr-only"
									/>
									<Label
										htmlFor={option.value}
										className="flex flex-col space-y-1 rounded-lg border-2 border-muted bg-popover p-3 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer transition-colors"
									>
										<span className="font-medium text-sm">{option.label}</span>
										<span className="text-xs text-muted-foreground">
											{option.description}
										</span>
									</Label>
								</div>
							))}
						</RadioGroup>
					</div>
				</div>

				<Button
					onClick={handleCalculate}
					className="w-full mt-8 h-12 text-base"
				>
					計算する
				</Button>
			</div>

			{/* 結果表示 */}
			{result && (
				<div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
					<h2 className="text-xl font-semibold mb-6">計算結果</h2>

					<div className="grid gap-4 md:grid-cols-2">
						<div className="rounded-lg border p-4 bg-background">
							<div className="flex flex-col space-y-2">
								<h3 className="text-base font-semibold">基礎代謝率 (BMR)</h3>
								<p className="text-xs text-muted-foreground">
									安静時に消費される最小限のエネルギー
								</p>
								<p className="text-2xl font-bold mt-3">
									{result.bmr.toLocaleString()}
								</p>
								<p className="text-xs text-muted-foreground">kcal/日</p>
							</div>
						</div>

						<div className="rounded-lg border p-4 bg-background">
							<div className="flex flex-col space-y-2">
								<h3 className="text-base font-semibold">
									総消費エネルギー (TDEE)
								</h3>
								<p className="text-xs text-muted-foreground">
									日常生活で消費される総エネルギー
								</p>
								<p className="text-2xl font-bold mt-3">
									{result.tdee.toLocaleString()}
								</p>
								<p className="text-xs text-muted-foreground">kcal/日</p>
							</div>
						</div>
					</div>

					<div className="mt-6 pt-4 border-t space-y-4">
						<p className="text-xs text-muted-foreground">
							計算式: {result.formula}
						</p>

						{!isAuthenticated && (
							<div className="rounded-lg border p-4 bg-background text-center">
								<h3 className="text-base font-semibold mb-2">
									計算結果を保存しませんか？
								</h3>
								<p className="text-sm text-muted-foreground mb-4">
									アカウント登録で履歴管理と個人最適化されたアドバイスが利用できます
								</p>
								<div className="flex items-center justify-center gap-3">
									<Link to="/auth/signup">
										<Button size="sm" className="h-9">
											無料で新規登録
										</Button>
									</Link>
									<Link to="/auth/login">
										<Button variant="outline" size="sm" className="h-9">
											ログイン
										</Button>
									</Link>
								</div>
							</div>
						)}
					</div>
				</div>
			)}
		</div>
	);
}
