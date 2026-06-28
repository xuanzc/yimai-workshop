// frontend/src/components/CraftGraph/CraftGraph.jsx
export default function CraftGraph({ nodes = [], edges = [] }) {
  if (nodes.length === 0) return <div className="text-gray-400 text-center py-8">暂无工艺图谱数据</div>;

  const nodeColors = {
    material: 'bg-blue-100 border-blue-400 text-blue-700',
    action: 'bg-primary-100 border-primary-400 text-primary-700',
    product: 'bg-green-100 border-green-400 text-green-700',
  };

  return (
    <div className="overflow-x-auto">
      <div className="inline-flex flex-col gap-2 min-w-full">
        <div className="flex flex-wrap gap-4 justify-center">
          {nodes.map((node, i) => (
            <div key={node.node_id} className="flex flex-col items-center">
              {i > 0 && <div className="text-gray-400 text-xs mb-1">↓</div>}
              <div className={`border-2 rounded-lg px-4 py-3 max-w-xs ${nodeColors[node.node_type] || nodeColors.action}`}>
                <div className="font-medium text-sm">{node.label}</div>
                {node.description && <div className="text-xs mt-1 opacity-75">{node.description}</div>}
                <div className="text-xs mt-1 opacity-50 uppercase">{node.node_type}</div>
              </div>
            </div>
          ))}
        </div>
        {edges.length > 0 && (
          <div className="mt-4 text-xs text-gray-400 text-center">
            {edges.map((e, i) => (
              <span key={i} className="mr-3">{e.source_node} → {e.label || ''} → {e.target_node}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
