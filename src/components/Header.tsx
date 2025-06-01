import { Link, useLocation } from "@tanstack/react-router";
import { Button } from "~/components/ui/button";
import { useAuth, useLogout } from "~/hooks/auth";

export default function Header() {
	const location = useLocation();
	const { data: authData, isLoading } = useAuth();
	const logoutMutation = useLogout();

	// 認証ページではヘッダーを非表示
	if (
		location.pathname === "/auth/login" ||
		location.pathname === "/auth/signup"
	) {
		return null;
	}

	const isAuthenticated = !!authData?.user;

	const handleLogout = () => {
		logoutMutation.mutate();
	};

	return (
		<header className="bg-white shadow-sm border-b">
			<div className="container mx-auto px-4">
				<nav className="flex items-center justify-between h-16">
					<div className="flex items-center">
						<Link
							to="/"
							className="text-xl font-bold text-primary hover:shadow-md"
						>
							OptiBody
						</Link>
					</div>

					<div className="flex items-center gap-6">
						{!isLoading &&
							(isAuthenticated ? (
								<div className="flex items-center gap-4">
									<Button
										variant="outline"
										size="sm"
										onClick={handleLogout}
										disabled={logoutMutation.isPending}
									>
										{logoutMutation.isPending
											? "ログアウト中..."
											: "ログアウト"}
									</Button>
								</div>
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
