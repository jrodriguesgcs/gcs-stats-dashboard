import { useState } from 'react';
import { HierarchyNode, DateColumn, Deal } from '../types';
import { flattenHierarchy } from '../utils/hierarchyUtils';
import HierarchyRow from './HierarchyRow';
import DealListModal from './DealListModal';

interface CalendarGridProps {
  hierarchy: HierarchyNode[];
  dateColumns: DateColumn[];
}

export default function CalendarGrid({
  hierarchy,
  dateColumns,
}: CalendarGridProps) {
  const [selectedDeals, setSelectedDeals] = useState<Deal[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedPath, setSelectedPath] = useState<string>('');

  const handleCellClick = (deals: Deal[], date: string, nodePath: string) => {
    setSelectedDeals(deals);
    setSelectedDate(date);
    setSelectedPath(nodePath);
  };

  const handleCloseModal = () => {
    setSelectedDeals([]);
    setSelectedDate('');
    setSelectedPath('');
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
            onCellClick={handleCellClick}
          />
        ))}
      </div>

      {selectedDeals.length > 0 && (
        <DealListModal
          deals={selectedDeals}
          date={selectedDate}
          nodePath={selectedPath}
          onClose={handleCloseModal}
        />
      )}
    </>
  );
}