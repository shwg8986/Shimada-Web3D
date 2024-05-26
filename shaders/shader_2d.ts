export const vertexShader_2d = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const fragmentShader_2d = `
  uniform sampler2D videoTexture;
  varying vec2 vUv;
  void main() {
    vec2 uv = vUv;
    gl_FragColor = texture2D(videoTexture, uv);
  }
`;
