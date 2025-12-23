export interface UserPort {
  getUser(id: string): Promise<any>;
  listUsers(params?: any): Promise<any[]>;
  createUser(data: any): Promise<any>;
  updateUser(id: string, data: any): Promise<any>;
  deleteUser(id: string): Promise<void>;
}
