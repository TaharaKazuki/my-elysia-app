import { Elysia, t } from "elysia";

export const hooksDemoRoutes = new Elysia({ prefix: "/hooks-demo" })
	// 1. Local Hook の例
	.post(
		"/local-hook",
		({ body }) => {
			return {
				success: true,
				message: "Local hook example",
				data: body,
			};
		},
		{
			body: t.Object({
				name: t.String(),
			}),
			// Local beforeHandle
			beforeHandle: ({ body }) => {
				console.log("[Local beforeHandle] Body:", body);
			},
			// Local afterHandle
			afterHandle: ({ response }) => {
				console.log("[Local afterHandle] Response:", response);
			},
			// Local transform (バリデーション前のデータ変換)
			transform: ({ body }) => {
				console.log("[Local transform] Original body:", body);
				// データを変換できる（例: 大文字に変換）
				if (typeof body === "object" && body !== null && "name" in body) {
					(body as { name: string }).name = (
						body as { name: string }
					).name.toUpperCase();
				}
			},
		},
	)
	// 2. Intercept Hook の例
	.get(
		"/intercept-example",
		() => {
			return {
				success: true,
				message: "Intercept hook example",
			};
		},
		{
			// beforeHandle をインターセプト
			beforeHandle: [
				// 複数のbeforeHandleを配列で指定できる
				({ request }) => {
					console.log("[beforeHandle 1] Request URL:", request.url);
				},
				({ request }) => {
					console.log("[beforeHandle 2] Request method:", request.method);
				},
			],
			// afterHandle をインターセプト（レスポンスを加工）
			afterHandle: ({ response, set }) => {
				console.log("[afterHandle] Original response:", response);

				// レスポンスを加工
				if (
					typeof response === "object" &&
					response !== null &&
					"success" in response
				) {
					set.headers["x-custom-header"] = "added-by-afterHandle";
					return {
						...response,
						timestamp: new Date().toISOString(),
					};
				}
			},
		},
	)
	// 3. グローバルフックとローカルフックの組み合わせ
	.onBeforeHandle(() => {
		console.log("[Global beforeHandle] 全エンドポイントで実行");
	})
	.get(
		"/combined",
		() => {
			console.log("[Handler] ハンドラ実行");
			return { message: "Combined hooks example" };
		},
		{
			beforeHandle: () => {
				console.log("[Local beforeHandle] このエンドポイントでのみ実行");
			},
		},
	)
	// 実行順序: Global beforeHandle → Local beforeHandle → Handler
	// 4. mapResponse でレスポンス全体を変換
	.get(
		"/map-response",
		() => {
			return { data: "original" };
		},
		{
			afterHandle: ({ response, set }) => {
				// レスポンスを完全に書き換え
				set.headers["content-type"] = "application/json";
				return {
					meta: {
						version: "1.0",
						timestamp: Date.now(),
					},
					payload: response,
				};
			},
		},
	);
