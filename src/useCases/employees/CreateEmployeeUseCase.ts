import { employeeRepository } from '@/repositories/employeeRepository';
interface CreateEmployeeInput { name: string; email: string; department: string; position: string; teamId?: string; }
export class CreateEmployeeUseCase {
  async execute(input: CreateEmployeeInput): Promise<any> {
    if (!input.name || !input.email) throw new Error('Name and email required');
    return employeeRepository.create(input);
  }
}
export const createEmployeeUseCase = new CreateEmployeeUseCase();
