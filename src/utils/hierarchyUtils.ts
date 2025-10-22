import { Deal, HierarchyNode } from '../types';
import { parseDistributionTime, isDateInDay } from './dateUtils';

/**
 * Build 3-level hierarchy: Owner → Country → Program
 * Only include deals with valid distributionTime in date range
 */
export function buildHierarchy(deals: Deal[], dateColumns: Date[]): HierarchyNode[] {
  const ownerMap = new Map<string, HierarchyNode>();

  // Filter deals with valid distributionTime
  const validDeals = deals.filter(deal => {
    if (!deal.customFields.distributionTime) return false;
    const distDate = parseDistributionTime(deal.customFields.distributionTime);
    if (!distDate) return false;
    
    // Check if date falls in any visible column
    return dateColumns.some(col => isDateInDay(distDate, col));
  });

  validDeals.forEach(deal => {
    const owner = deal.owner || 'Unassigned';
    const country = deal.customFields.primaryCountry || 'Unknown';
    const program = deal.customFields.primaryProgram || 'Unknown';

    // Level 1: Owner
    if (!ownerMap.has(owner)) {
      ownerMap.set(owner, {
        key: `owner-${owner}`,
        level: 'owner',
        label: owner,
        owner,
        children: [],
        isExpanded: false,
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
        isExpanded: false,
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
        isExpanded: false,
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
 * Recursively flatten hierarchy for rendering (respecting expand/collapse)
 */
export function flattenHierarchy(nodes: HierarchyNode[]): HierarchyNode[] {
  const result: HierarchyNode[] = [];
  
  nodes.forEach(node => {
    result.push(node);
    
    if (node.isExpanded && node.children && node.children.length > 0) {
      result.push(...flattenHierarchy(node.children));
    }
  });
  
  return result;
}