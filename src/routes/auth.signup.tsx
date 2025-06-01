import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "~/components/ui/breadcrumb";
import { useSignup } from "~/hooks/auth";

export const Route = createFileRoute("/auth/signup")({
	component: SignupPage,
});

function SignupPage() {
	const signupMutation = useSignup();
	const [formData, setFormData] = useState({
		email: "",
		username: "",
		password: "",
		confirmPassword: "",
	});
	const [errors, setErrors] = useState<Record<string, string>>({});

	const validateForm = (): boolean => {
		const newErrors: Record<string, string> = {};

		if (!formData.email) {
			newErrors.email = "メールアドレスを入力してください";
		} else if (!/\S+@\S+\.\S+/.test(formData.email)) {
			newErrors.email = "有効なメールアドレスを入力してください";
		}

		if (!formData.username) {
			newErrors.username = "ユーザー名を入力してください";
		} else if (formData.username.length < 3) {
			newErrors.username = "ユーザー名は3文字以上で入力してください";
		} else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
			newErrors.username = "ユーザー名は英数字とアンダースコアのみ使用できます";
		}

		if (!formData.password) {
			newErrors.password = "パスワードを入力してください";
		} else if (formData.password.length < 8) {
			newErrors.password = "パスワードは8文字以上で入力してください";
		}

		if (!formData.confirmPassword) {
			newErrors.confirmPassword = "パスワードを再入力してください";
		} else if (formData.password !== formData.confirmPassword) {
			newErrors.confirmPassword = "パスワードが一致しません";
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!validateForm()) return;

		setErrors({});
		signupMutation.mutate(
			{
				email: formData.email,
				username: formData.username,
				password: formData.password,
			},
			{
				onError: (error) => {
					const errorMessage = error.message;
					if (errorMessage.includes("email:")) {
						setErrors({ email: errorMessage.replace("email: ", "") });
					} else if (errorMessage.includes("username:")) {
						setErrors({ username: errorMessage.replace("username: ", "") });
					} else {
						setErrors({ general: errorMessage });
					}
				},
			},
		);
	};

	return (
		<div className="container mx-auto max-w-md px-4 py-16">
			<div className="mb-6">
				<Breadcrumb>
					<BreadcrumbList>
						<BreadcrumbItem>
							<BreadcrumbLink asChild>
								<Link to="/">OptiBody</Link>
							</BreadcrumbLink>
						</BreadcrumbItem>
						<BreadcrumbSeparator />
						<BreadcrumbItem>
							<BreadcrumbPage>新規登録</BreadcrumbPage>
						</BreadcrumbItem>
					</BreadcrumbList>
				</Breadcrumb>
			</div>

			<div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
				<div className="text-center mb-6">
					<h1 className="text-2xl font-bold mb-2">新規登録</h1>
					<p className="text-muted-foreground text-sm">
						新しいアカウントを作成してください
					</p>
				</div>

				{errors.general && (
					<div className="rounded-md border border-destructive bg-destructive/10 p-3 mb-6">
						<p className="text-sm text-destructive">{errors.general}</p>
					</div>
				)}

				<form onSubmit={handleSubmit} className="space-y-6">
					<div className="space-y-2">
						<Label htmlFor="email" className="text-sm font-medium">
							メールアドレス
						</Label>
						<Input
							id="email"
							type="email"
							value={formData.email}
							onChange={(e) =>
								setFormData({ ...formData, email: e.target.value })
							}
							className={`h-12 ${errors.email ? "border-destructive" : ""}`}
							placeholder="例: user@example.com"
							disabled={signupMutation.isPending}
						/>
						{errors.email && (
							<p className="text-sm text-destructive">{errors.email}</p>
						)}
					</div>

					<div className="space-y-2">
						<Label htmlFor="username" className="text-sm font-medium">
							ユーザー名
						</Label>
						<Input
							id="username"
							type="text"
							value={formData.username}
							onChange={(e) =>
								setFormData({ ...formData, username: e.target.value })
							}
							className={`h-12 ${errors.username ? "border-destructive" : ""}`}
							placeholder="例: user123"
							disabled={signupMutation.isPending}
						/>
						{errors.username && (
							<p className="text-sm text-destructive">{errors.username}</p>
						)}
					</div>

					<div className="space-y-2">
						<Label htmlFor="password" className="text-sm font-medium">
							パスワード
						</Label>
						<Input
							id="password"
							type="password"
							value={formData.password}
							onChange={(e) =>
								setFormData({ ...formData, password: e.target.value })
							}
							className={`h-12 ${errors.password ? "border-destructive" : ""}`}
							placeholder="••••••••"
							disabled={signupMutation.isPending}
						/>
						{errors.password && (
							<p className="text-sm text-destructive">{errors.password}</p>
						)}
					</div>

					<div className="space-y-2">
						<Label htmlFor="confirmPassword" className="text-sm font-medium">
							パスワード（確認）
						</Label>
						<Input
							id="confirmPassword"
							type="password"
							value={formData.confirmPassword}
							onChange={(e) =>
								setFormData({ ...formData, confirmPassword: e.target.value })
							}
							className={`h-12 ${errors.confirmPassword ? "border-destructive" : ""}`}
							placeholder="••••••••"
							disabled={signupMutation.isPending}
						/>
						{errors.confirmPassword && (
							<p className="text-sm text-destructive">
								{errors.confirmPassword}
							</p>
						)}
					</div>

					<Button
						type="submit"
						className="w-full h-12 text-base"
						disabled={signupMutation.isPending}
					>
						{signupMutation.isPending ? "登録中..." : "アカウント作成"}
					</Button>
				</form>

				<div className="mt-6 text-center">
					<p className="text-sm text-muted-foreground">
						既にアカウントをお持ちの方は
						<Link
							to="/auth/login"
							className="text-primary hover:underline ml-1 font-medium"
						>
							ログイン
						</Link>
					</p>
				</div>
			</div>
		</div>
	);
}
