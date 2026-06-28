// frontend/src/components/CreationResult/MarkdownView.jsx

export default function MarkdownView({ content }) {
  const renderMarkdown = (text) => {
    if (!text) return null;
    const lines = text.split('\n');
    const elements = [];
    let listItems = [];

    const flushList = (key) => {
      if (listItems.length > 0) {
        elements.push(
          <div key={key} className="space-y-2 mb-4">
            {listItems}
          </div>
        );
        listItems = [];
      }
    };

    lines.forEach((line, i) => {
      const h2 = line.match(/^##\s+(.+)/);
      const h3 = line.match(/^###\s+(.+)/);
      const boldTitle = line.match(/^\*\*(.+?)\*\*[：:]?\s*$/);
      const qaPattern = line.match(/^\*\*(Q\d+[：:])\*\*\s*(.+)/);
      const aPattern = line.match(/^\*\*(A[：:])\*\*\s*(.+)/);
      const li = line.match(/^[-*]\s+(.+)/);
      const numberedLi = line.match(/^\d+[.、]\s+(.+)/);

      if (h2) {
        flushList(`flush-${i}`);
        currentSection = h2[1];
        elements.push(
          <div key={i} className="mt-6 mb-3 first:mt-0">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-6 rounded-full bg-gradient-to-b from-primary-400 to-primary-600"></div>
              <h2 className="text-lg font-bold text-gray-800">{h2[1]}</h2>
            </div>
            <div className="h-px bg-gradient-to-r from-primary-200 to-transparent mt-2"></div>
          </div>
        );
      } else if (h3) {
        flushList(`flush-${i}`);
        elements.push(
          <h3 key={i} className="text-base font-semibold text-gray-700 mt-4 mb-2 flex items-center gap-1.5">
            <span className="text-primary-400">▸</span>
            {h3[1]}
          </h3>
        );
      } else if (qaPattern) {
        flushList(`flush-${i}`);
        elements.push(
          <div key={i} className="flex gap-2.5 mb-2 bg-blue-50 rounded-lg p-3 border border-blue-100">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500 text-white text-xs font-bold flex items-center justify-center">Q</span>
            <div className="flex-1">
              <span className="font-medium text-blue-900 text-sm">{qaPattern[2]}</span>
            </div>
          </div>
        );
      } else if (aPattern) {
        flushList(`flush-${i}`);
        elements.push(
          <div key={i} className="flex gap-2.5 mb-3 ml-4 bg-green-50 rounded-lg p-3 border border-green-100">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-green-500 text-white text-xs font-bold flex items-center justify-center">A</span>
            <div className="flex-1">
              <span className="text-green-900 text-sm leading-relaxed">{renderInline(aPattern[2])}</span>
            </div>
          </div>
        );
      } else if (boldTitle) {
        flushList(`flush-${i}`);
        elements.push(
          <div key={i} className="flex items-start gap-2 mb-2 mt-2">
            <span className="text-primary-500 mt-0.5">◆</span>
            <span className="font-semibold text-gray-800 text-sm">{boldTitle[1]}</span>
          </div>
        );
      } else if (li) {
        listItems.push(
          <div key={i} className="flex items-start gap-2.5">
            <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-primary-400 mt-2"></span>
            <span className="text-gray-600 text-sm leading-relaxed flex-1">{renderInline(li[1])}</span>
          </div>
        );
      } else if (numberedLi) {
        const numMatch = line.match(/^(\d+)[.、]\s+(.*)/);
        listItems.push(
          <div key={i} className="flex items-start gap-2.5">
            <span className="flex-shrink-0 w-5 h-5 rounded-md bg-primary-100 text-primary-600 text-xs font-bold flex items-center justify-center mt-0.5">{numMatch[1]}</span>
            <span className="text-gray-600 text-sm leading-relaxed flex-1">{renderInline(numMatch[2])}</span>
          </div>
        );
      } else if (line.trim()) {
        flushList(`flush-${i}`);
        elements.push(
          <p key={i} className="text-gray-600 text-sm leading-relaxed mb-2">{renderInline(line)}</p>
        );
      }
    });
    flushList('flush-final');
    return elements;
  };

  const renderInline = (text) => {
    // 处理 **加粗** 和 「书名号」
    const parts = text.split(/(\*\*[^*]+\*\*|「[^」]+」)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-semibold text-gray-800">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('「') && part.endsWith('」')) {
        return <span key={i} className="text-primary-600 font-medium">{part}</span>;
      }
      return part;
    });
  };

  return <div className="max-w-none">{renderMarkdown(content)}</div>;
}
