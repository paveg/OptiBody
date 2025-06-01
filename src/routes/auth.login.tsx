import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { useState } from "react";
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "~/components/ui/breadcrumb";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { useLogin } from "~/hooks/auth";

export const Route = createFileRoute("/auth/login")({
	component: LoginPage,
});

function LoginPage() {
	const loginMutation = useLogin();
	const [formData, setFormData] = useState({
		email: "",
		password: "",
	});
	const [errors, setErrors] = useState<Record<string, string>>({});

	const validateForm = (): boolean => {
		const newErrors: Record<string, string> = {};

		if (!formData.email) {
			newErrors.email = "メールアドレスを入力してください";
		} else if (!/\S+@\S+\.\S+/.test(formData.email)) {
			newErrors.email = "有効なメールアドレスを入力してください";
		}

		if (!formData.password) {
			newErrors.password = "パスワードを入力してください";
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!validateForm()) return;

		setErrors({});
		loginMutation.mutate(formData, {
			onError: (error) => {
				setErrors({ general: error.message });
			},
		});
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
							<BreadcrumbPage>ログイン</BreadcrumbPage>
						</BreadcrumbItem>
					</BreadcrumbList>
				</Breadcrumb>
			</div>

			<div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
				<div className="text-center mb-6">
					<h1 className="text-2xl font-bold mb-2">ログイン</h1>
					<p className="text-muted-foreground text-sm">
						アカウントにログインしてください
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
							disabled={loginMutation.isPending}
						/>
						{errors.email && (
							<p className="text-sm text-destructive">{errors.email}</p>
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
							disabled={loginMutation.isPending}
						/>
						{errors.password && (
							<p className="text-sm text-destructive">{errors.password}</p>
						)}
					</div>

					<Button
						type="submit"
						className="w-full h-12 text-base"
						disabled={loginMutation.isPending}
					>
						{loginMutation.isPending ? "ログイン中..." : "ログイン"}
					</Button>
				</form>

				<div className="mt-6 text-center">
					<p className="text-sm text-muted-foreground">
						アカウントをお持ちでない方は
						<Link
							to="/auth/signup"
							className="text-primary hover:underline ml-1 font-medium"
						>
							新規登録
						</Link>
					</p>
				</div>
			</div>
		</div>
	);
}
