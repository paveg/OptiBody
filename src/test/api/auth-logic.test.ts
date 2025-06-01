import { beforeEach, describe, expect, it, vi } from "vitest";
import { eq, or } from "drizzle-orm";
import { generateId } from "lucia";
import { db } from "~/lib/database";
import { users } from "~/lib/database/schema";
import { lucia, hashPassword, verifyPassword } from "~/lib/auth";
import { validateRequest } from "~/lib/auth/middleware";
import { createErrorResponse, createJSONResponse } from "~/lib/api-utils";

// Mock the database
vi.mock("~/lib/database", () => ({
	db: {
		select: vi.fn(),
		insert: vi.fn(),
	},
}));

// Mock the auth functions
vi.mock("~/lib/auth", () => ({
	lucia: {
		createSession: vi.fn(),
		createSessionCookie: vi.fn(),
		readSessionCookie: vi.fn(),
		invalidateSession: vi.fn(),
		createBlankSessionCookie: vi.fn(),
	},
	hashPassword: vi.fn(),
	verifyPassword: vi.fn(),
}));

// Mock the auth middleware
vi.mock("~/lib/auth/middleware", () => ({
	validateRequest: vi.fn(),
}));

// Mock generateId
vi.mock("lucia", () => ({
	generateId: vi.fn(),
}));

const mockDb = vi.mocked(db);
const mockLucia = vi.mocked(lucia);
const mockHashPassword = vi.mocked(hashPassword);
const mockVerifyPassword = vi.mocked(verifyPassword);
const mockValidateRequest = vi.mocked(validateRequest);
const mockGenerateId = vi.mocked(generateId);

describe("Auth API Logic Tests", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("Signup Logic", () => {
		const signupLogic = async (body: any) => {
			const { email, username, password } = body;

			// Validation
			if (!email || !username || !password) {
				return createErrorResponse("全ての項目を入力してください", 400);
			}

			if (password.length < 8) {
				return createErrorResponse(
					"パスワードは8文字以上で入力してください",
					400,
					"password",
				);
			}

			if (!/^[a-zA-Z0-9_]+$/.test(username)) {
				return createErrorResponse(
					"ユーザー名は英数字とアンダースコアのみ使用できます",
					400,
					"username",
				);
			}

			// Check existing user
			const existingUser = await mockDb
				.select()
				.from(users)
				.where(
					or(
						eq(users.email, email.toLowerCase()),
						eq(users.username, username.toLowerCase()),
					),
				)
				.limit(1);

			if (existingUser.length > 0) {
				if (existingUser[0].email === email.toLowerCase()) {
					return createErrorResponse(
						"このメールアドレスは既に使用されています",
						409,
						"email",
					);
				}
				return createErrorResponse(
					"このユーザー名は既に使用されています",
					409,
					"username",
				);
			}

			// Hash password and create user
			const hashedPassword = await mockHashPassword(password);
			const userId = mockGenerateId(15);
			
			await mockDb.insert(users).values({
				id: userId,
				email: email.toLowerCase(),
				username: username.toLowerCase(),
				hashedPassword,
			});

			// Create session
			const session = await mockLucia.createSession(userId, {});
			const sessionCookie = mockLucia.createSessionCookie(session.id);

			return createJSONResponse({ message: "アカウントを作成しました" }, 201, {
				"Set-Cookie": sessionCookie.serialize(),
			});
		};

		it("should successfully create a new user", async () => {
			// Mock database responses
			mockDb.select.mockReturnValue({
				from: vi.fn().mockReturnValue({
					where: vi.fn().mockReturnValue({
						limit: vi.fn().mockResolvedValue([]),
					}),
				}),
			} as any);

			mockDb.insert.mockReturnValue({
				values: vi.fn().mockResolvedValue(undefined),
			} as any);

			// Mock auth functions
			mockHashPassword.mockResolvedValue("hashed_password");
			mockGenerateId.mockReturnValue("test_user_id");
			mockLucia.createSession.mockResolvedValue({ id: "session_id" } as any);
			mockLucia.createSessionCookie.mockReturnValue({
				serialize: () => "session=abc123",
			} as any);

			const response = await signupLogic({
				email: "test@example.com",
				username: "testuser",
				password: "password123",
			});

			expect(response.status).toBe(201);
			const data = await response.json();
			expect(data.message).toBe("アカウントを作成しました");
		});

		it("should return error for missing fields", async () => {
			const response = await signupLogic({
				email: "test@example.com",
				// missing username and password
			});

			expect(response.status).toBe(400);
			const data = await response.json();
			expect(data.message).toBe("全ての項目を入力してください");
		});

		it("should return error for short password", async () => {
			const response = await signupLogic({
				email: "test@example.com",
				username: "testuser",
				password: "short",
			});

			expect(response.status).toBe(400);
			const data = await response.json();
			expect(data.message).toBe("パスワードは8文字以上で入力してください");
			expect(data.field).toBe("password");
		});

		it("should return error for invalid username format", async () => {
			const response = await signupLogic({
				email: "test@example.com",
				username: "test-user!",
				password: "password123",
			});

			expect(response.status).toBe(400);
			const data = await response.json();
			expect(data.message).toBe("ユーザー名は英数字とアンダースコアのみ使用できます");
			expect(data.field).toBe("username");
		});

		it("should return error for existing email", async () => {
			// Mock existing user with same email
			mockDb.select.mockReturnValue({
				from: vi.fn().mockReturnValue({
					where: vi.fn().mockReturnValue({
						limit: vi.fn().mockResolvedValue([
							{ email: "test@example.com", username: "otheruser" },
						]),
					}),
				}),
			} as any);

			const response = await signupLogic({
				email: "test@example.com",
				username: "testuser",
				password: "password123",
			});

			expect(response.status).toBe(409);
			const data = await response.json();
			expect(data.message).toBe("このメールアドレスは既に使用されています");
			expect(data.field).toBe("email");
		});
	});

	describe("Login Logic", () => {
		const loginLogic = async (body: any) => {
			const { email, password } = body;

			if (!email || !password) {
				return createErrorResponse("メールアドレスとパスワードは必須です", 400);
			}

			// Find user
			const user = await mockDb
				.select()
				.from(users)
				.where(eq(users.email, email.toLowerCase()))
				.limit(1);

			if (user.length === 0) {
				return createErrorResponse(
					"メールアドレスまたはパスワードが正しくありません",
					401,
				);
			}

			const validPassword = await mockVerifyPassword(
				password,
				user[0].hashedPassword,
			);
			
			if (!validPassword) {
				return createErrorResponse(
					"メールアドレスまたはパスワードが正しくありません",
					401,
				);
			}

			// Create session
			const session = await mockLucia.createSession(user[0].id, {});
			const sessionCookie = mockLucia.createSessionCookie(session.id);

			return createJSONResponse({ message: "ログインに成功しました" }, 200, {
				"Set-Cookie": sessionCookie.serialize(),
			});
		};

		it("should successfully login with valid credentials", async () => {
			// Mock user found in database
			mockDb.select.mockReturnValue({
				from: vi.fn().mockReturnValue({
					where: vi.fn().mockReturnValue({
						limit: vi.fn().mockResolvedValue([
							{
								id: "user_id",
								email: "test@example.com",
								hashedPassword: "hashed_password",
							},
						]),
					}),
				}),
			} as any);

			mockVerifyPassword.mockResolvedValue(true);
			mockLucia.createSession.mockResolvedValue({ id: "session_id" } as any);
			mockLucia.createSessionCookie.mockReturnValue({
				serialize: () => "session=abc123",
			} as any);

			const response = await loginLogic({
				email: "test@example.com",
				password: "password123",
			});

			expect(response.status).toBe(200);
			const data = await response.json();
			expect(data.message).toBe("ログインに成功しました");
		});

		it("should return error for missing credentials", async () => {
			const response = await loginLogic({
				email: "test@example.com",
				// missing password
			});

			expect(response.status).toBe(400);
			const data = await response.json();
			expect(data.message).toBe("メールアドレスとパスワードは必須です");
		});

		it("should return error for non-existent user", async () => {
			// Mock no user found
			mockDb.select.mockReturnValue({
				from: vi.fn().mockReturnValue({
					where: vi.fn().mockReturnValue({
						limit: vi.fn().mockResolvedValue([]),
					}),
				}),
			} as any);

			const response = await loginLogic({
				email: "nonexistent@example.com",
				password: "password123",
			});

			expect(response.status).toBe(401);
			const data = await response.json();
			expect(data.message).toBe("メールアドレスまたはパスワードが正しくありません");
		});

		it("should return error for invalid password", async () => {
			// Mock user found but invalid password
			mockDb.select.mockReturnValue({
				from: vi.fn().mockReturnValue({
					where: vi.fn().mockReturnValue({
						limit: vi.fn().mockResolvedValue([
							{
								id: "user_id",
								email: "test@example.com",
								hashedPassword: "hashed_password",
							},
						]),
					}),
				}),
			} as any);

			mockVerifyPassword.mockResolvedValue(false);

			const response = await loginLogic({
				email: "test@example.com",
				password: "wrongpassword",
			});

			expect(response.status).toBe(401);
			const data = await response.json();
			expect(data.message).toBe("メールアドレスまたはパスワードが正しくありません");
		});
	});

	describe("Logout Logic", () => {
		const logoutLogic = async (cookie: string) => {
			const sessionId = mockLucia.readSessionCookie(cookie ?? "");

			if (!sessionId) {
				return createErrorResponse("ログインしていません", 401);
			}

			await mockLucia.invalidateSession(sessionId);
			const blankSessionCookie = mockLucia.createBlankSessionCookie();

			return createJSONResponse({ message: "ログアウトしました" }, 200, {
				"Set-Cookie": blankSessionCookie.serialize(),
			});
		};

		it("should successfully logout with valid session", async () => {
			mockLucia.readSessionCookie.mockReturnValue("session_id");
			mockLucia.invalidateSession.mockResolvedValue();
			mockLucia.createBlankSessionCookie.mockReturnValue({
				serialize: () => "session=; Max-Age=0",
			} as any);

			const response = await logoutLogic("session=abc123");

			expect(response.status).toBe(200);
			const data = await response.json();
			expect(data.message).toBe("ログアウトしました");
			expect(mockLucia.invalidateSession).toHaveBeenCalledWith("session_id");
		});

		it("should return error when not logged in", async () => {
			mockLucia.readSessionCookie.mockReturnValue(null);

			const response = await logoutLogic("");

			expect(response.status).toBe(401);
			const data = await response.json();
			expect(data.message).toBe("ログインしていません");
		});
	});

	describe("Me Logic", () => {
		const meLogic = async (cookie: string) => {
			const { user } = await mockValidateRequest(cookie);

			if (!user) {
				return createErrorResponse("認証が必要です", 401);
			}

			return createJSONResponse({
				user: {
					id: user.id,
					email: user.email,
					username: user.username,
				},
			});
		};

		it("should return user data for authenticated user", async () => {
			mockValidateRequest.mockResolvedValue({
				user: {
					id: "user_id",
					email: "test@example.com",
					username: "testuser",
				},
				session: { id: "session_id" },
			});

			const response = await meLogic("session=abc123");

			expect(response.status).toBe(200);
			const data = await response.json();
			expect(data.user).toEqual({
				id: "user_id",
				email: "test@example.com",
				username: "testuser",
			});
		});

		it("should return error for unauthenticated user", async () => {
			mockValidateRequest.mockResolvedValue({
				user: null,
				session: null,
			});

			const response = await meLogic("");

			expect(response.status).toBe(401);
			const data = await response.json();
			expect(data.message).toBe("認証が必要です");
		});
	});
});