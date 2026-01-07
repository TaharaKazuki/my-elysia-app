# Elysiaのバリデーションパターン（Zod/Valibot との比較）

## TypeBoxでのカスタムバリデーション方法

TypeBoxにはZodの`.refine()`やValibotの`.pipe()`に相当する**3つのアプローチ**があります。

---

## アプローチ1: `beforeHandle` フック（推奨）

**Zodの`.refine()`と同等の機能**

```typescript
.post("/", handler, {
  body: t.Object({
    price: t.Number({ minimum: 0 }),
    discountPrice: t.Optional(t.Number({ minimum: 0 }))
  }),
  beforeHandle: ({ body, error }) => {
    // カスタムバリデーション（Zodの.refine()相当）
    if (body.discountPrice && body.discountPrice >= body.price) {
      return error(400, {
        success: false,
        message: "Discount price must be lower than regular price"
      });
    }
    // 成功時はundefinedを返す
  }
})
```

**実装例:** [src/routes/product.ts](src/routes/product.ts)

**メリット:**
- ✅ エンドポイント単位で柔軟にカスタムバリデーションを追加
- ✅ スキーマバリデーション後に実行される
- ✅ 複数フィールドの関連チェックが簡単

---

## アプローチ2: `guard` + `resolve` パターン

**複数エンドポイントで共通のバリデーションを適用**

```typescript
const orderValidation = new Elysia()
  .guard({ body: OrderSchema }, (app) =>
    app
      .resolve(({ body, error }) => {
        // 共通のカスタムバリデーション
        if (body.items.length === 0) {
          return error(400, { message: "Order must contain at least one item" });
        }
        return { body };
      })
      .post("/", handler)
      .put("/:id", handler)
  );
```

**実装例:** [src/routes/order.ts](src/routes/order.ts)

**メリット:**
- ✅ 複数エンドポイントに共通のバリデーションを適用
- ✅ DRY原則に従ったコード
- ✅ 型安全性が保たれる

---

## アプローチ3: TypeBoxカスタムスキーマ + `beforeHandle`

**スキーマレベルでの高度なバリデーション**

```typescript
// カスタムスキーマ定義
const PasswordSchema = t.String({
  minLength: 8,
  pattern: "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).*$"  // Regex（Zodの.regex()相当）
});

.post("/register", handler, {
  body: t.Object({
    password: PasswordSchema,
    confirmPassword: t.String()
  }),
  beforeHandle: ({ body, error }) => {
    // フィールド間のバリデーション
    if (body.password !== body.confirmPassword) {
      return error(400, { message: "Passwords do not match" });
    }
  }
})
```

**実装例:** [src/routes/advanced.ts](src/routes/advanced.ts)

**メリット:**
- ✅ 再利用可能なスキーマ定義
- ✅ TypeBoxの`pattern`でRegexバリデーション
- ✅ スキーマとロジックの分離

---

## Zod/Valibot との比較

| 機能 | Zod | Valibot | TypeBox (Elysia) |
|------|-----|---------|------------------|
| **基本バリデーション** | `.string()` | `string()` | `t.String()` |
| **カスタムバリデーション** | `.refine()` | `.pipe(custom())` | `beforeHandle` フック |
| **複数フィールドチェック** | `.refine()` | `.pipe()` | `beforeHandle` / `resolve` |
| **Regex** | `.regex()` | `regex()` | `t.String({ pattern: "..." })` |
| **パフォーマンス** | 遅い | 高速 | **最速** |
| **OpenAPI対応** | 別ライブラリ必要 | 別ライブラリ必要 | **ネイティブ対応** |

---

## 実践例の比較

### Zodの場合
```typescript
const schema = z.object({
  price: z.number().min(0),
  discountPrice: z.number().min(0).optional()
}).refine(
  data => !data.discountPrice || data.discountPrice < data.price,
  { message: "Discount price must be lower than regular price" }
);
```

### Elysiaの場合
```typescript
{
  body: t.Object({
    price: t.Number({ minimum: 0 }),
    discountPrice: t.Optional(t.Number({ minimum: 0 }))
  }),
  beforeHandle: ({ body, error }) => {
    if (body.discountPrice && body.discountPrice >= body.price) {
      return error(400, { message: "Discount price must be lower" });
    }
  }
}
```

---

## 推奨パターン

1. **単純な型・形式チェック** → TypeBoxスキーマ（`t.String({ format: "email" })`）
2. **単一エンドポイントのカスタムバリデーション** → `beforeHandle` フック
3. **複数エンドポイント共通のバリデーション** → `guard` + `resolve`
4. **再利用可能な複雑なスキーマ** → カスタムTypeBoxスキーマ

---

## テスト用エンドポイント

```bash
# 商品作成（discountPriceがpriceより安い必要がある）
curl -X POST http://localhost:3000/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Laptop",
    "price": 1000,
    "discountPrice": 1200,
    "category": "electronics",
    "tags": ["warranty"]
  }'

# 注文作成（itemsが空だとエラー）
curl -X POST http://localhost:3000/orders \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user123",
    "items": [],
    "totalAmount": 0
  }'

# ユーザー登録（パスワードが一致する必要がある）
curl -X POST http://localhost:3000/advanced/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Password123",
    "confirmPassword": "Password456"
  }'
```

すべてのエンドポイントは http://localhost:3000/openapi で確認できます。
