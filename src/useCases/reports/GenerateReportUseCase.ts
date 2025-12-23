import { reportRepository } from '@/repositories/reportRepository';
interface GenerateReportInput { type: 'daily' | 'weekly' | 'monthly' | 'productivity'; startDate: string; endDate: string; employeeIds?: string[]; }
export class GenerateReportUseCase {
  async execute(input: GenerateReportInput): Promise<any> {
    if (!input.type || !input.startDate || !input.endDate) throw new Error('Type and date range required');
    return reportRepository.generate(input.type, input);
  }
}
export const generateReportUseCase = new GenerateReportUseCase();
