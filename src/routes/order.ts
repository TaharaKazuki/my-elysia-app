import { Elysia, t } from "elysia";

// アプローチ2: guard パターンで複数エンドポイントに共通のカスタムバリデーションを適用
const orderValidation = new Elysia()
	.guard(
		{
			body: t.Object({
				userId: t.String(),
				items: t.Array(
					t.Object({
						productId: t.String(),
						quantity: t.Number({ minimum: 1 }),
					}),
				),
				totalAmount: t.Number({ minimum: 0 }),
			}),
		},
		(app) =>
			app
				// resolveでカスタムバリデーション（全エンドポイント共通）
				.resolve(({ body, set }) => {
					// ビジネスロジック: 注文アイテムは最低1つ必要
					if (body.items.length === 0) {
						set.status = 400;
						return {
							success: false,
							error: "Validation Error",
							message: "Order must contain at least one item",
						};
					}

					// ビジネスロジック: totalAmountの整合性チェック
					const calculatedTotal = body.items.reduce(
						(sum, item) => sum + item.quantity * 100, // 仮の計算
						0,
					);

					if (Math.abs(body.totalAmount - calculatedTotal) > 0.01) {
						set.status = 400;
						return {
							success: false,
							error: "Validation Error",
							message: "Total amount does not match items",
						};
					}

					return { body };
				})
				.post("/", ({ body }) => {
					return {
						success: true,
						message: "Order created",
						order: body,
					};
				})
				.put("/:id", ({ params, body }) => {
					return {
						success: true,
						message: `Order ${params.id} updated`,
						order: body,
					};
				}),
	);

export const orderRoutes = orderValidation;
