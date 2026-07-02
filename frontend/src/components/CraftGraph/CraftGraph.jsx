// frontend/src/components/CraftGraph/CraftGraph.jsx
import { useRef, useState, useEffect, useCallback } from 'react';
import { CRAFT_NODE_STYLES, generateNodeImageUrl } from '../../utils/constants';

/**
 * 工艺流程图谱 — SVG 可视化渲染
 * 节点 = 圆角矩形卡片（按类型着色）+ 大幅 AI 自动生图（可点击放大、可重新生图）
 * 边 = 贝塞尔曲线 + 箭头，蛇形布局
 * 图片由 Pollinations.ai 免费生图服务自动生成
 */
export default function CraftGraph({ nodes = [], edges = [] }) {
  const containerRef = useRef(null);
  const [containerWidth, setContainerWidth] = useState(800);
  const [hoveredNode, setHoveredNode] = useState(null);
  const [modalNode, setModalNode] = useState(null);       // 当前放大查看的节点
  const [imageSeeds, setImageSeeds] = useState({});         // node_id -> customSeed（重新生图用）
  const [imageLoaded, setImageLoaded] = useState({});      // node_id -> true（图片加载完成）

  useEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver((entries) => {
      setContainerWidth(entries[0].contentRect.width);
    });
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  /** 获取节点当前生效的图片 URL（考虑重新生图后的 seed） */
  const getNodeImageUrl = useCallback((node, idx) => {
    const customSeed = imageSeeds[node.node_id];
    return generateNodeImageUrl(node, idx, customSeed);
  }, [imageSeeds]);

  /** 重新生图：换一个随机 seed */
  const regenerateImage = useCallback((node) => {
    const newSeed = Math.floor(Math.random() * 100000);
    setImageSeeds((prev) => ({ ...prev, [node.node_id]: newSeed }));
    setImageLoaded((prev) => ({ ...prev, [node.node_id]: false }));
  }, []);

  /** 标记图片加载完成 */
  const handleImgLoad = useCallback((nodeId) => {
    setImageLoaded((prev) => ({ ...prev, [nodeId]: true }));
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

  const isNarrow = containerWidth < 480;
  const NODE_W = isNarrow ? 160 : 200;
  const NODE_H = isNarrow ? 165 : 185;
  // 图片区域：占卡片上半部分，大圆角矩形
  const IMG_W = NODE_W - 16;        // 图片宽度（左右各留 8px 边距）
  const IMG_H = isNarrow ? 80 : 95; // 图片高度
  const IMG_X = 8;                  // 图片左偏移
  const IMG_Y = 28;                 // 图片顶部偏移（序号圆下方）
  const GAP_X = isNarrow ? 16 : 36;
  const GAP_Y = 55;
  const PER_ROW = isNarrow ? 2 : 3;
  const PAD_X = 20;
  const PAD_TOP = 10;

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

  const totalRows = rows.length;
  const svgWidth = PAD_X * 2 + PER_ROW * NODE_W + (PER_ROW - 1) * GAP_X;
  const svgHeight = PAD_TOP + totalRows * NODE_H + (totalRows - 1) * GAP_Y + 20;

  // ---- 边路径计算 ----
  function getEdgePath(edge) {
    const src = positions[edge.source_node];
    const tgt = positions[edge.target_node];
    if (!src || !tgt) return null;

    const sameRow = src.row === tgt.row;

    if (sameRow) {
      const srcIsLeft = src.x < tgt.x;
      const x1 = srcIsLeft ? src.x + NODE_W : src.x;
      const x2 = srcIsLeft ? tgt.x : tgt.x + NODE_W;
      const y1 = src.y + NODE_H / 2;
      const y2 = tgt.y + NODE_H / 2;
      const midX = (x1 + x2) / 2;
      return { d: `M ${x1} ${y1} L ${x2 - 8} ${y2}`, type: 'straight', midX, midY: y1 };
    } else {
      const x1 = src.x + NODE_W / 2;
      const y1 = src.y + NODE_H;
      const x2 = tgt.x + NODE_W / 2;
      const y2 = tgt.y;
      const cy = (y1 + y2) / 2;
      return { d: `M ${x1} ${y1} C ${x1} ${cy}, ${x2} ${cy}, ${x2} ${y2 - 8}`, type: 'curve', midX: (x1 + x2) / 2, midY: cy };
    }
  }

  // ---- 节点颜色获取 ----
  function getNodeTypeColors(nodeType) {
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
            {/* 图片占位渐变 */}
            <linearGradient id="img-placeholder" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#e2e8f0" />
              <stop offset="100%" stopColor="#cbd5e1" />
            </linearGradient>
            {/* 圆角矩形裁剪路径 */}
            {orderedNodes.map((node) => (
              <clipPath key={`clip-${node.node_id}`} id={`clip-${node.node_id}`}>
                <rect x={IMG_X} y={IMG_Y} width={IMG_W} height={IMG_H} rx={8} />
              </clipPath>
            ))}
          </defs>

          {/* 绘制边 */}
          {edges.map((edge, i) => {
            const path = getEdgePath(edge);
            if (!path) return null;
            const isHovered = hoveredNode === edge.source_node || hoveredNode === edge.target_node;
            return (
              <g key={`edge-${i}`}>
                <path
                  d={path.d}
                  fill="none"
                  stroke={isHovered ? '#6366f1' : '#94a3b8'}
                  strokeWidth={isHovered ? 2.5 : 1.8}
                  strokeDasharray="5 3"
                  markerEnd={`url(#${isHovered ? 'arrowhead-hover' : 'arrowhead'})`}
                  className="transition-all"
                />
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
            const hasImage = !!node.image_url;
            const currentUrl = hasImage ? getNodeImageUrl(node, idx) : null;
            const imgLoadedFlag = imageLoaded[node.node_id];

            const maxChars = isNarrow ? 7 : 9;
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

                {/* AI 生图区域 — 大幅圆角矩形图片 */}
                {hasImage ? (
                  <>
                    {/* 占位矩形（图片下方，加载中显示脉冲动画） */}
                    <rect
                      x={IMG_X} y={IMG_Y}
                      width={IMG_W} height={IMG_H}
                      rx={8}
                      fill="url(#img-placeholder)"
                    >
                      <animate attributeName="opacity" values="0.4;0.7;0.4" dur="1.5s" repeatCount="indefinite" />
                    </rect>
                    {/* 使用 foreignObject 嵌入 HTML img */}
                    <foreignObject
                      x={IMG_X}
                      y={IMG_Y}
                      width={IMG_W}
                      height={IMG_H}
                      clipPath={`url(#clip-${node.node_id})`}
                    >
                      <img
                        src={currentUrl}
                        alt={node.label}
                        onLoad={() => handleImgLoad(node.node_id)}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          borderRadius: '8px',
                          display: 'block',
                          cursor: 'zoom-in',
                        }}
                        loading="lazy"
                        onClick={() => setModalNode({ ...node, idx, url: currentUrl })}
                      />
                    </foreignObject>
                    {/* 图片边框 */}
                    <rect
                      x={IMG_X} y={IMG_Y}
                      width={IMG_W} height={IMG_H}
                      rx={8}
                      fill="none"
                      stroke={c.stroke}
                      strokeWidth={1.5}
                      opacity={0.4}
                      pointerEvents="none"
                    />
                    {/* 放大图标（右上角） */}
                    <g transform={`translate(${IMG_X + IMG_W - 22}, ${IMG_Y + 4})`} pointerEvents="none">
                      <circle cx="8" cy="8" r="8" fill="rgba(0,0,0,0.4)" />
                      <path
                        d="M4 8 L12 8 M8 4 L8 12"
                        stroke="white"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                    </g>
                  </>
                ) : (
                  /* 无图片时的占位 */
                  <rect
                    x={IMG_X} y={IMG_Y}
                    width={IMG_W} height={IMG_H}
                    rx={8}
                    fill="url(#img-placeholder)"
                  />
                )}

                {/* 节点名称 */}
                <text
                  x={NODE_W / 2} y={IMG_Y + IMG_H + 18}
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
                    x={NODE_W / 2} y={IMG_Y + IMG_H + 32}
                    textAnchor="middle"
                    fontSize={9}
                    fill="#94a3b8"
                  >
                    {node.description.length > 16 ? node.description.slice(0, 16) + '…' : node.description}
                  </text>
                )}

                {/* hover tooltip */}
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

      {/* 节点详情列表（带大图缩略图 + 重新生图按钮） */}
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
        {orderedNodes.map((node, idx) => {
          const c = getNodeTypeColors(node.node_type);
          const style = CRAFT_NODE_STYLES[node.node_type] || CRAFT_NODE_STYLES.action;
          const currentUrl = node.image_url ? getNodeImageUrl(node, idx) : null;
          return (
            <div
              key={node.node_id}
              className={`flex items-start gap-3 p-3 rounded-lg transition-all ${hoveredNode === node.node_id ? 'ring-2 ring-indigo-300 shadow-sm' : ''}`}
              style={{ backgroundColor: c.fill }}
              onMouseEnter={() => setHoveredNode(node.node_id)}
              onMouseLeave={() => setHoveredNode(null)}
            >
              {/* 大图缩略图（可点击放大） */}
              <div
                className="flex-shrink-0 relative w-20 h-16 rounded-lg overflow-hidden border-2 cursor-zoom-in group"
                style={{ borderColor: c.stroke }}
                onClick={() => currentUrl && setModalNode({ ...node, idx, url: currentUrl })}
              >
                {currentUrl ? (
                  <>
                    <img
                      src={currentUrl}
                      alt={node.label}
                      className="w-full h-full object-cover transition-transform group-hover:scale-110"
                      loading="lazy"
                    />
                    {/* 放大图标 */}
                    <div className="absolute top-0.5 right-0.5 bg-black/40 rounded-full w-5 h-5 flex items-center justify-center">
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                        <circle cx="11" cy="11" r="8" />
                        <path d="M21 21l-4.35-4.35M11 8v6M8 11h6" />
                      </svg>
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white text-lg font-bold" style={{ backgroundColor: c.badge }}>
                    {idx + 1}
                  </div>
                )}
              </div>

              {/* 文字内容 */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-gray-800">{style.icon} {node.label}</span>
                  <span
                    className="text-[10px] px-1.5 py-0.5 rounded-full font-medium"
                    style={{ backgroundColor: c.badge, color: 'white' }}
                  >
                    {style.label}
                  </span>
                </div>
                {node.description && (
                  <div className="text-xs text-gray-500 mt-0.5 leading-relaxed line-clamp-2">{node.description}</div>
                )}
                {/* 重新生图按钮 */}
                {currentUrl && (
                  <button
                    className="mt-1.5 inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-white/60 hover:bg-white text-gray-600 hover:text-indigo-600 border border-gray-200 transition-all"
                    onClick={(e) => {
                      e.stopPropagation();
                      regenerateImage(node);
                    }}
                  >
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M23 4v6h-6M1 20v-6h6" />
                      <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
                    </svg>
                    重新生图
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ===== 图片放大模态框 ===== */}
      {modalNode && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
          onClick={() => setModalNode(null)}
        >
          <div
            className="relative max-w-3xl w-full mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 头部 */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <span
                  className="text-[10px] px-2 py-0.5 rounded-full font-medium text-white"
                  style={{ backgroundColor: getNodeTypeColors(modalNode.node_type).badge }}
                >
                  {(CRAFT_NODE_STYLES[modalNode.node_type] || CRAFT_NODE_STYLES.action).label}
                </span>
                <h3 className="text-base font-bold text-gray-800">{modalNode.label}</h3>
              </div>
              <button
                className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                onClick={() => setModalNode(null)}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* 大图区域 */}
            <div className="relative bg-gray-100 flex items-center justify-center" style={{ minHeight: '300px' }}>
              {/* 加载占位 */}
              {!imageLoaded[`modal-${modalNode.node_id}`] && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="flex flex-col items-center gap-2 text-gray-400">
                    <div className="w-8 h-8 border-2 border-gray-300 border-t-indigo-500 rounded-full animate-spin" />
                    <span className="text-xs">AI 生图中...</span>
                  </div>
                </div>
              )}
              <img
                src={modalNode.url}
                alt={modalNode.label}
                className="w-full max-h-[60vh] object-contain"
                onLoad={() => handleImgLoad(`modal-${modalNode.node_id}`)}
                onError={() => handleImgLoad(`modal-${modalNode.node_id}`)}
              />
            </div>

            {/* 底部操作栏 */}
            <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 bg-gray-50">
              <p className="text-xs text-gray-500 flex items-center gap-1">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <path d="M21 15l-5-5L5 21" />
                </svg>
                由 AI 自动生成
              </p>
              <button
                className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-indigo-50 hover:bg-indigo-100 text-indigo-600 border border-indigo-200 transition-all"
                onClick={() => {
                  const newSeed = Math.floor(Math.random() * 100000);
                  const newUrl = generateNodeImageUrl(modalNode, modalNode.idx, newSeed, 800, 600);
                  setImageLoaded((prev) => ({ ...prev, [`modal-${modalNode.node_id}`]: false }));
                  setModalNode({ ...modalNode, url: newUrl });
                  // 同步更新列表中的 seed
                  setImageSeeds((prev) => ({ ...prev, [modalNode.node_id]: newSeed }));
                  setImageLoaded((prev) => ({ ...prev, [modalNode.node_id]: false }));
                }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M23 4v6h-6M1 20v-6h6" />
                  <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
                </svg>
                重新生图
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
