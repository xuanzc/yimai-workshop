// frontend/src/components/CreationResult/MarkdownView.jsx
export default function MarkdownView({ content }) {
  const renderMarkdown = (text) => {
    if (!text) return null;
    const lines = text.split('\n');
    const elements = [];
    let inList = false;
    let listItems = [];

    lines.forEach((line, i) => {
      const h2 = line.match(/^##\s+(.+)/);
      const h3 = line.match(/^###\s+(.+)/);
      const bold = line.match(/^\*\*(.+?)\*\*/);
      const li = line.match(/^[-*]\s+(.+)/);

      if (h2) {
        if (inList) { elements.push(<ul key={`ul-${i}`} className="list-disc pl-6 mb-3 space-y-1">{listItems}</ul>); listItems = []; inList = false; }
        elements.push(<h2 key={i} className="text-xl font-bold text-gray-800 mt-6 mb-3 pb-2 border-b border-gray-200">{h2[1]}</h2>);
      } else if (h3) {
        if (inList) { elements.push(<ul key={`ul-${i}`} className="list-disc pl-6 mb-3 space-y-1">{listItems}</ul>); listItems = []; inList = false; }
        elements.push(<h3 key={i} className="text-lg font-semibold text-gray-700 mt-4 mb-2">{h3[1]}</h3>);
      } else if (li) {
        inList = true;
        listItems.push(<li key={i} className="text-gray-600 text-sm">{renderInline(li[1])}</li>);
      } else if (line.trim()) {
        if (inList) { elements.push(<ul key={`ul-${i}`} className="list-disc pl-6 mb-3 space-y-1">{listItems}</ul>); listItems = []; inList = false; }
        elements.push(<p key={i} className="text-gray-600 text-sm leading-relaxed mb-2">{renderInline(line)}</p>);
      }
    });
    if (inList) elements.push(<ul key="ul-final" className="list-disc pl-6 mb-3 space-y-1">{listItems}</ul>);
    return elements;
  };

  const renderInline = (text) => {
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-semibold text-gray-800">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  return <div className="prose prose-sm max-w-none">{renderMarkdown(content)}</div>;
}
