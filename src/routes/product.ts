import { Elysia, t } from "elysia";

// アプローチ1: beforeHandle フックでカスタムバリデーション（Zodの.refine()相当）
export const productRoutes = new Elysia({ prefix: "/products" }).post(
	"/",
	({ body }) => {
		return {
			success: true,
			message: "Product created",
			product: body,
		};
	},
	{
		body: t.Object({
			name: t.String({ minLength: 1 }),
			price: t.Number({ minimum: 0 }),
			discountPrice: t.Optional(t.Number({ minimum: 0 })),
			category: t.String(),
			tags: t.Array(t.String()),
		}),
		// beforeHandle でカスタムバリデーション（Zodの.refine()相当）
		beforeHandle: ({ body, set }) => {
			// ビジネスロジック: discountPriceはpriceより低い必要がある
			if (body.discountPrice && body.discountPrice >= body.price) {
				set.status = 400;
				return {
					success: false,
					error: "Validation Error",
					message: "Discount price must be lower than regular price",
				};
			}

			// ビジネスロジック: 特定のカテゴリは特定のタグが必須
			if (body.category === "electronics" && !body.tags.includes("warranty")) {
				set.status = 400;
				return {
					success: false,
					error: "Validation Error",
					message: "Electronics must have 'warranty' tag",
				};
			}

			// バリデーション成功時は何も返さない（undefinedを返す）
		},
	},
);
