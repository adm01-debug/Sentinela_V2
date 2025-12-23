export interface UserDataExport { profile: any; activities: any[]; violations: any[]; exportedAt: string; }
export async function exportUserData(userId: string): Promise<UserDataExport> {
  // Simulate fetching all user data
  return { profile: { id: userId, email: 'user@example.com', name: 'User' }, activities: [], violations: [], exportedAt: new Date().toISOString() };
}
export function downloadAsJson(data: any, filename: string): void { const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = filename; a.click(); URL.revokeObjectURL(url); }
