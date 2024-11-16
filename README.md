# Three.js with TypeScript/Vite projects.

## firebase で更新したいとき(自分用メモ)

```
firebase login
```

```
firebase init
```

ここで What do you want to use as your public directory?と聞かれるので、dist と入力し、Enter。
Configure as a single-page app (rewrite all urls to /index.html)?と聞かれたら N, File public/index.html already exists. Overwrite?と聞かれるので N と答えていく。

### ビルド

```
npm run build
```

### デプロイ前の確認

```
npm run preview
```

### デプロイ

```
firebase deploy
```

## Firebaseデプロイ手順 参考サイト

https://qiita.com/shikichee/items/e547fa2a22d2f6991dac

https://zenn.dev/kazhack/articles/21ea0ba46f3fce
