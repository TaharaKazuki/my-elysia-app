import { Elysia, t } from "elysia";

// 検索関連のルートをプラグインとして定義
export const searchRoutes = new Elysia({ prefix: "/search" }).get(
	"/",
	({ query }) => {
		return {
			query: query.q,
			page: query.page,
			limit: query.limit,
			results: [
				// モックデータ
				{ id: 1, title: "Result 1" },
				{ id: 2, title: "Result 2" },
			],
		};
	},
	{
		query: t.Object({
			q: t.String(),
			page: t.Optional(t.Number({ minimum: 1, default: 1 })),
			limit: t.Optional(t.Number({ minimum: 1, maximum: 100, default: 10 })),
		}),
	},
);
