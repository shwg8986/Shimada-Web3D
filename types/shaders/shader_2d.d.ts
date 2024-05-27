export declare const vertexShader_2d = "\n  varying vec2 vUv;\n  void main() {\n    vUv = uv;\n    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);\n  }\n";
export declare const fragmentShader_2d = "\n  uniform sampler2D videoTexture;\n  varying vec2 vUv;\n  void main() {\n    vec2 uv = vUv;\n    gl_FragColor = texture2D(videoTexture, uv);\n  }\n";
