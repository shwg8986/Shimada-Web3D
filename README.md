# Three.js-Boilerplate-TS-Vite

A Three.js Boilerplate for TypeScript Vite projects.

This boilerplate is supplementary to <!--my book titled [**Three.js and TypeScript**](https://amzn.to/3FahROZ) and--> my **ThreeJS and TypeScript** courses at [Udemy](https://www.udemy.com/course/threejs-tutorials/?referralCode=4C7E1DE91C3E42F69D0F) and [YouTube (Channel membership required)](https://www.youtube.com/playlist?list=PLKWUX7aMnlEKTmkBqwjc-tZgULJdNBjEd)

[Introductory Video](https://youtu.be/cZWAqrJhtvQ&list=PLKWUX7aMnlEKTmkBqwjc-tZgULJdNBjEd)

[Course Discount Coupons](https://sbcode.net/coupons#threejs)

## Boilerplate Overview

When run, the boilerplate shows a multi-coloured wireframe cube, with `OrbitControls`, `Dat.GUI` and `Stats.js` included.

[Example](https://sean-bradley.github.io/Three.js-Boilerplate-TS-Vite/)

![](docs/screengrab.jpg)

## Installing

```bash
git clone https://github.com/Sean-Bradley/Three.js-Boilerplate-TS-Vite.git
cd Three.js-Boilerplate-TS-Vite
npm install
```

### Develop

```
npm run dev
```

Visit [http://localhost:5173/](http://localhost:5173/)

### Build Production

```bash
npm run build
npm run preview
```

Visit [http://localhost:4173/](http://localhost:4173/)

[https://sean-bradley.github.io/Three.js-Boilerplate-TS-Vite/](https://sean-bradley.github.io/Three.js-Boilerplate-TS-Vite/)


### firebaseで更新したいとき(自分用メモ)


```
firebase login
```

```
firebase init
```
ここでWhat do you want to use as your public directory?と聞かれるので、distと入力し、Enter。
Configure as a single-page app (rewrite all urls to /index.html)?と聞かれたらN, File public/index.html already exists. Overwrite?と聞かれるのでNと答えていく。

```ビルド
npm run build
```

```デプロイ前の確認
npm run preview
```

```デプロイ
firebase deploy
```
