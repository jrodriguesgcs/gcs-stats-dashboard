import { Deal, HierarchyNode } from '../types';
import { parseDistributionTime, isDateInDay } from './dateUtils';

/**
 * Normalize program name for display
 * - Portugal + Passive Income Visa → D7 Cold/Hot/Unknown based on field 6
 * - Citizenship by Descent → CBD
 * - Citizenship by Investment → CBI
 */
function normalizeProgramName(deal: Deal): string {
  const country = deal.customFields.primaryCountry || 'Unknown';
  const program = deal.customFields.primaryProgram || 'Unknown';
  const eligibility = deal.customFields.eligibility || '';

  // Portugal + Passive Income Visa → D7 variants
  if (country === 'Portugal' && program === 'Passive Income Visa') {
    if (eligibility === 'Eligible Cold') return 'D7 Cold';
    if (eligibility === 'Eligible Hot') return 'D7 Hot';
    return 'D7 (Unknown eligibility)';
  }

  // Abbreviations
  if (program === 'Citizenship by Descent') return 'CBD';
  if (program === 'Citizenship by Investment') return 'CBI';

  return program;
}

/**
 * Build 3-level hierarchy: Owner → Country → Program
 * Only include deals with valid distributionTime in date range
 * Exclude owner "Global Citizen Solutions Operator | Global Citizen Solutions"
 */
export function buildHierarchy(deals: Deal[], dateColumns: Date[]): HierarchyNode[] {
  const ownerMap = new Map<string, HierarchyNode>();

  // Filter deals with valid distributionTime and exclude system owner
  const validDeals = deals.filter(deal => {
    // Exclude system owner
    if (deal.owner === 'Global Citizen Solutions Operator | Global Citizen Solutions') {
      return false;
    }

    if (!deal.customFields.distributionTime) return false;
    const distDate = parseDistributionTime(deal.customFields.distributionTime);
    if (!distDate) return false;
    
    // Check if date falls in any visible column
    return dateColumns.some(col => isDateInDay(distDate, col));
  });

  validDeals.forEach(deal => {
    const owner = deal.owner || 'Unassigned';
    const country = deal.customFields.primaryCountry || 'Unknown';
    const program = normalizeProgramName(deal); // Use normalized program name

    // Level 1: Owner
    if (!ownerMap.has(owner)) {
      ownerMap.set(owner, {
        key: `owner-${owner}`,
        level: 'owner',
        label: owner,
        owner,
        children: [],
        isExpanded: true, // Always expanded
      });
    }
    const ownerNode = ownerMap.get(owner)!;

    // Level 2: Country
    let countryNode = ownerNode.children!.find(c => c.country === country);
    if (!countryNode) {
      countryNode = {
        key: `${ownerNode.key}-country-${country}`,
        level: 'country',
        label: country,
        owner,
        country,
        children: [],
        isExpanded: true, // Always expanded
      };
      ownerNode.children!.push(countryNode);
    }

    // Level 3: Program
    let programNode = countryNode.children!.find(p => p.program === program);
    if (!programNode) {
      programNode = {
        key: `${countryNode.key}-program-${program}`,
        level: 'program',
        label: program,
        owner,
        country,
        program,
        deals: [],
        isExpanded: true, // Always expanded
      };
      countryNode.children!.push(programNode);
    }

    // Add deal to program node
    programNode.deals!.push(deal);
  });

  // Sort hierarchy alphabetically at each level
  const sortedOwners = Array.from(ownerMap.values()).sort((a, b) => 
    a.label.localeCompare(b.label)
  );

  sortedOwners.forEach(owner => {
    owner.children!.sort((a, b) => a.label.localeCompare(b.label));
    owner.children!.forEach(country => {
      country.children!.sort((a, b) => a.label.localeCompare(b.label));
      // Sort deals within program by distributionTime, then by id
      country.children!.forEach(program => {
        program.deals!.sort((a, b) => {
          const timeA = a.customFields.distributionTime || '';
          const timeB = b.customFields.distributionTime || '';
          if (timeA !== timeB) return timeA.localeCompare(timeB);
          return a.id.localeCompare(b.id);
        });
      });
    });
  });

  return sortedOwners;
}

/**
 * Get deals for a specific program node on a specific date
 */
export function getDealsForCell(
  programNode: HierarchyNode,
  columnDate: Date
): Deal[] {
  if (!programNode.deals) return [];
  
  return programNode.deals.filter(deal => {
    const distDate = parseDistributionTime(deal.customFields.distributionTime || '');
    return distDate && isDateInDay(distDate, columnDate);
  });
}

/**
 * Calculate totals for each date column across all hierarchy
 */
export function calculateTotals(
  hierarchy: HierarchyNode[],
  dateColumns: Date[]
): number[] {
  const totals = dateColumns.map(() => 0);

  const countDealsRecursive = (node: HierarchyNode) => {
    if (node.level === 'program' && node.deals) {
      dateColumns.forEach((col, idx) => {
        const dealsInColumn = getDealsForCell(node, col);
        totals[idx] += dealsInColumn.length;
      });
    }
    
    if (node.children) {
      node.children.forEach(child => countDealsRecursive(child));
    }
  };

  hierarchy.forEach(owner => countDealsRecursive(owner));
  
  return totals;
}

/**
 * Recursively flatten hierarchy for rendering (all rows always expanded)
 */
export function flattenHierarchy(nodes: HierarchyNode[]): HierarchyNode[] {
  const result: HierarchyNode[] = [];
  
  nodes.forEach(node => {
    result.push(node);
    
    if (node.children && node.children.length > 0) {
      result.push(...flattenHierarchy(node.children));
    }
  });
  
  return result;
}