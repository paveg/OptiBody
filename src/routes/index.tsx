import { Link, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
	component: HomePage,
});

function HomePage() {
	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
			<div className="container mx-auto px-4 py-16">
				<div className="text-center mb-12">
					<h1 className="text-5xl font-bold text-gray-800 mb-4">OptiBody</h1>
					<p className="text-xl text-gray-600">
						あなたの健康的な体づくりをサポート
					</p>
				</div>

				<div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8">
					<h2 className="text-2xl font-semibold mb-6 text-center">
						BMR & TDEE計算機
					</h2>

					<div className="space-y-4 mb-8">
						<p className="text-gray-700">
							基礎代謝率（BMR）と総消費エネルギー（TDEE）を計算して、
							適切なカロリー摂取量を把握しましょう。
						</p>

						<div className="bg-blue-50 rounded-lg p-4">
							<h3 className="font-semibold text-blue-900 mb-2">BMRとは？</h3>
							<p className="text-sm text-blue-800">
								基礎代謝率：安静時に体が消費する最小限のエネルギー量
							</p>
						</div>

						<div className="bg-green-50 rounded-lg p-4">
							<h3 className="font-semibold text-green-900 mb-2">TDEEとは？</h3>
							<p className="text-sm text-green-800">
								総消費エネルギー：日常生活での活動を含めた1日の総エネルギー消費量
							</p>
						</div>
					</div>

					<Link
						to="/calculator"
						className="block w-full text-center bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors"
					>
						計算を始める
					</Link>
				</div>

				<div className="mt-12 text-center text-gray-600">
					<p className="text-sm">
						※
						計算結果は目安です。個人差があるため、実際の必要カロリーは異なる場合があります。
					</p>
				</div>
			</div>
		</div>
	);
}
