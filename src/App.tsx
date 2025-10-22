import { useState, useEffect } from 'react';
import Login from './components/Login';
import LoadingProgress from './components/LoadingProgress';
import RefreshNotification from './components/RefreshNotification';
import CalendarHeader from './components/CalendarHeader';
import CalendarGrid from './components/CalendarGrid';
import { Deal, ViewMode, LoadingProgress as LoadingProgressType, HierarchyNode, DateColumn } from './types';
import { fetchAllDealsWithCustomFields } from './services/api';
import { getLast7Days, getToday } from './utils/dateUtils';
import { buildHierarchy } from './utils/hierarchyUtils';

const APP_PASSWORD = 'Welcome-GCS-Dashboard-2025';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('week');
  const [deals, setDeals] = useState<Deal[]>([]);
  const [hierarchy, setHierarchy] = useState<HierarchyNode[]>([]);
  const [dateColumns, setDateColumns] = useState<DateColumn[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState<LoadingProgressType>({
    phase: 'idle',
    message: '',
    current: 0,
    total: 0,
    percentage: 0,
  });
  const [refreshStatus, setRefreshStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [refreshMessage, setRefreshMessage] = useState('');

  useEffect(() => {
    if (isAuthenticated && deals.length === 0) {
      loadData();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    // Update date columns based on view mode
    if (viewMode === 'week') {
      setDateColumns(getLast7Days());
    } else {
      setDateColumns(getToday());
    }
  }, [viewMode]);

  useEffect(() => {
    // Rebuild hierarchy when deals or dateColumns change
    if (deals.length > 0 && dateColumns.length > 0) {
      const newHierarchy = buildHierarchy(deals, dateColumns.map(c => c.date));
      setHierarchy(newHierarchy);
    }
  }, [deals, dateColumns]);

  useEffect(() => {
    if (refreshStatus === 'success' || refreshStatus === 'error') {
      const timer = setTimeout(() => {
        setRefreshStatus('idle');
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [refreshStatus]);

  const handleLogin = (password: string) => {
    if (password === APP_PASSWORD) {
      setIsAuthenticated(true);
    } else {
      alert('Incorrect password. Please try again.');
    }
  };

  const loadData = async () => {
    setIsLoading(true);
    setRefreshStatus('loading');
    setRefreshMessage('Loading deals...');

    try {
      const { deals: fetchedDeals } = await fetchAllDealsWithCustomFields(setLoadingProgress);
      setDeals(fetchedDeals);
      setRefreshStatus('success');
      setRefreshMessage(`Loaded ${fetchedDeals.length} deals successfully`);
    } catch (error) {
      console.error('Error loading data:', error);
      setRefreshStatus('error');
      setRefreshMessage('Failed to load data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    await loadData();
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {isLoading && <LoadingProgress progress={loadingProgress} />}

      {refreshStatus !== 'idle' && (
        <RefreshNotification
          status={refreshStatus}
          message={refreshMessage}
          onClose={() => setRefreshStatus('idle')}
        />
      )}

      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-[1920px] mx-auto px-6 py-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">GCS Sales Distribution Dashboard</h1>
            <p className="text-gray-600 mt-1 text-sm">
              Deal Distribution Calendar ({viewMode === 'week' ? 'Last 7 Days' : 'Today'})
            </p>
          </div>
        </div>
      </header>

      <CalendarHeader
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        dateColumns={dateColumns}
        onRefresh={handleRefresh}
        isRefreshing={refreshStatus === 'loading'}
      />

      <main className="max-w-[1920px] mx-auto px-6 py-6">
        <CalendarGrid
          hierarchy={hierarchy}
          dateColumns={dateColumns}
        />
      </main>

      <footer className="bg-white mt-12 border-t border-gray-200">
        <div className="max-w-[1920px] mx-auto px-6 py-6">
          <p className="text-center text-gray-500 text-sm">
            © 2025 Global Citizen Solutions - Sales Distribution Dashboard
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;