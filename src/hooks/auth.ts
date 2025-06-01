import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";

export interface User {
	id: string;
	email: string;
	username: string;
}

export interface LoginData {
	email: string;
	password: string;
}

export interface SignupData {
	email: string;
	username: string;
	password: string;
}

export interface AuthResponse {
	user: User;
}

export interface AuthErrorResponse {
	message: string;
	field?: string;
}

// API Functions
const authAPI = {
	async login(data: LoginData): Promise<AuthResponse> {
		const response = await fetch("/api/auth/login", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(data),
		});

		if (!response.ok) {
			const error: AuthErrorResponse = await response.json();
			throw new Error(error.message);
		}

		return response.json();
	},

	async signup(data: SignupData): Promise<AuthResponse> {
		const response = await fetch("/api/auth/signup", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(data),
		});

		if (!response.ok) {
			const error: AuthErrorResponse = await response.json();
			const errorMessage = error.field
				? `${error.field}: ${error.message}`
				: error.message;
			throw new Error(errorMessage);
		}

		return response.json();
	},

	async logout(): Promise<void> {
		const response = await fetch("/api/auth/logout", {
			method: "POST",
		});

		if (!response.ok) {
			throw new Error("ログアウトに失敗しました");
		}
	},

	async getMe(): Promise<AuthResponse> {
		const response = await fetch("/api/auth/me");

		if (!response.ok) {
			throw new Error("認証が必要です");
		}

		return response.json();
	},
};

// Query Keys
export const authKeys = {
	all: ["auth"] as const,
	user: () => [...authKeys.all, "user"] as const,
};

// Hooks
export function useAuth() {
	return useQuery({
		queryKey: authKeys.user(),
		queryFn: authAPI.getMe,
		retry: false,
		staleTime: 30 * 1000, // 30 seconds
		refetchOnWindowFocus: true,
		refetchOnMount: true,
	});
}

export function useLogin() {
	const queryClient = useQueryClient();
	const navigate = useNavigate();

	return useMutation({
		mutationFn: authAPI.login,
		onSuccess: (data) => {
			// キャッシュを更新
			queryClient.setQueryData(authKeys.user(), data);
			// 認証関連のクエリを無効化して再取得を強制
			queryClient.invalidateQueries({ queryKey: authKeys.all });
			// 少し遅延させてからナビゲーション
			setTimeout(() => {
				navigate({ to: "/dashboard" });
			}, 100);
		},
	});
}

export function useSignup() {
	const queryClient = useQueryClient();
	const navigate = useNavigate();

	return useMutation({
		mutationFn: authAPI.signup,
		onSuccess: (data) => {
			// キャッシュを更新
			queryClient.setQueryData(authKeys.user(), data);
			// 認証関連のクエリを無効化して再取得を強制
			queryClient.invalidateQueries({ queryKey: authKeys.all });
			// 少し遅延させてからナビゲーション
			setTimeout(() => {
				navigate({ to: "/dashboard" });
			}, 100);
		},
	});
}

export function useLogout() {
	const queryClient = useQueryClient();
	const navigate = useNavigate();

	return useMutation({
		mutationFn: authAPI.logout,
		onSuccess: () => {
			queryClient.removeQueries({ queryKey: authKeys.all });
			navigate({ to: "/" });
		},
	});
}
