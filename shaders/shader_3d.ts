// カスタムシェーダーマテリアル
// 立体感を出すため、視線と法線の角度差(フレネル)に応じて球の縁を淡く光らせる。
// パノラマ本体の明るさは変えず、縁だけにリムライトを加算するので、
// 外から見ると“ガラス球”のような曲面として認識される。
export const vertexShader_3d = `
  varying vec2 vUv;
  varying vec3 vViewNormal;   // ビュー空間の法線
  varying vec3 vViewDir;      // フラグメント→カメラ方向(ビュー空間)
  void main() {
    vUv = uv;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    vViewNormal = normalMatrix * normal;
    vViewDir = -mvPosition.xyz;
    gl_Position = projectionMatrix * mvPosition;
  }
`;

export const fragmentShader_3d = `
    uniform sampler2D videoTexture;
    uniform float rimStrength;  // リムライトの強さ(0で無効)
    uniform vec3 rimColor;      // リムライトの色
    varying vec2 vUv;
    varying vec3 vViewNormal;
    varying vec3 vViewDir;
    void main() {
      vec2 uv = vUv;
      uv.x = 1.0 - uv.x; // 水平方向に反転
      vec4 tex = texture2D(videoTexture, uv);

      // フレネル: 視線に対して法線が寝ている(縁)ほど 1 に近づく
      vec3 N = normalize(vViewNormal);
      vec3 V = normalize(vViewDir);
      float fresnel = pow(1.0 - abs(dot(N, V)), 4.0);

      vec3 color = tex.rgb + rimColor * fresnel * rimStrength;
      gl_FragColor = vec4(color, tex.a);
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
