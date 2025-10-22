import { Deal } from '../types';

interface DealListModalProps {
  deals: Deal[];
  date: string;
  nodePath: string;
  onClose: () => void;
}

export default function DealListModal({ deals, date, nodePath, onClose }: DealListModalProps) {
  if (deals.length === 0) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[80vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {deals.length} {deals.length === 1 ? 'Deal' : 'Deals'} on {date}
            </h2>
            <p className="text-sm text-gray-600 mt-1">{nodePath}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6">
          <div className="space-y-3">
            {deals.map((deal, idx) => (
              <div
                key={deal.id}
                className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-semibold text-gray-500">#{idx + 1}</span>
                      <h3 className="text-sm font-medium text-gray-900">{deal.title}</h3>
                    </div>
                    <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-gray-500">Deal ID:</span>{' '}
                        <span className="text-gray-700 font-mono">{deal.id}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Owner:</span>{' '}
                        <span className="text-gray-700">{deal.owner}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Distribution Time:</span>{' '}
                        <span className="text-gray-700">{deal.customFields.distributionTime}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Country:</span>{' '}
                        <span className="text-gray-700">{deal.customFields.primaryCountry}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
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