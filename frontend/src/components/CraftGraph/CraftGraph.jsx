// frontend/src/components/CraftGraph/CraftGraph.jsx
import { useRef, useState, useEffect } from 'react';
import { CRAFT_NODE_STYLES } from '../../utils/constants';

/**
 * 工艺流程图谱 — SVG 可视化渲染
 * 节点 = 圆角矩形卡片（按类型着色），边 = 贝塞尔曲线 + 箭头
 * 蛇形布局：每行最多3个节点，行间用弯折线连接
 */
export default function CraftGraph({ nodes = [], edges = [] }) {
  const containerRef = useRef(null);
  const [containerWidth, setContainerWidth] = useState(800);
  const [hoveredNode, setHoveredNode] = useState(null);

  // 监听容器宽度变化（响应式）
  useEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver((entries) => {
      setContainerWidth(entries[0].contentRect.width);
    });
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  if (nodes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-gray-400">
        <div className="text-5xl mb-3 opacity-30">🔧</div>
        <p>暂无工艺图谱数据</p>
      </div>
    );
  }

  // ---- 布局计算 ----
  const orderedNodes = [...nodes].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
  const nodeMap = {};
  orderedNodes.forEach((n) => { nodeMap[n.node_id] = n; });

  // 节点卡片尺寸
  const isNarrow = containerWidth < 480;
  const NODE_W = isNarrow ? 130 : 180;
  const NODE_H = isNarrow ? 80 : 100;
  const GAP_X = isNarrow ? 20 : 40;
  const GAP_Y = 50;
  const PER_ROW = isNarrow ? 2 : 3;
  const PAD_X = 20;
  const PAD_TOP = 10;

  // 计算每个节点位置（蛇形布局）
  const positions = {};
  const rows = [];
  for (let i = 0; i < orderedNodes.length; i += PER_ROW) {
    rows.push(orderedNodes.slice(i, i + PER_ROW));
  }

  rows.forEach((row, rowIdx) => {
    const isReverse = rowIdx % 2 === 1;
    const displayRow = isReverse ? [...row].reverse() : row;
    displayRow.forEach((node, colIdx) => {
      const x = PAD_X + colIdx * (NODE_W + GAP_X);
      const y = PAD_TOP + rowIdx * (NODE_H + GAP_Y);
      positions[node.node_id] = { x, y, row: rowIdx, col: colIdx, isReverse };
    });
  });

  // SVG 画布尺寸
  const totalRows = rows.length;
  const svgWidth = PAD_X * 2 + PER_ROW * NODE_W + (PER_ROW - 1) * GAP_X;
  const svgHeight = PAD_TOP + totalRows * NODE_H + (totalRows - 1) * GAP_Y + 20;

  // ---- 边路径计算 ----
  function getEdgePath(edge) {
    const src = positions[edge.source_node];
    const tgt = positions[edge.target_node];
    if (!src || !tgt) return null;

    // 判断是同行还是跨行
    const sameRow = src.row === tgt.row;

    if (sameRow) {
      // 同行：水平直线 + 箭头
      const srcIsLeft = src.x < tgt.x;
      const x1 = srcIsLeft ? src.x + NODE_W : src.x;
      const x2 = srcIsLeft ? tgt.x : tgt.x + NODE_W;
      const y1 = src.y + NODE_H / 2;
      const y2 = tgt.y + NODE_H / 2;
      const midX = (x1 + x2) / 2;
      return { d: `M ${x1} ${y1} L ${x2 - 8} ${y2}`, type: 'straight', midX, midY: y1 };
    } else {
      // 跨行：弯折路径（从源节点底部 → 下行 → 到目标节点顶部）
      const x1 = src.x + NODE_W / 2;
      const y1 = src.y + NODE_H;
      const x2 = tgt.x + NODE_W / 2;
      const y2 = tgt.y;
      // 使用 C 曲线
      const cy = (y1 + y2) / 2;
      return { d: `M ${x1} ${y1} C ${x1} ${cy}, ${x2} ${cy}, ${x2} ${y2 - 8}`, type: 'curve', midX: (x1 + x2) / 2, midY: cy };
    }
  }

  // ---- 节点颜色获取 ----
  function getNodeTypeColors(nodeType) {
    const style = CRAFT_NODE_STYLES[nodeType] || CRAFT_NODE_STYLES.action;
    const colorMap = {
      material: { fill: '#eff6ff', stroke: '#60a5fa', text: '#1d4ed8', badge: '#3b82f6' },
      action: { fill: '#fffbeb', stroke: '#fbbf24', text: '#b45309', badge: '#f59e0b' },
      product: { fill: '#ecfdf5', stroke: '#34d399', text: '#047857', badge: '#10b981' },
    };
    return colorMap[nodeType] || colorMap.action;
  }

  return (
    <div className="w-full" ref={containerRef}>
      {/* 图例 */}
      <div className="flex items-center gap-4 mb-4 text-xs flex-wrap">
        {Object.entries(CRAFT_NODE_STYLES).map(([key, style]) => {
          const c = getNodeTypeColors(key);
          return (
            <div key={key} className="flex items-center gap-1.5">
              <div className="w-4 h-4 rounded border-2" style={{ backgroundColor: c.fill, borderColor: c.stroke }}></div>
              <span className="text-gray-500">{style.label}</span>
            </div>
          );
        })}
        <div className="flex items-center gap-1.5 ml-auto text-gray-400">
          <span>共 {nodes.length} 步</span>
        </div>
      </div>

      {/* SVG 流程图 */}
      <div className="overflow-x-auto bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-2 border border-gray-100">
        <svg
          width={Math.max(svgWidth, containerWidth - 4)}
          height={svgHeight}
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="mx-auto"
          style={{ minWidth: svgWidth }}
        >
          {/* defs: 箭头标记 */}
          <defs>
            <marker id="arrowhead" markerWidth="10" markerHeight="8" refX="8" refY="4" orient="auto">
              <polygon points="0 0, 10 4, 0 8" fill="#94a3b8" />
            </marker>
            <marker id="arrowhead-hover" markerWidth="10" markerHeight="8" refX="8" refY="4" orient="auto">
              <polygon points="0 0, 10 4, 0 8" fill="#6366f1" />
            </marker>
            {/* 渐变定义 */}
            <linearGradient id="grad-material" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#dbeafe" />
              <stop offset="100%" stopColor="#eff6ff" />
            </linearGradient>
            <linearGradient id="grad-action" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#fef3c7" />
              <stop offset="100%" stopColor="#fffbeb" />
            </linearGradient>
            <linearGradient id="grad-product" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#d1fae5" />
              <stop offset="100%" stopColor="#ecfdf5" />
            </linearGradient>
          </defs>

          {/* 绘制边（连接线） */}
          {edges.map((edge, i) => {
            const path = getEdgePath(edge);
            if (!path) return null;
            const isHovered = hoveredNode === edge.source_node || hoveredNode === edge.target_node;
            return (
              <g key={`edge-${i}`}>
                {/* 边路径 */}
                <path
                  d={path.d}
                  fill="none"
                  stroke={isHovered ? '#6366f1' : '#94a3b8'}
                  strokeWidth={isHovered ? 2.5 : 1.8}
                  strokeDasharray="5 3"
                  markerEnd={`url(#${isHovered ? 'arrowhead-hover' : 'arrowhead'})`}
                  className="transition-all"
                />
                {/* 边标签 */}
                {edge.label && (
                  <g>
                    <rect
                      x={path.midX - (edge.label.length * 6) - 4}
                      y={path.midY - 9}
                      width={edge.label.length * 12 + 8}
                      height={18}
                      rx={9}
                      fill="white"
                      stroke="#e2e8f0"
                      strokeWidth={1}
                    />
                    <text
                      x={path.midX}
                      y={path.midY + 3}
                      textAnchor="middle"
                      fontSize={10}
                      fill="#64748b"
                    >
                      {edge.label}
                    </text>
                  </g>
                )}
              </g>
            );
          })}

          {/* 绘制节点 */}
          {orderedNodes.map((node, idx) => {
            const pos = positions[node.node_id];
            if (!pos) return null;
            const c = getNodeTypeColors(node.node_type);
            const style = CRAFT_NODE_STYLES[node.node_type] || CRAFT_NODE_STYLES.action;
            const gradId = `grad-${node.node_type}`;
            const isHovered = hoveredNode === node.node_id;

            // 文本截断
            const maxChars = isNarrow ? 6 : 8;
            const label = node.label.length > maxChars ? node.label.slice(0, maxChars) + '…' : node.label;

            return (
              <g
                key={node.node_id}
                transform={`translate(${pos.x}, ${pos.y})`}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredNode(node.node_id)}
                onMouseLeave={() => setHoveredNode(null)}
              >
                {/* 阴影 */}
                <rect
                  x={2} y={3}
                  width={NODE_W} height={NODE_H}
                  rx={12}
                  fill="rgba(0,0,0,0.06)"
                />
                {/* 节点卡片 */}
                <rect
                  width={NODE_W} height={NODE_H}
                  rx={12}
                  fill={`url(#${gradId})`}
                  stroke={isHovered ? '#6366f1' : c.stroke}
                  strokeWidth={isHovered ? 2.5 : 2}
                  className="transition-all"
                />
                {/* 步骤序号圆 */}
                <circle
                  cx={18} cy={18}
                  r={11}
                  fill={c.badge}
                  stroke="white"
                  strokeWidth={2}
                />
                <text
                  x={18} y={22}
                  textAnchor="middle"
                  fontSize={11}
                  fontWeight="bold"
                  fill="white"
                >
                  {idx + 1}
                </text>
                {/* 类型标签 */}
                <text
                  x={36} y={20}
                  fontSize={9}
                  fill={c.text}
                  opacity={0.7}
                >
                  {style.icon} {style.label}
                </text>
                {/* 节点名称 */}
                <text
                  x={NODE_W / 2} y={isNarrow ? 48 : 52}
                  textAnchor="middle"
                  fontSize={isNarrow ? 12 : 14}
                  fontWeight="bold"
                  fill="#1e293b"
                >
                  {label}
                </text>
                {/* 描述（仅宽屏显示） */}
                {!isNarrow && node.description && (
                  <text
                    x={NODE_W / 2} y={72}
                    textAnchor="middle"
                    fontSize={9}
                    fill="#94a3b8"
                  >
                    {node.description.length > 14 ? node.description.slice(0, 14) + '…' : node.description}
                  </text>
                )}

                {/* hover 时显示完整描述的 tooltip */}
                {isHovered && node.description && (
                  <g transform={`translate(0, ${NODE_H + 4})`}>
                    <rect
                      x={-4} y={0}
                      width={NODE_W + 8} height={36}
                      rx={6}
                      fill="#1e293b"
                      opacity={0.92}
                    />
                    <foreignObject x={0} y={2} width={NODE_W} height={32}>
                      <div xmlns="http://www.w3.org/1999/xhtml" style={{ fontSize: '10px', color: '#f1f5f9', padding: '4px 6px', lineHeight: '1.3', textAlign: 'center' }}>
                        {node.description}
                      </div>
                    </foreignObject>
                  </g>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* 节点详情列表（辅助阅读） */}
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
        {orderedNodes.map((node, idx) => {
          const c = getNodeTypeColors(node.node_type);
          const style = CRAFT_NODE_STYLES[node.node_type] || CRAFT_NODE_STYLES.action;
          return (
            <div
              key={node.node_id}
              className={`flex items-start gap-2 p-2 rounded-lg transition-all cursor-default ${hoveredNode === node.node_id ? 'ring-2 ring-indigo-300' : ''}`}
              style={{ backgroundColor: c.fill }}
              onMouseEnter={() => setHoveredNode(node.node_id)}
              onMouseLeave={() => setHoveredNode(null)}
            >
              <div className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: c.badge }}>
                {idx + 1}
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-gray-800">{style.icon} {node.label}</div>
                {node.description && (
                  <div className="text-xs text-gray-500 mt-0.5 leading-relaxed">{node.description}</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
