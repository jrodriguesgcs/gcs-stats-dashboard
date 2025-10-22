import { Deal } from '../types';

interface DealModalProps {
  deal: Deal | null;
  onClose: () => void;
}

export default function DealModal({ deal, onClose }: DealModalProps) {
  if (!deal) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Deal Details</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="text-sm font-semibold text-gray-700">Title</label>
            <p className="text-sm text-gray-900 mt-1">{deal.title}</p>
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700">Deal ID</label>
            <p className="text-sm text-gray-900 mt-1">{deal.id}</p>
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700">Deal Owner</label>
            <p className="text-sm text-gray-900 mt-1">{deal.owner || 'Unassigned'}</p>
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700">Created Date</label>
            <p className="text-sm text-gray-900 mt-1">{deal.createdDate || 'N/A'}</p>
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700">Distribution Time</label>
            <p className="text-sm text-gray-900 mt-1">
              {deal.customFields.distributionTime || 'N/A'}
            </p>
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700">Primary Country</label>
            <p className="text-sm text-gray-900 mt-1">
              {deal.customFields.primaryCountry || 'Unknown'}
            </p>
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700">Primary Program</label>
            <p className="text-sm text-gray-900 mt-1">
              {deal.customFields.primaryProgram || 'Unknown'}
            </p>
          </div>
        </div>

        <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
          <button
            onClick={onClose}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 px-4 rounded-lg transition-colors font-medium shadow-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}