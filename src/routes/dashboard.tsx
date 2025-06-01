import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "~/components/ui/button";

export const Route = createFileRoute("/dashboard")({
	component: DashboardPage,
});

interface UserInfo {
	email: string;
	username: string;
}

function DashboardPage() {
	const navigate = useNavigate();
	const [user, setUser] = useState<UserInfo | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		// ユーザー情報を取得
		fetch("/api/auth/me")
			.then((res) => {
				if (!res.ok) {
					throw new Error("Unauthorized");
				}
				return res.json();
			})
			.then((data) => {
				setUser(data.user);
			})
			.catch(() => {
				// 未認証の場合はログインページへリダイレクト
				navigate({ to: "/auth/login" });
			})
			.finally(() => {
				setIsLoading(false);
			});
	}, [navigate]);

	const handleLogout = async () => {
		try {
			const response = await fetch("/api/auth/logout", {
				method: "POST",
			});

			if (response.ok) {
				navigate({ to: "/" });
			}
		} catch (error) {
			console.error("Logout error:", error);
		}
	};

	if (isLoading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="text-gray-600">読み込み中...</div>
			</div>
		);
	}

	if (!user) {
		return null;
	}

	return (
		<div className="min-h-screen bg-gray-50">
			<div className="bg-white shadow-sm">
				<div className="container mx-auto px-4 py-4">
					<div className="flex items-center justify-between">
						<h1 className="text-xl font-semibold">ダッシュボード</h1>
						<Button onClick={handleLogout} variant="outline" size="sm">
							ログアウト
						</Button>
					</div>
				</div>
			</div>

			<div className="container mx-auto px-4 py-8">
				<div className="bg-white rounded-lg shadow-md p-6 mb-6">
					<h2 className="text-lg font-semibold mb-4">プロフィール</h2>
					<div className="space-y-2">
						<p className="text-gray-700">
							<span className="font-medium">ユーザー名:</span> {user.username}
						</p>
						<p className="text-gray-700">
							<span className="font-medium">メールアドレス:</span> {user.email}
						</p>
					</div>
				</div>

				<div className="grid md:grid-cols-2 gap-6">
					<Link
						to="/calculator"
						className="block bg-blue-50 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
					>
						<h3 className="text-lg font-semibold mb-2 text-blue-900">
							BMR & TDEE計算機
						</h3>
						<p className="text-gray-700">
							基礎代謝率と総消費エネルギーを計算して、最適なカロリー摂取量を把握しましょう。
						</p>
					</Link>

					<div className="bg-gray-50 rounded-lg shadow-md p-6">
						<h3 className="text-lg font-semibold mb-2 text-gray-900">
							履歴管理
						</h3>
						<p className="text-gray-600">計算履歴の保存機能は準備中です。</p>
					</div>
				</div>
			</div>
		</div>
	);
}
