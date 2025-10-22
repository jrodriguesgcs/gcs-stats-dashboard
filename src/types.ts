export interface Deal {
  id: string;
  title: string;
  owner: string;
  createdDate: string;
  customFields: {
    distributionTime?: string; // field 15
    primaryCountry?: string; // field 53
    primaryProgram?: string; // field 52
    eligibility?: string; // field 6 - for D7 Cold/Hot distinction
    [key: string]: string | undefined;
  };
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
}

export interface LoadingProgress {
  phase: 'idle' | 'metadata' | 'deals' | 'customFields' | 'merge' | 'complete';
  message: string;
  current: number;
  total: number;
  percentage: number;
}

export type ViewMode = 'week' | 'day';

export interface HierarchyNode {
  key: string;
  level: 'owner' | 'country' | 'program';
  label: string;
  owner?: string;
  country?: string;
  program?: string;
  children?: HierarchyNode[];
  deals?: Deal[];
  isExpanded?: boolean;
}

export interface DateColumn {
  date: Date;
  label: string; // dd/mm format
}