export type SpringValleyRole = 
  | 'Owner'
  | 'General Manager'
  | 'Sales Manager'
  | 'Salesperson'
  | 'Production Manager'
  | 'Project Manager';

export interface SpringValleyUser {
  id: string;
  name: string;
  email: string;
  role: SpringValleyRole;
}

/**
 * 6-Role Access Control Hierarchy (Spring Valley Command OS)
 * Defined per master context and meeting notes.
 */
export const ROLE_PERMISSIONS: Record<SpringValleyRole, {
  canViewFinancials: boolean;
  canViewMargins: boolean;
  canEditEstimates: boolean;
  canViewUnitCountsOnly: boolean;
  canViewJobBoard: boolean;
}> = {
  'Owner': { 
    canViewFinancials: true, 
    canViewMargins: true, 
    canEditEstimates: true, 
    canViewUnitCountsOnly: false, 
    canViewJobBoard: true 
  },
  'General Manager': { 
    canViewFinancials: true, 
    canViewMargins: true, 
    canEditEstimates: true, 
    canViewUnitCountsOnly: false, 
    canViewJobBoard: true 
  },
  'Sales Manager': { 
    canViewFinancials: false, 
    canViewMargins: true, 
    canEditEstimates: true, 
    canViewUnitCountsOnly: false, 
    canViewJobBoard: false 
  },
  'Salesperson': { 
    canViewFinancials: false, 
    canViewMargins: false, 
    canEditEstimates: true, 
    canViewUnitCountsOnly: true, 
    canViewJobBoard: false 
  },
  'Production Manager': { 
    canViewFinancials: false, 
    canViewMargins: false, 
    canEditEstimates: false, 
    canViewUnitCountsOnly: false, 
    canViewJobBoard: true 
  },
  'Project Manager': { 
    canViewFinancials: false, 
    canViewMargins: false, 
    canEditEstimates: false, 
    canViewUnitCountsOnly: false, 
    canViewJobBoard: true 
  },
};
