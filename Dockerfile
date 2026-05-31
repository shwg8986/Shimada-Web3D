# ベースイメージを指定
FROM node:18.15.0

# 作業ディレクトリを設定
WORKDIR /app

# パッケージファイルをコピー
COPY package*.json ./

# パッケージをインストール
RUN npm install

# 残りのファイルをコピー
COPY . .

# ビルドコマンドを実行
RUN npm run build

CMD ["npm", "run", "deploy"]