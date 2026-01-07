# バリデーションエラーのテスト

## 1. Elysiaの組み込みバリデーションエラー (code === "VALIDATION")

TypeBoxスキーマに違反した場合に発生します。

```bash
# 例1: emailフォーマットが不正
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{"name":"太郎","email":"invalid-email","age":25}'

# 期待されるレスポンス:
# {
#   "success": false,
#   "error": "Validation Error",
#   "message": "Invalid request data",
#   "details": "..."
# }
```

```bash
# 例2: nameが空文字（minLength: 1に違反）
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{"name":"","email":"test@example.com","age":25}'
```

```bash
# 例3: ageが範囲外（maximum: 150に違反）
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{"name":"太郎","email":"test@example.com","age":200}'
```

## 2. カスタムValidationError (error instanceof ValidationError)

ハンドラ内で明示的にthrowした場合に発生します。

```bash
# ビジネスロジックでのバリデーション
# （現在のコードでは body.age < 0 をチェックしていますが、
#  t.Number({ minimum: 0 }) があるため、実際にはスキーマで弾かれます）

# より明確な例を見るために、コードを更新してみましょう
```

## 使い分け

- **スキーマバリデーション** (`code === "VALIDATION"`): データ型や基本的な制約（必須、型、フォーマット、範囲）
- **カスタムバリデーション** (`instanceof`): ビジネスロジック、複雑な条件、他のフィールドとの関連チェック
