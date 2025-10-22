import { HierarchyNode, DateColumn, Deal } from '../types';
import { getDealsForCell } from '../utils/hierarchyUtils';

interface HierarchyRowProps {
  node: HierarchyNode;
  dateColumns: DateColumn[];
  onCellClick: (deals: Deal[], date: string, nodePath: string) => void;
}

export default function HierarchyRow({
  node,
  dateColumns,
  onCellClick,
}: HierarchyRowProps) {
  const isOwner = node.level === 'owner';
  const isCountry = node.level === 'country';
  const isProgram = node.level === 'program';

  // Calculate row total for owner and program rows
  const calculateRowTotal = (): number => {
    if (isOwner) {
      // Sum all deals from all programs under this owner
      let total = 0;
      const countDealsRecursive = (n: HierarchyNode) => {
        if (n.level === 'program' && n.deals) {
          dateColumns.forEach(col => {
            total += getDealsForCell(n, col.date).length;
          });
        }
        if (n.children) {
          n.children.forEach(child => countDealsRecursive(child));
        }
      };
      if (node.children) {
        node.children.forEach(child => countDealsRecursive(child));
      }
      return total;
    }
    
    if (isProgram) {
      // Sum all deals for this program across all date columns
      return dateColumns.reduce((sum, col) => {
        return sum + getDealsForCell(node, col.date).length;
      }, 0);
    }
    
    return 0; // Country rows don't show totals
  };

  const rowTotal = calculateRowTotal();

  // Owner rows are section headers (banner style - scrolls away, not sticky)
  if (isOwner) {
    return (
      <div
        className="grid gap-0 bg-blue-600 text-white font-semibold"
        style={{ gridTemplateColumns: `200px repeat(${dateColumns.length}, 1fr) 1fr` }}
      >
        <div className="px-4 py-3">{node.label}</div>
        {dateColumns.map((_, idx) => (
          <div key={idx} className="border-l border-blue-500"></div>
        ))}
        {/* Total column for owner */}
        <div className="border-l-2 border-blue-900 flex items-center justify-center bg-blue-800" style={{ minHeight: '48px' }}>
          <span className="text-sm font-bold">{rowTotal}</span>
        </div>
      </div>
    );
  }

  // Country and Program rows
  const bgColor = isCountry 
    ? 'bg-gray-50 hover:bg-gray-100' 
    : 'bg-white hover:bg-blue-50';

  return (
    <div
      className={`grid gap-0 border-b border-gray-200 ${bgColor} transition-colors`}
      style={{ gridTemplateColumns: `200px repeat(${dateColumns.length}, 1fr) 1fr` }}
    >
      {/* Hierarchy label */}
      <div
        className="px-4 py-3 flex items-center min-w-[200px]"
        style={{ paddingLeft: isCountry ? '24px' : '48px' }}
      >
        <span
          className={`text-sm truncate ${
            isCountry
              ? 'font-medium text-gray-800'
              : 'font-normal text-gray-700'
          }`}
        >
          {node.label}
        </span>
      </div>

      {/* Date columns with deal counts */}
      {dateColumns.map((col, idx) => {
        const dealCount = isProgram ? getDealsForCell(node, col.date).length : 0;
        const deals = isProgram ? getDealsForCell(node, col.date) : [];
        
        // Color intensity based on deal count (0-10+ scale)
        const getBackgroundColor = (count: number) => {
          if (count === 0) return 'bg-white';
          if (count === 1) return 'bg-blue-50';
          if (count === 2) return 'bg-blue-100';
          if (count === 3) return 'bg-blue-200';
          if (count === 4) return 'bg-blue-300';
          if (count >= 5) return 'bg-blue-400';
          return 'bg-white';
        };

        const getTextColor = (count: number) => {
          if (count === 0) return 'text-gray-400';
          if (count >= 4) return 'text-white font-bold';
          return 'text-gray-900 font-semibold';
        };

        return (
          <div
            key={idx}
            className={`border-l border-gray-200 flex items-center justify-center ${
              isProgram ? getBackgroundColor(dealCount) : ''
            } ${isProgram && dealCount > 0 ? 'cursor-pointer hover:opacity-80' : ''} transition-all`}
            style={{ minHeight: '48px' }}
            onClick={() => {
              if (isProgram && dealCount > 0) {
                const nodePath = `${node.owner} → ${node.country} → ${node.program}`;
                onCellClick(deals, col.label, nodePath);
              }
            }}
          >
            {isProgram && (
              <span className={`text-sm ${getTextColor(dealCount)}`}>
                {dealCount}
              </span>
            )}
          </div>
        );
      })}

      {/* Total column for this row */}
      <div 
        className={`border-l-2 border-gray-300 flex items-center justify-center ${
          isProgram ? 'bg-blue-200' : ''
        }`}
        style={{ minHeight: '48px' }}
      >
        {isProgram && (
          <span className="text-sm font-semibold text-gray-900">{rowTotal}</span>
        )}
      </div>
    </div>
  );
}