// カスタムシェーダーマテリアル
export const vertexShader_3d = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const fragmentShader_3d = `
    uniform sampler2D videoTexture;
    varying vec2 vUv;
    void main() {
      vec2 uv = vUv;
      uv.x = 1.0 - uv.x; // 水平方向に反転
      gl_FragColor = texture2D(videoTexture, uv);
    }
`;

//　マスク付けたい時
// export const fragmentShader = `
//   uniform sampler2D videoTexture;
//   varying vec2 vUv;
//   void main() {
//     vec2 uv = vUv;

//   // マスク範囲の設定 (ここでは南極付近をマスク)
//   float maskY = 0.2; // 0.2以下のY座標をマスク
//   if (uv.y < maskY) {
//     gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0); // 黒で塗りつぶす
//   } else {
//     uv.x = 1.0 - uv.x; // 水平方向に反転
//     gl_FragColor = texture2D(videoTexture, uv);
//   }
