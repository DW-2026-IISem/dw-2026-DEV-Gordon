// El índice único compuesto lo declara cada modelo puente (through.unique: false evita el duplicado automático).
import { User } from './users/user.model';
import { Role } from './roles/role.model';
import { Resource } from './resources/resource.model';
import { RoleUser } from './role-users/role-user.model';
import { ResourceRole } from './resource-roles/resource-role.model';
import { RefreshToken } from './refresh-tokens/refresh-token.model';

// Grafo RBAC en un solo lugar:
//   User N:M Role (RoleUser) · Role N:M Resource (ResourceRole) · User 1:N RefreshToken
// Cadena de autorización: User -> RoleUser -> Role -> ResourceRole -> Resource.

User.belongsToMany(Role, { through: { model: RoleUser, unique: false }, foreignKey: 'user_id', otherKey: 'role_id', as: 'roles' });
Role.belongsToMany(User, { through: { model: RoleUser, unique: false }, foreignKey: 'role_id', otherKey: 'user_id', as: 'users' });
User.hasMany(RoleUser, { foreignKey: 'user_id', as: 'roleUsers', onDelete: 'RESTRICT' });
RoleUser.belongsTo(User, { foreignKey: 'user_id', as: 'user', onDelete: 'RESTRICT' });
Role.hasMany(RoleUser, { foreignKey: 'role_id', as: 'roleUsers', onDelete: 'RESTRICT' });
RoleUser.belongsTo(Role, { foreignKey: 'role_id', as: 'role', onDelete: 'RESTRICT' });

Role.belongsToMany(Resource, { through: { model: ResourceRole, unique: false }, foreignKey: 'role_id', otherKey: 'resource_id', as: 'resources' });
Resource.belongsToMany(Role, { through: { model: ResourceRole, unique: false }, foreignKey: 'resource_id', otherKey: 'role_id', as: 'roles' });
Role.hasMany(ResourceRole, { foreignKey: 'role_id', as: 'resourceRoles', onDelete: 'RESTRICT' });
ResourceRole.belongsTo(Role, { foreignKey: 'role_id', as: 'role', onDelete: 'RESTRICT' });
Resource.hasMany(ResourceRole, { foreignKey: 'resource_id', as: 'resourceRoles', onDelete: 'RESTRICT' });
ResourceRole.belongsTo(Resource, { foreignKey: 'resource_id', as: 'resource', onDelete: 'RESTRICT' });

User.hasMany(RefreshToken, { foreignKey: 'user_id', as: 'refreshTokens', onDelete: 'RESTRICT' });
RefreshToken.belongsTo(User, { foreignKey: 'user_id', as: 'user', onDelete: 'RESTRICT' });
