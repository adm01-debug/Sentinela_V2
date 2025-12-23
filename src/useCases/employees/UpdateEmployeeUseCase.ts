import { employeeRepository } from '@/repositories/employeeRepository';
interface UpdateEmployeeInput { id: string; data: Partial<{ name: string; email: string; department: string; position: string; status: string; }>; }
export class UpdateEmployeeUseCase {
  async execute(input: UpdateEmployeeInput): Promise<any> {
    const employee = await employeeRepository.findById(input.id);
    if (!employee) throw new Error('Employee not found');
    return employeeRepository.update(input.id, input.data);
  }
}
export const updateEmployeeUseCase = new UpdateEmployeeUseCase();
