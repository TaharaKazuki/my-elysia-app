import { Elysia, t } from "elysia";

// アプローチ3: TypeBoxのカスタムスキーマ定義
// より複雑なバリデーションルールをスキーマレベルで定義

// カスタムスキーマ: パスワードバリデーション
const PasswordSchema = t.String({
	minLength: 8,
	// TypeBoxではpatternでRegexを使える（Zodの.regex()相当）
	pattern: "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).*$",
	description:
		"Password must be at least 8 characters with uppercase, lowercase, and number",
});

// カスタムスキーマ: 日付範囲バリデーション
const DateRangeSchema = t.Object({
	startDate: t.String({ format: "date" }),
	endDate: t.String({ format: "date" }),
});

export const advancedRoutes = new Elysia({ prefix: "/advanced" })
	.post(
		"/register",
		({ body }) => {
			return {
				success: true,
				message: "User registered",
				user: { email: body.email },
			};
		},
		{
			body: t.Object({
				email: t.String({ format: "email" }),
				password: PasswordSchema, // カスタムスキーマ使用
				confirmPassword: t.String(),
			}),
			beforeHandle: ({ body, set }) => {
				// パスワードと確認パスワードの一致チェック
				if (body.password !== body.confirmPassword) {
					set.status = 400;
					return {
						success: false,
						error: "Validation Error",
						message: "Passwords do not match",
					};
				}
			},
		},
	)
	.post(
		"/booking",
		({ body }) => {
			return {
				success: true,
				message: "Booking created",
				booking: body,
			};
		},
		{
			body: DateRangeSchema,
			beforeHandle: ({ body, set }) => {
				// 日付範囲のバリデーション
				const start = new Date(body.startDate);
				const end = new Date(body.endDate);

				if (start >= end) {
					set.status = 400;
					return {
						success: false,
						error: "Validation Error",
						message: "End date must be after start date",
					};
				}

				// 未来の日付のみ許可
				const now = new Date();
				if (start < now) {
					set.status = 400;
					return {
						success: false,
						error: "Validation Error",
						message: "Start date must be in the future",
					};
				}
			},
		},
	);
