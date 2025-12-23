import { employeeRepository } from '@/repositories/employeeRepository';
export class DeleteEmployeeUseCase {
  async execute(id: string): Promise<void> {
    const employee = await employeeRepository.findById(id);
    if (!employee) throw new Error('Employee not found');
    await employeeRepository.delete(id);
  }
}
export const deleteEmployeeUseCase = new DeleteEmployeeUseCase();
