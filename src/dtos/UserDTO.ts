export interface UserDTO { id: string; email: string; full_name?: string; role: string; avatar_url?: string; created_at: string; updated_at?: string; }
export interface CreateUserDTO { email: string; password: string; full_name?: string; role?: string; }
export interface UpdateUserDTO { email?: string; full_name?: string; role?: string; avatar_url?: string; }
