import { Elysia, t } from "elysia";

// モックのユーザーデータベース
const users = new Map([
	["token123", { id: "1", name: "太郎", role: "admin" }],
	["token456", { id: "2", name: "花子", role: "user" }],
]);

// 認証が必要なエンドポイント群
export const authRoutes = new Elysia({ prefix: "/auth" })
	// resolveで認証情報を追加
	.resolve(({ headers, set }) => {
		const token = headers.authorization?.replace("Bearer ", "");

		if (!token) {
			set.status = 401;
			return {
				success: false,
				message: "Authorization header required",
			};
		}

		const user = users.get(token);

		if (!user) {
			set.status = 401;
			return {
				success: false,
				message: "Invalid token",
			};
		}

		// userをreturn → 全てのハンドラで使える
		return { user };
	})
	// ↓ 以下の全エンドポイントで { user } が使える
	.get("/profile", ({ user }) => {
		return {
			success: true,
			user,
		};
	})
	.put(
		"/profile",
		({ user, body }) => {
			return {
				success: true,
				message: `Updated profile for ${user.name}`,
				user: { ...user, ...body },
			};
		},
		{
			body: t.Object({
				name: t.Optional(t.String()),
			}),
		},
	)
	// 管理者専用エンドポイント
	.get("/admin/users", ({ user, set }) => {
		if (user.role !== "admin") {
			set.status = 403;
			return {
				success: false,
				message: "Admin only",
			};
		}

		return {
			success: true,
			users: Array.from(users.values()),
		};
	});
