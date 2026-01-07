import { Elysia, t } from "elysia";

// カスタムエラークラス
class UserNotFoundError extends Error {
	constructor(public id: string) {
		super(`User with id ${id} not found`);
		this.name = "UserNotFoundError";
	}
}

class ValidationError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "ValidationError";
	}
}

// ユーザー関連のルートをプラグインとして定義
export const userRoutes = new Elysia({ prefix: "/users" })
	// エラーハンドラ（このプラグイン内のエラーをキャッチ）
	.onError(({ code, error, set }) => {
		console.error("Error occurred:", error);

		// カスタムエラーハンドリング
		if (error instanceof UserNotFoundError) {
			set.status = 404;
			return {
				success: false,
				error: "Not Found",
				message: error.message,
			};
		}

		if (error instanceof ValidationError) {
			set.status = 400;
			return {
				success: false,
				error: "Validation Error",
				message: error.message,
			};
		}

		// バリデーションエラー（Elysiaの組み込み）
		if (code === "VALIDATION") {
			set.status = 400;
			return {
				success: false,
				error: "Validation Error",
				message: "Invalid request data",
				details: error.message,
			};
		}

		// その他のエラー
		if (code === "NOT_FOUND") {
			set.status = 404;
			return {
				success: false,
				error: "Not Found",
				message: "Endpoint not found",
			};
		}

		// 500エラー
		set.status = 500;
		return {
			success: false,
			error: "Internal Server Error",
			message: "An unexpected error occurred",
		};
	})
	.post(
		"/",
		({ body }) => {
			// ビジネスロジックのバリデーション（カスタムValidationError）
			// スキーマは通過するが、ビジネスルールに違反する場合
			if (body.email.includes("example.com")) {
				throw new ValidationError(
					"Email addresses from example.com are not allowed",
				);
			}

			// 名前とメールアドレスの関連チェック
			if (body.name.toLowerCase() === "admin" && body.age < 18) {
				throw new ValidationError("Admin users must be 18 or older");
			}

			return {
				success: true,
				message: `User ${body.name} created`,
				user: body,
			};
		},
		{
			body: t.Object({
				name: t.String({ minLength: 1 }), // 空文字NG
				email: t.String({ format: "email" }), // メール形式
				age: t.Number({ minimum: 0, maximum: 150 }), // 0-150
			}),
		},
	)
	.get("/:id", ({ params }) => {
		// IDが特定のパターンでない場合、エラーをthrow
		if (params.id === "999") {
			throw new UserNotFoundError(params.id);
		}

		// ランダムエラーのデモ
		if (params.id === "error") {
			throw new Error("Something went wrong!");
		}

		return {
			id: params.id,
			name: "Sample User",
			email: "user@example.com",
		};
	})
	.delete("/:id", ({ params, set }) => {
		// エラーをthrowする代わりに、直接レスポンスを設定することも可能
		if (params.id === "admin") {
			set.status = 403;
			return {
				success: false,
				error: "Forbidden",
				message: "Cannot delete admin user",
			};
		}

		return {
			success: true,
			message: `User ${params.id} deleted`,
		};
	});
