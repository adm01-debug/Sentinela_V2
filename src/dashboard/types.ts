export interface Panel { title: string; type: string; query?: string; }
export interface Dashboard { id: string; title: string; panels: Panel[]; }
