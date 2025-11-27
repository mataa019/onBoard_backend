export enum Role {
  User = 'user',
  Admin = 'admin',
}

export const ALL_ROLES = [Role.User, Role.Admin] as const;
