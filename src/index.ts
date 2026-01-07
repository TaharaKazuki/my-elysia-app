import { fromTypes, openapi } from "@elysiajs/openapi";
import { Elysia } from "elysia";
import { advancedRoutes } from "./routes/advanced";
import { authRoutes } from "./routes/auth";
import { hooksDemoRoutes } from "./routes/hooks-demo";
import { orderRoutes } from "./routes/order";
import { productRoutes } from "./routes/product";
import { searchRoutes } from "./routes/search";
import { userRoutes } from "./routes/user";

const app = new Elysia()
	// グローバルエラーハンドラ（全てのエラーをキャッチ）
	.onError(({ code, error, request }) => {
		console.error(`[${code}] ${request.method} ${request.url}:`, error);

		// 既に個別のハンドラで処理されている場合はスキップ
		// （ルートレベルの onError が優先される）

		return {
			success: false,
			error: code,
			message: error instanceof Error ? error.message : "An error occurred",
			path: new URL(request.url).pathname,
		};
	})
	.use(
		openapi({
			references: fromTypes(), // TypeScript型を参照
		}),
	)
	// モジュール化したルートを使用
	.use(userRoutes)
	.use(searchRoutes)
	.use(productRoutes)
	.use(orderRoutes)
	.use(advancedRoutes)
	.use(authRoutes)
	.use(hooksDemoRoutes)
	.listen(3000);

console.log(
	`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
);
