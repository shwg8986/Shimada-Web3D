// 幾何学アート生成関数

export type ArtType = 'ripple' | 'spiral' | 'grid' | 'voronoi' | 'radial';
export type PerformanceMode = 'high' | 'low';

export class GeometricArtGenerator {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private animationTime: number = 0;
  private performanceMode: PerformanceMode;

  constructor(width: number = 1024, height: number = 512, performanceMode: PerformanceMode = 'high') {
    this.canvas = document.createElement('canvas');
    this.canvas.width = width;
    this.canvas.height = height;
    this.ctx = this.canvas.getContext('2d')!;
    this.performanceMode = performanceMode;
  }

  getCanvas(): HTMLCanvasElement {
    return this.canvas;
  }

  update(deltaTime: number = 0.016) {
    this.animationTime += deltaTime;
  }

  // 1. Profile用 - 複雑な幾何学的フラクタルパターン
  drawRipplePattern() {
    const { width, height } = this.canvas;
    const ctx = this.ctx;
    const centerX = width / 2;
    const centerY = height / 2;
    const isLowPerf = this.performanceMode === 'low';

    // 動的なグラデーション背景
    const gradient = ctx.createRadialGradient(
      centerX + Math.cos(this.animationTime * 0.3) * 50,
      centerY + Math.sin(this.animationTime * 0.3) * 50,
      0,
      centerX,
      centerY,
      width * 0.7
    );
    gradient.addColorStop(0, '#0a0e27');
    gradient.addColorStop(0.5, '#1a1a2e');
    gradient.addColorStop(1, '#16213e');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // 複数層の回転する多角形（スマホでは3層、PCでは5層）
    const polygonLayers = isLowPerf ? 3 : 5;
    for (let layer = 0; layer < polygonLayers; layer++) {
      const sides = 6 + layer;
      const radius = 80 + layer * 40;
      const rotation = this.animationTime * (0.3 + layer * 0.1) * (layer % 2 === 0 ? 1 : -1);
      const hue = (this.animationTime * 30 + layer * 60) % 360;

      ctx.strokeStyle = `hsla(${hue}, 70%, 60%, 0.6)`;
      ctx.lineWidth = 2;
      ctx.beginPath();

      for (let i = 0; i <= sides; i++) {
        const angle = (i / sides) * Math.PI * 2 + rotation;
        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius;
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();

      // 頂点に光る点を追加
      for (let i = 0; i < sides; i++) {
        const angle = (i / sides) * Math.PI * 2 + rotation;
        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius;

        const dotGradient = ctx.createRadialGradient(x, y, 0, x, y, 5);
        dotGradient.addColorStop(0, `hsla(${hue}, 80%, 80%, 1)`);
        dotGradient.addColorStop(1, `hsla(${hue}, 70%, 50%, 0)`);
        ctx.fillStyle = dotGradient;
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // パーティクルシステム（軌道を描く点）（スマホでは30、PCでは80）
    const particleCount = isLowPerf ? 30 : 80;
    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * Math.PI * 2;
      const distance = 150 + 80 * Math.sin(this.animationTime * 2 + i * 0.3);
      const x = centerX + Math.cos(angle + this.animationTime * 0.5) * distance;
      const y = centerY + Math.sin(angle + this.animationTime * 0.5) * distance;

      const size = 2 + Math.sin(this.animationTime * 3 + i) * 1.5;
      const hue = (i * 360 / particleCount + this.animationTime * 50) % 360;

      const particleGradient = ctx.createRadialGradient(x, y, 0, x, y, size * 2);
      particleGradient.addColorStop(0, `hsla(${hue}, 80%, 70%, 0.9)`);
      particleGradient.addColorStop(1, `hsla(${hue}, 70%, 50%, 0)`);
      ctx.fillStyle = particleGradient;
      ctx.beginPath();
      ctx.arc(x, y, size * 2, 0, Math.PI * 2);
      ctx.fill();
    }

    // フラクタル風の線パターン（スマホでは6本、PCでは12本）
    const lineCount = isLowPerf ? 6 : 12;
    for (let i = 0; i < lineCount; i++) {
      const baseAngle = (i / lineCount) * Math.PI * 2;
      const rotation = this.animationTime * 0.4;

      ctx.beginPath();
      ctx.strokeStyle = `hsla(${(i * 30 + this.animationTime * 40) % 360}, 65%, 55%, 0.4)`;
      ctx.lineWidth = 1.5;

      const pointsPerLine = isLowPerf ? 25 : 50;
      for (let j = 0; j < pointsPerLine; j++) {
        const t = j / pointsPerLine;
        const angle = baseAngle + rotation + Math.sin(t * Math.PI * 3 + this.animationTime) * 0.5;
        const radius = 50 + t * 180 + Math.sin(t * Math.PI * 2 + this.animationTime * 2) * 20;
        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius;

        if (j === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();
    }

    // 中央の複雑なローズカーブ（スマホでは低解像度）
    const petalCount = 5;
    ctx.beginPath();
    ctx.strokeStyle = `hsla(${this.animationTime * 60 % 360}, 80%, 70%, 0.8)`;
    ctx.lineWidth = 3;

    const roseSteps = isLowPerf ? 180 : 360;
    for (let i = 0; i <= roseSteps; i++) {
      const angle = (i / (roseSteps / 2)) * Math.PI;
      const k = petalCount + Math.sin(this.animationTime * 0.5) * 2;
      const r = 60 * Math.cos(k * angle);
      const x = centerX + r * Math.cos(angle + this.animationTime * 0.3);
      const y = centerY + r * Math.sin(angle + this.animationTime * 0.3);

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.stroke();

    // 中央の光る核
    const coreGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 30);
    const coreHue = (this.animationTime * 80) % 360;
    coreGradient.addColorStop(0, `hsla(${coreHue}, 90%, 80%, 1)`);
    coreGradient.addColorStop(0.5, `hsla(${coreHue}, 80%, 60%, 0.6)`);
    coreGradient.addColorStop(1, `hsla(${coreHue}, 70%, 40%, 0)`);
    ctx.fillStyle = coreGradient;
    ctx.beginPath();
    ctx.arc(centerX, centerY, 30 + Math.sin(this.animationTime * 2) * 5, 0, Math.PI * 2);
    ctx.fill();

    // 外周のエネルギーリング（スマホでは省略）
    if (!isLowPerf) {
      const ringCount = 3;
      for (let i = 0; i < ringCount; i++) {
        const baseRadius = 280 + i * 30;
        const offset = (this.animationTime + i * 2) % 6;
        const radius = baseRadius + Math.sin(this.animationTime * 2 + i) * 10;

        ctx.globalAlpha = 0.5 - i * 0.1;
        ctx.strokeStyle = `hsla(${(this.animationTime * 50 + i * 120) % 360}, 75%, 65%, 1)`;
        ctx.lineWidth = 3;
        ctx.setLineDash([10, 10]);
        ctx.lineDashOffset = -offset * 10;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }

    ctx.globalAlpha = 1;
  }

  // 2. Experience用 - スパイラルパターン
  drawSpiralPattern() {
    const { width, height } = this.canvas;
    const ctx = this.ctx;
    const centerX = width / 2;
    const centerY = height / 2;
    const isLowPerf = this.performanceMode === 'low';

    // グラデーション背景
    const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, width / 2);
    gradient.addColorStop(0, '#2c003e');
    gradient.addColorStop(1, '#1a1a1d');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // スパイラルを描画（スマホでは3本、PCでは5本）
    const spiralCount = isLowPerf ? 3 : 5;
    for (let s = 0; s < spiralCount; s++) {
      ctx.beginPath();
      ctx.strokeStyle = `hsl(${(s * 60 + this.animationTime * 20) % 360}, 70%, 50%)`;
      ctx.lineWidth = 3;

      let angle = s * (Math.PI * 2 / spiralCount);
      const spiralPoints = isLowPerf ? 100 : 200;
      for (let i = 0; i < spiralPoints; i++) {
        const t = i / 20;
        const r = t * 15 + this.animationTime * 10;
        const x = centerX + r * Math.cos(angle + this.animationTime * 0.5);
        const y = centerY + r * Math.sin(angle + this.animationTime * 0.5);

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
        angle += 0.1;
      }
      ctx.stroke();
    }
  }

  // 3. Education用 - 幾何学的グリッドパターン
  drawGridPattern() {
    const { width, height } = this.canvas;
    const ctx = this.ctx;
    const isLowPerf = this.performanceMode === 'low';

    // 背景
    ctx.fillStyle = '#0d1b2a';
    ctx.fillRect(0, 0, width, height);

    const gridSize = isLowPerf ? 80 : 60;
    const cols = Math.ceil(width / gridSize);
    const rows = Math.ceil(height / gridSize);

    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        const x = i * gridSize;
        const y = j * gridSize;

        // 各セルの色を時間とポジションで変化
        const offset = Math.sin(this.animationTime * 2 + i * 0.5 + j * 0.5) * 0.5 + 0.5;
        const hue = (i * 10 + j * 10 + this.animationTime * 50) % 360;

        ctx.fillStyle = `hsla(${hue}, 60%, ${30 + offset * 20}%, 0.8)`;
        ctx.fillRect(x + 2, y + 2, gridSize - 4, gridSize - 4);

        // 枠線
        ctx.strokeStyle = '#415a77';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, gridSize, gridSize);

        // 中央に小さな円
        const centerX = x + gridSize / 2;
        const centerY = y + gridSize / 2;
        const radius = (Math.sin(this.animationTime * 3 + i + j) * 0.5 + 0.5) * gridSize * 0.3;

        ctx.fillStyle = '#e0e1dd';
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  // 4. Publication用 - ボロノイ風パターン
  drawVoronoiPattern() {
    const { width, height } = this.canvas;
    const ctx = this.ctx;
    const isLowPerf = this.performanceMode === 'low';

    // 背景
    ctx.fillStyle = '#240046';
    ctx.fillRect(0, 0, width, height);

    // ボロノイセルの中心点を生成（スマホでは15点、PCでは30点）
    const points: { x: number; y: number; color: string }[] = [];
    const pointCount = isLowPerf ? 15 : 30;

    for (let i = 0; i < pointCount; i++) {
      const angle = (i / pointCount) * Math.PI * 2;
      const radius = (Math.sin(this.animationTime + i) * 0.3 + 0.7) * Math.min(width, height) * 0.4;
      points.push({
        x: width / 2 + Math.cos(angle + this.animationTime * 0.3) * radius,
        y: height / 2 + Math.sin(angle + this.animationTime * 0.3) * radius,
        color: `hsl(${(i * 360 / pointCount + this.animationTime * 20) % 360}, 70%, 50%)`
      });
    }

    // 各ピクセルを最も近い点の色で塗る（簡易的なボロノイ）
    const step = isLowPerf ? 8 : 4; // スマホでは8ピクセルスキップ、PCでは4ピクセル

    for (let x = 0; x < width; x += step) {
      for (let y = 0; y < height; y += step) {
        let minDist = Infinity;
        let closestPoint = points[0];

        for (const point of points) {
          const dist = Math.hypot(x - point.x, y - point.y);
          if (dist < minDist) {
            minDist = dist;
            closestPoint = point;
          }
        }

        // 色を設定（境界線を強調）
        const brightness = minDist < 5 ? 0 : 1;
        ctx.fillStyle = closestPoint.color;
        ctx.globalAlpha = 0.7 * brightness;
        ctx.fillRect(x, y, step, step);
      }
    }

    ctx.globalAlpha = 1;

    // 点を描画
    points.forEach(point => {
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(point.x, point.y, 3, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  // 5. Link用 - ネットワークつながりパターン（人と人とのつながり）
  drawRadialPattern() {
    const { width, height } = this.canvas;
    const ctx = this.ctx;
    const centerX = width / 2;
    const centerY = height / 2;
    const isLowPerf = this.performanceMode === 'low';

    // 深い宇宙のような背景
    const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, width / 2);
    gradient.addColorStop(0, '#0d1117');
    gradient.addColorStop(0.5, '#161b22');
    gradient.addColorStop(1, '#010409');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // ノード（人）の位置を定義（スマホでは12個、PCでは25個）
    const nodes: { x: number; y: number; vx: number; vy: number; size: number; hue: number; connections: number[] }[] = [];
    const nodeCount = isLowPerf ? 12 : 25;

    // ノードを配置（有機的に動く）
    for (let i = 0; i < nodeCount; i++) {
      const angle = (i / nodeCount) * Math.PI * 2 + this.animationTime * 0.2;
      const radiusVariation = Math.sin(this.animationTime * 0.5 + i) * 30;
      const baseRadius = 120 + (i % 3) * 60;
      const radius = baseRadius + radiusVariation;

      const x = centerX + Math.cos(angle) * radius + Math.sin(this.animationTime * 0.3 + i * 2) * 20;
      const y = centerY + Math.sin(angle) * radius + Math.cos(this.animationTime * 0.3 + i * 2) * 20;

      nodes.push({
        x,
        y,
        vx: Math.cos(angle) * 0.5,
        vy: Math.sin(angle) * 0.5,
        size: 4 + Math.sin(this.animationTime + i) * 2,
        hue: (i * 360 / nodeCount + this.animationTime * 20) % 360,
        connections: []
      });
    }

    // つながりを計算（距離ベース）
    const maxConnectionDistance = 180;
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < maxConnectionDistance) {
          nodes[i].connections.push(j);
          nodes[j].connections.push(i);
        }
      }
    }

    // つながり（エッジ）を描画
    const drawnConnections = new Set<string>();
    for (let i = 0; i < nodes.length; i++) {
      const node1 = nodes[i];

      for (const j of node1.connections) {
        const connectionKey = i < j ? `${i}-${j}` : `${j}-${i}`;
        if (drawnConnections.has(connectionKey)) continue;
        drawnConnections.add(connectionKey);

        const node2 = nodes[j];
        const dx = node1.x - node2.x;
        const dy = node1.y - node2.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const strength = 1 - (distance / maxConnectionDistance);

        // データが流れるアニメーション
        const flowOffset = (this.animationTime * 30 + i + j) % 20;

        // グラデーションライン
        const lineGradient = ctx.createLinearGradient(node1.x, node1.y, node2.x, node2.y);
        const avgHue = (node1.hue + node2.hue) / 2;
        lineGradient.addColorStop(0, `hsla(${node1.hue}, 70%, 60%, ${strength * 0.6})`);
        lineGradient.addColorStop(0.5, `hsla(${avgHue}, 80%, 70%, ${strength * 0.8})`);
        lineGradient.addColorStop(1, `hsla(${node2.hue}, 70%, 60%, ${strength * 0.6})`);

        ctx.strokeStyle = lineGradient;
        ctx.lineWidth = strength * 2.5;
        ctx.beginPath();
        ctx.moveTo(node1.x, node1.y);
        ctx.lineTo(node2.x, node2.y);
        ctx.stroke();

        // データパケット（流れる点）を描画
        const t = (flowOffset / 20);
        const packetX = node1.x + (node2.x - node1.x) * t;
        const packetY = node1.y + (node2.y - node1.y) * t;

        const packetGradient = ctx.createRadialGradient(packetX, packetY, 0, packetX, packetY, 4);
        packetGradient.addColorStop(0, `hsla(${avgHue}, 90%, 80%, 1)`);
        packetGradient.addColorStop(1, `hsla(${avgHue}, 80%, 60%, 0)`);
        ctx.fillStyle = packetGradient;
        ctx.beginPath();
        ctx.arc(packetX, packetY, 4, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // ノード（人）を描画
    nodes.forEach((node, index) => {
      const pulseSize = node.size + Math.sin(this.animationTime * 2 + index * 0.5) * 1;

      // 外側のオーラ
      const auraGradient = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, pulseSize * 4);
      auraGradient.addColorStop(0, `hsla(${node.hue}, 80%, 70%, 0.4)`);
      auraGradient.addColorStop(1, `hsla(${node.hue}, 70%, 50%, 0)`);
      ctx.fillStyle = auraGradient;
      ctx.beginPath();
      ctx.arc(node.x, node.y, pulseSize * 4, 0, Math.PI * 2);
      ctx.fill();

      // ノード本体
      const nodeGradient = ctx.createRadialGradient(
        node.x - pulseSize * 0.3,
        node.y - pulseSize * 0.3,
        0,
        node.x,
        node.y,
        pulseSize * 2
      );
      nodeGradient.addColorStop(0, `hsla(${node.hue}, 90%, 85%, 1)`);
      nodeGradient.addColorStop(0.7, `hsla(${node.hue}, 80%, 65%, 1)`);
      nodeGradient.addColorStop(1, `hsla(${node.hue}, 70%, 45%, 0.8)`);

      ctx.fillStyle = nodeGradient;
      ctx.beginPath();
      ctx.arc(node.x, node.y, pulseSize * 2, 0, Math.PI * 2);
      ctx.fill();

      // ノードの縁取り
      ctx.strokeStyle = `hsla(${node.hue}, 90%, 90%, 0.9)`;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // 接続数を示す内側のリング
      if (node.connections.length > 0) {
        ctx.strokeStyle = `hsla(${node.hue}, 85%, 75%, 0.7)`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(node.x, node.y, pulseSize, 0, Math.PI * 2);
        ctx.stroke();
      }
    });

    // 中央のハブノード（コアとなる存在）
    const hubSize = 18 + Math.sin(this.animationTime * 1.5) * 4;
    const hubHue = (this.animationTime * 60) % 360;

    // ハブのオーラ（波紋）
    for (let i = 0; i < 3; i++) {
      const waveRadius = hubSize * (2 + i) + Math.sin(this.animationTime * 2 - i * 0.5) * 10;
      ctx.strokeStyle = `hsla(${hubHue}, 85%, 70%, ${0.3 - i * 0.1})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(centerX, centerY, waveRadius, 0, Math.PI * 2);
      ctx.stroke();
    }

    // ハブノード本体
    const hubGradient = ctx.createRadialGradient(
      centerX - hubSize * 0.3,
      centerY - hubSize * 0.3,
      0,
      centerX,
      centerY,
      hubSize
    );
    hubGradient.addColorStop(0, `hsla(${hubHue}, 100%, 95%, 1)`);
    hubGradient.addColorStop(0.5, `hsla(${hubHue}, 90%, 75%, 1)`);
    hubGradient.addColorStop(1, `hsla(${hubHue}, 80%, 55%, 1)`);

    ctx.fillStyle = hubGradient;
    ctx.beginPath();
    ctx.arc(centerX, centerY, hubSize, 0, Math.PI * 2);
    ctx.fill();

    // ハブの輝き
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();

    // ハブから放射されるエネルギー（スマホでは4本、PCでは8本）
    const rayCount = isLowPerf ? 4 : 8;
    for (let i = 0; i < rayCount; i++) {
      const angle = (i / rayCount) * Math.PI * 2 + this.animationTime * 0.5;
      const rayLength = 30 + Math.sin(this.animationTime * 3 + i) * 15;

      const startX = centerX + Math.cos(angle) * hubSize;
      const startY = centerY + Math.sin(angle) * hubSize;
      const endX = centerX + Math.cos(angle) * (hubSize + rayLength);
      const endY = centerY + Math.sin(angle) * (hubSize + rayLength);

      const rayGradient = ctx.createLinearGradient(startX, startY, endX, endY);
      rayGradient.addColorStop(0, `hsla(${hubHue}, 90%, 80%, 0.8)`);
      rayGradient.addColorStop(1, `hsla(${hubHue}, 80%, 60%, 0)`);

      ctx.strokeStyle = rayGradient;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(endX, endY);
      ctx.stroke();
    }
  }

  // パターンタイプに応じて描画
  draw(type: ArtType) {
    switch (type) {
      case 'ripple':
        this.drawRipplePattern();
        break;
      case 'spiral':
        this.drawSpiralPattern();
        break;
      case 'grid':
        this.drawGridPattern();
        break;
      case 'voronoi':
        this.drawVoronoiPattern();
        break;
      case 'radial':
        this.drawRadialPattern();
        break;
    }
  }
}
