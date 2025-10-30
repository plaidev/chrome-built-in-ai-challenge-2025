# Node.js 20 slimイメージを使用（linux/amd64プラットフォーム指定）
FROM --platform=linux/amd64 node:20-slim

# 作業ディレクトリを設定
WORKDIR /app

# package.jsonとpackage-lock.jsonをコピー
COPY package*.json ./

# 本番環境用の依存関係をインストール
RUN npm ci --only=production

# アプリケーションのソースコードをコピー
COPY . .

# Cloud RunがHTTPリクエストを送信するポート
ENV PORT=8080
EXPOSE 8080

# ヘルスチェック設定
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8080/health', (r) => {r.statusCode === 200 ? process.exit(0) : process.exit(1)})"

# アプリケーションを起動
CMD ["node", "server.js"]
