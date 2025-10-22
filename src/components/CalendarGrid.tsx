import { useState } from 'react';
import { HierarchyNode, DateColumn, Deal } from '../types';
import { flattenHierarchy } from '../utils/hierarchyUtils';
import HierarchyRow from './HierarchyRow';
import DealModal from './DealModal';

interface CalendarGridProps {
  hierarchy: HierarchyNode[];
  dateColumns: DateColumn[];
  onHierarchyChange: (hierarchy: HierarchyNode[]) => void;
}

export default function CalendarGrid({
  hierarchy,
  dateColumns,
  onHierarchyChange,
}: CalendarGridProps) {
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);

  const toggleNode = (targetNode: HierarchyNode) => {
    const toggleRecursive = (nodes: HierarchyNode[]): HierarchyNode[] => {
      return nodes.map(node => {
        if (node.key === targetNode.key) {
          return { ...node, isExpanded: !node.isExpanded };
        }
        if (node.children) {
          return { ...node, children: toggleRecursive(node.children) };
        }
        return node;
      });
    };

    onHierarchyChange(toggleRecursive(hierarchy));
  };

  const flatNodes = flattenHierarchy(hierarchy);

  if (flatNodes.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-500 text-sm">No deals found for the selected date range.</p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        {flatNodes.map(node => (
          <HierarchyRow
            key={node.key}
            node={node}
            dateColumns={dateColumns}
            onToggle={toggleNode}
            onDealClick={setSelectedDeal}
          />
        ))}
      </div>

      <DealModal deal={selectedDeal} onClose={() => setSelectedDeal(null)} />
    </>
  );
}