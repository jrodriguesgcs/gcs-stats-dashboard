import { HierarchyNode, DateColumn } from '../types';
import { getDealsForCell } from '../utils/hierarchyUtils';
import DealChip from './DealChip';

interface HierarchyRowProps {
  node: HierarchyNode;
  dateColumns: DateColumn[];
  onToggle: (node: HierarchyNode) => void;
  onDealClick: (deal: any) => void;
}

export default function HierarchyRow({
  node,
  dateColumns,
  onToggle,
  onDealClick,
}: HierarchyRowProps) {
  const indentLevel = node.level === 'owner' ? 0 : node.level === 'country' ? 1 : 2;
  const hasChildren = node.children && node.children.length > 0;
  const isProgram = node.level === 'program';

  return (
    <div
      className={`grid gap-2 border-b border-gray-200 hover:bg-gray-50 transition-colors ${
        node.level === 'owner' ? 'bg-gray-50' : ''
      }`}
      style={{ gridTemplateColumns: `200px repeat(${dateColumns.length}, 1fr)` }}
    >
      {/* Hierarchy label */}
      <div
        className="px-4 py-3 flex items-center cursor-pointer"
        style={{ paddingLeft: `${16 + indentLevel * 24}px` }}
        onClick={() => hasChildren && onToggle(node)}
      >
        {hasChildren && (
          <span className="mr-2 text-blue-600 text-xs font-bold">
            {node.isExpanded ? '▼' : '▶'}
          </span>
        )}
        <span
          className={`text-sm ${
            node.level === 'owner'
              ? 'font-semibold text-gray-900'
              : node.level === 'country'
              ? 'font-medium text-gray-800'
              : 'font-normal text-gray-700'
          }`}
        >
          {node.label}
        </span>
      </div>

      {/* Date columns with deals */}
      {dateColumns.map((col, idx) => (
        <div
          key={idx}
          className="border-l border-gray-200 px-2 py-2 min-h-[48px]"
        >
          {isProgram && (
            <div className="space-y-1">
              {getDealsForCell(node, col.date).map(deal => (
                <DealChip
                  key={deal.id}
                  deal={deal}
                  onClick={() => onDealClick(deal)}
                />
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}