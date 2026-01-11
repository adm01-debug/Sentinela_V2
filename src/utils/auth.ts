export const isTokenExpired = (token: string): boolean => { try { const payload = JSON.parse(atob(token.split('.')[1])); return payload.exp * 1000 < Date.now(); } catch { return true; } };
export const getTokenPayload = <T>(token: string): T | null => { try { return JSON.parse(atob(token.split('.')[1])); } catch { return null; } };
export const hasRole = (userRoles: string[], requiredRoles: string[]) => requiredRoles.some(role => userRoles.includes(role));
export const hasPermission = (userPermissions: string[], required: string) => userPermissions.includes(required) || userPermissions.includes('*');
