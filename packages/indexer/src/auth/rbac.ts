/**
 * Role-Based Access Control (RBAC)
 */

export type UserRole = 'admin' | 'moderator' | 'curator' | 'user';

export interface Permission {
  resource: string;
  action: string;
}

export interface Role {
  name: UserRole;
  permissions: Permission[];
  description: string;
}

const ROLES: Record<UserRole, Role> = {
  admin: {
    name: 'admin',
    description: 'Full system access',
    permissions: [
      { resource: '*', action: '*' }
    ]
  },
  moderator: {
    name: 'moderator',
    description: 'Moderate proposals and votes',
    permissions: [
      { resource: 'proposal', action: 'moderate' },
      { resource: 'vote', action: 'moderate' },
      { resource: 'user', action: 'read' }
    ]
  },
  curator: {
    name: 'curator',
    description: 'Curate and feature content',
    permissions: [
      { resource: 'proposal', action: 'feature' },
      { resource: 'proposal', action: 'read' }
    ]
  },
  user: {
    name: 'user',
    description: 'Regular user access',
    permissions: [
      { resource: 'proposal', action: 'read' },
      { resource: 'vote', action: 'create' }
    ]
  }
};

export class RBACManager {
  private userRoles: Map<string, UserRole> = new Map();

  assignRole(userId: string, role: UserRole): void {
    this.userRoles.set(userId, role);
  }

  getUserRole(userId: string): UserRole {
    return this.userRoles.get(userId) || 'user';
  }

  canAccess(userId: string, resource: string, action: string): boolean {
    const role = this.getUserRole(userId);
    const rolePerms = ROLES[role].permissions;

    return rolePerms.some((p) => {
      if (p.resource === '*') return true;
      if (p.action === '*') return p.resource === resource;
      return p.resource === resource && p.action === action;
    });
  }

  getPermissions(userId: string): Permission[] {
    const role = this.getUserRole(userId);
    return ROLES[role].permissions;
  }
}

export function createRBACManager(): RBACManager {
  return new RBACManager();
}
