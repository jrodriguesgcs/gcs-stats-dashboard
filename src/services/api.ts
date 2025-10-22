import { Deal, LoadingProgress, User } from '../types';

const API_BASE = '/api/proxy';
const RATE_LIMIT = 5;
const WORKER_COUNT = 20;

class RateLimiter {
  private queue: Array<() => void> = [];
  private activeRequests = 0;
  private lastRequestTime = 0;

  async throttle<T>(fn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      const execute = async () => {
        const now = Date.now();
        const timeSinceLastRequest = now - this.lastRequestTime;
        const minInterval = 1000 / RATE_LIMIT;

        if (timeSinceLastRequest < minInterval) {
          await new Promise(r => setTimeout(r, minInterval - timeSinceLastRequest));
        }

        this.lastRequestTime = Date.now();
        this.activeRequests++;

        try {
          const result = await fn();
          resolve(result);
        } catch (error) {
          reject(error);
        } finally {
          this.activeRequests--;
          this.processQueue();
        }
      };

      if (this.activeRequests < WORKER_COUNT) {
        execute();
      } else {
        this.queue.push(execute);
      }
    });
  }

  private processQueue() {
    if (this.queue.length > 0 && this.activeRequests < WORKER_COUNT) {
      const next = this.queue.shift();
      if (next) next();
    }
  }
}

const rateLimiter = new RateLimiter();

async function fetchFromProxy(endpoint: string): Promise<any> {
  const url = `${API_BASE}?endpoint=${encodeURIComponent(endpoint)}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`);
  }
  return response.json();
}

export async function fetchUsers(
  onProgress: (progress: LoadingProgress) => void
): Promise<Map<string, string>> {
  onProgress({
    phase: 'metadata',
    message: 'Fetching users list...',
    current: 0,
    total: 1,
    percentage: 0,
  });

  const userMap = new Map<string, string>();
  let offset = 0;
  const limit = 100;
  let hasMore = true;

  while (hasMore) {
    const data = await rateLimiter.throttle(() =>
      fetchFromProxy(`/api/3/users?limit=${limit}&offset=${offset}`)
    );

    if (data.users && data.users.length > 0) {
      data.users.forEach((user: User) => {
        const fullName = `${user.firstName} ${user.lastName}`.trim();
        userMap.set(user.id, fullName || `User ${user.id}`);
      });
      offset += limit;
      hasMore = data.users.length === limit;
    } else {
      hasMore = false;
    }
  }

  return userMap;
}

export async function fetchDeals(
  onProgress: (progress: LoadingProgress) => void
): Promise<Deal[]> {
  const deals: Deal[] = [];
  let offset = 0;
  const limit = 100;
  let hasMore = true;

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const dateFilter = sevenDaysAgo.toISOString().split('T')[0];

  onProgress({
    phase: 'deals',
    message: 'Fetching recent deals (last 7 days)...',
    current: 0,
    total: 0,
    percentage: 0,
  });

  while (hasMore) {
    const endpoint = `/api/3/deals?limit=${limit}&offset=${offset}&orders[cdate]=DESC&filters[cdate_after]=${dateFilter}`;

    const data = await rateLimiter.throttle(() => fetchFromProxy(endpoint));

    if (data.deals && data.deals.length > 0) {
      deals.push(
        ...data.deals.map((d: any) => ({
          id: d.id,
          title: d.title,
          owner: d.owner || '',
          createdDate: d.cdate || '',
          customFields: {},
        }))
      );

      offset += limit;

      onProgress({
        phase: 'deals',
        message: `Fetched ${deals.length} recent deals...`,
        current: deals.length,
        total: data.meta?.total || deals.length,
        percentage: Math.min(50, (deals.length / (data.meta?.total || deals.length)) * 100),
      });

      hasMore = data.deals.length === limit;

      if (deals.length >= 1000) {
        hasMore = false;
      }
    } else {
      hasMore = false;
    }
  }

  onProgress({
    phase: 'deals',
    message: `Loaded ${deals.length} recent deals successfully`,
    current: deals.length,
    total: deals.length,
    percentage: 100,
  });

  return deals;
}

export async function fetchDealCustomFields(
  dealIds: string[],
  onProgress: (progress: LoadingProgress) => void
): Promise<Map<string, any>> {
  const customFieldsMap = new Map<string, any>();
  let completed = 0;
  const total = dealIds.length;

  onProgress({
    phase: 'customFields',
    message: `Fetching custom fields for ${total} deals...`,
    current: 0,
    total,
    percentage: 0,
  });

  const workers = Array.from({ length: WORKER_COUNT }, async () => {
    while (dealIds.length > 0) {
      const dealId = dealIds.shift();
      if (!dealId) break;

      try {
        const data = await rateLimiter.throttle(() =>
          fetchFromProxy(`/api/3/deals/${dealId}/dealCustomFieldData`)
        );

        const fieldValues: any = {};
        if (data.dealCustomFieldData) {
          data.dealCustomFieldData.forEach((field: any) => {
            fieldValues[field.customFieldId] = field.fieldValue;
          });
        }

        customFieldsMap.set(dealId, fieldValues);
        completed++;

        onProgress({
          phase: 'customFields',
          message: `Processing deal ${completed} of ${total}...`,
          current: completed,
          total,
          percentage: (completed / total) * 100,
        });
      } catch (error) {
        console.error(`Error fetching custom fields for deal ${dealId}:`, error);
        completed++;
      }
    }
  });

  await Promise.all(workers);

  return customFieldsMap;
}

export async function fetchAllDealsWithCustomFields(
  onProgress: (progress: LoadingProgress) => void
): Promise<{ deals: Deal[]; userMap: Map<string, string> }> {
  // Phase 1: Metadata
  const userMap = await fetchUsers(onProgress);

  // Phase 2: Deals
  const deals = await fetchDeals(onProgress);

  // Phase 3: Custom Fields
  const dealIds = deals.map(d => d.id);
  const customFieldsMap = await fetchDealCustomFields(dealIds, onProgress);

  // Phase 4: Merge
  onProgress({
    phase: 'merge',
    message: 'Merging data...',
    current: 0,
    total: deals.length,
    percentage: 0,
  });

  const enrichedDeals = deals.map(deal => {
    const fieldValues = customFieldsMap.get(deal.id) || {};
    const ownerName = userMap.get(deal.owner) || deal.owner;

    return {
      ...deal,
      owner: ownerName,
      customFields: {
        distributionTime: fieldValues['15'] || '',
        primaryCountry: fieldValues['53'] || '',
        primaryProgram: fieldValues['52'] || '',
        eligibility: fieldValues['6'] || '', // field 6 for D7 eligibility
      },
    };
  });

  onProgress({
    phase: 'complete',
    message: 'Data loaded successfully!',
    current: deals.length,
    total: deals.length,
    percentage: 100,
  });

  return { deals: enrichedDeals, userMap };
}