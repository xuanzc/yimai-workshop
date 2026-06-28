// frontend/src/components/CraftGraph/CraftGraph.jsx
import { CRAFT_NODE_STYLES } from '../../utils/constants';

export default function CraftGraph({ nodes = [], edges = [] }) {
  if (nodes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-gray-400">
        <div className="text-5xl mb-3 opacity-30">🔧</div>
        <p>暂无工艺图谱数据</p>
      </div>
    );
  }

  const nodeMap = {};
  nodes.forEach((n) => { nodeMap[n.node_id] = n; });

  // 构建线性流程（按 sort_order 排列，如果有边则按边的顺序）
  const orderedNodes = [...nodes].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));

  // 将节点分成 2 行展示，每行最多 3 个
  const perRow = 3;
  const rows = [];
  for (let i = 0; i < orderedNodes.length; i += perRow) {
    rows.push(orderedNodes.slice(i, i + perRow));
  }

  return (
    <div className="w-full">
      {/* 图例 */}
      <div className="flex items-center gap-4 mb-5 text-xs">
        {Object.entries(CRAFT_NODE_STYLES).map(([key, style]) => (
          <div key={key} className="flex items-center gap-1.5">
            <div className={`w-4 h-4 rounded ${style.bg} border ${style.border}`}></div>
            <span className="text-gray-500">{style.label}</span>
          </div>
        ))}
        <div className="flex items-center gap-1.5 ml-auto text-gray-400">
          <span>共 {nodes.length} 步</span>
        </div>
      </div>

      {/* 流程图主体 */}
      <div className="space-y-0">
        {rows.map((row, rowIdx) => {
          const isLastRow = rowIdx === rows.length - 1;
          const isReverse = rowIdx % 2 === 1; // 蛇形排列，偶数行正向，奇数行反向

          const displayRow = isReverse ? [...row].reverse() : row;

          return (
            <div key={rowIdx} className="relative">
              {/* 行间连接线 */}
              {rowIdx > 0 && (
                <div className="flex justify-center -mt-1 mb-1">
                  <svg width="40" height="30" className="text-gray-300">
                    <path d="M 20 0 L 20 30" stroke="currentColor" strokeWidth="2" strokeDasharray="4 3" fill="none" />
                    <polygon points="15,25 20,30 25,25" fill="currentColor" />
                  </svg>
                </div>
              )}

              <div className="flex items-stretch justify-center gap-2 md:gap-4">
                {displayRow.map((node, colIdx) => {
                  const style = CRAFT_NODE_STYLES[node.node_type] || CRAFT_NODE_STYLES.action;
                  const stepNum = orderedNodes.indexOf(node) + 1;
                  const isLastInRow = colIdx === displayRow.length - 1;

                  return (
                    <div key={node.node_id} className="flex items-center flex-1 max-w-xs">
                      {/* 节点卡片 */}
                      <div className={`relative flex-1 rounded-xl border-2 ${style.border} ${style.bg} p-4 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 group`}>
                        {/* 步骤序号 */}
                        <div className={`absolute -top-3 -left-3 w-7 h-7 rounded-full bg-gradient-to-br ${style.color} text-white text-xs font-bold flex items-center justify-center shadow-md`}>
                          {stepNum}
                        </div>
                        {/* 节点类型标签 */}
                        <div className={`text-xs ${style.text} font-medium mb-1`}>
                          {style.icon} {style.label}
                        </div>
                        {/* 节点名称 */}
                        <div className="font-bold text-gray-800 text-sm md:text-base mb-1">
                          {node.label}
                        </div>
                        {/* 节点描述 */}
                        {node.description && (
                          <div className="text-xs text-gray-500 leading-relaxed line-clamp-2">
                            {node.description}
                          </div>
                        )}
                      </div>

                      {/* 水平连接箭头 */}
                      {!isLastInRow && (
                        <div className="flex-shrink-0 px-1 md:px-2">
                          <svg width="30" height="20" className="text-gray-300">
                            <path d="M 0 10 L 25 10" stroke="currentColor" strokeWidth="2" strokeDasharray="4 3" fill="none" />
                            <polygon points="20,5 28,10 20,15" fill="currentColor" />
                          </svg>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* 边关系列表（补充信息） */}
      {edges.length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-100">
          <div className="text-xs text-gray-400 mb-2">工艺流转关系</div>
          <div className="flex flex-wrap gap-2">
            {edges.map((edge, i) => {
              const sourceNode = nodeMap[edge.source_node];
              const targetNode = nodeMap[edge.target_node];
              return (
                <div key={i} className="flex items-center gap-1.5 text-xs bg-gray-50 px-2.5 py-1 rounded-md">
                  <span className="font-medium text-gray-600">{sourceNode?.label || edge.source_node}</span>
                  <span className="text-gray-400">—{edge.label || '→'}→</span>
                  <span className="font-medium text-gray-600">{targetNode?.label || edge.target_node}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
