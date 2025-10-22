import { Deal } from '../types';

interface DealChipProps {
  deal: Deal;
  onClick: () => void;
}

export default function DealChip({ deal, onClick }: DealChipProps) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left px-3 py-2 bg-blue-100 hover:bg-blue-200 border border-blue-300 rounded-lg transition-colors text-sm text-gray-900 truncate"
      title={deal.title}
    >
      {deal.title}
    </button>
  );
}