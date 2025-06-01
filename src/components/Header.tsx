import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "~/components/ui/button";

export default function Header() {
	const [isAuthenticated, setIsAuthenticated] = useState(false);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		// 認証状態をチェック
		fetch("/api/auth/me")
			.then((res) => {
				setIsAuthenticated(res.ok);
			})
			.finally(() => {
				setIsLoading(false);
			});
	}, []);

	return (
		<header className="bg-white shadow-sm border-b">
			<div className="container mx-auto px-4">
				<nav className="flex items-center justify-between h-16">
					<div className="flex items-center">
						<Link
							to="/"
							className="text-xl font-bold text-blue-600 hover:text-blue-700"
						>
							OptiBody
						</Link>
					</div>

					<div className="flex items-center gap-6">
						<Link
							to="/"
							className="text-gray-700 hover:text-blue-600 transition-colors"
							activeProps={{ className: "text-blue-600 font-semibold" }}
						>
							ホーム
						</Link>
						<Link
							to="/calculator"
							className="text-gray-700 hover:text-blue-600 transition-colors"
							activeProps={{ className: "text-blue-600 font-semibold" }}
						>
							計算機
						</Link>

						{!isLoading &&
							(isAuthenticated ? (
								<Link
									to="/dashboard"
									className="text-gray-700 hover:text-blue-600 transition-colors"
									activeProps={{ className: "text-blue-600 font-semibold" }}
								>
									ダッシュボード
								</Link>
							) : (
								<div className="flex items-center gap-2">
									<Link to="/auth/login">
										<Button variant="outline" size="sm">
											ログイン
										</Button>
									</Link>
									<Link to="/auth/signup">
										<Button size="sm">新規登録</Button>
									</Link>
								</div>
							))}
					</div>
				</nav>
			</div>
		</header>
	);
}
