import { ViewMode, DateColumn } from '../types';

interface CalendarHeaderProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  dateColumns: DateColumn[];
  onRefresh: () => void;
  isRefreshing: boolean;
}

export default function CalendarHeader({
  viewMode,
  onViewModeChange,
  dateColumns,
  onRefresh,
  isRefreshing,
}: CalendarHeaderProps) {
  return (
    <div className="bg-white border-b border-gray-200 sticky top-[73px] z-30 shadow-sm">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div className="flex space-x-2">
              <button
                onClick={() => onViewModeChange('week')}
                className={`px-4 py-2 rounded-lg font-medium transition-all text-sm ${
                  viewMode === 'week'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Week
              </button>
              <button
                onClick={() => onViewModeChange('day')}
                className={`px-4 py-2 rounded-lg font-medium transition-all text-sm ${
                  viewMode === 'day'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Day
              </button>
            </div>
          </div>

          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-sm text-sm flex items-center space-x-2"
          >
            <svg
              className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            <span>Refresh</span>
          </button>
        </div>

        {/* Date column headers */}
        <div className="grid gap-2" style={{ gridTemplateColumns: `200px repeat(${dateColumns.length}, 1fr)` }}>
          <div className="text-sm font-semibold text-gray-700 px-4 py-2 bg-gray-50 rounded-lg">
            Deal Hierarchy
          </div>
          {dateColumns.map((col, idx) => (
            <div key={idx} className="text-center text-sm font-semibold text-gray-700 px-2 py-2 border-l border-gray-200 bg-gray-50 rounded-lg">
              {col.label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}