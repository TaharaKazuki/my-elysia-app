import { fromTypes, openapi } from "@elysiajs/openapi";
import { Elysia } from "elysia";

const app = new Elysia()
	.use(
		openapi({
			references: fromTypes(), // TypeScript型を参照
		}),
	)
	.get("/", () => "Hello Elysia")
	.listen(3000);

console.log(
	`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
);
