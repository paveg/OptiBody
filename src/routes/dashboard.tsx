import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { Button } from "~/components/ui/button";
import { useAuth } from "~/hooks/auth";

export const Route = createFileRoute("/dashboard")({
	component: DashboardPage,
});

function DashboardPage() {
	const navigate = useNavigate();
	const { data: authData, isLoading, error } = useAuth();

	// 認証エラーの場合はログインページにリダイレクト
	useEffect(() => {
		if (error && !isLoading) {
			navigate({ to: "/auth/login" });
		}
	}, [error, isLoading, navigate]);

	if (isLoading) {
		return (
			<div className="container mx-auto max-w-4xl px-4 py-6 flex items-center justify-center min-h-screen">
				<div className="text-muted-foreground">読み込み中...</div>
			</div>
		);
	}

	if (error || !authData?.user) {
		return null;
	}

	const user = authData.user;

	return (
		<div className="container mx-auto max-w-2xl px-4 py-16">
			<div className="text-center mb-8">
				<h1 className="text-3xl font-bold mb-4">ダッシュボード</h1>
				<p className="text-muted-foreground mb-8">
					こんにちは、{user.username}さん
				</p>
			</div>

			<div className="rounded-lg border bg-card text-card-foreground shadow-sm p-8 text-center">
				<div className="mb-6">
					<div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
						<span className="text-2xl">🚧</span>
					</div>
					<h2 className="text-xl font-semibold mb-2">機能開発中</h2>
					<p className="text-muted-foreground text-sm">
						ダッシュボード機能は現在開発中です。
						<br />
						計算機能はホームページからご利用いただけます。
					</p>
				</div>

				<Link to="/">
					<Button className="h-12">ホームに戻る</Button>
				</Link>
			</div>
		</div>
	);
}
