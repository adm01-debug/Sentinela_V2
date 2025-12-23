export class EmployeeListViewModel {
  employees: any[] = []; total = 0; page = 1; limit = 10; search = ''; filters: Record<string, any> = {};
  static fromData(data: any): EmployeeListViewModel { const vm = new EmployeeListViewModel(); vm.employees = data.employees || []; vm.total = data.total || 0; vm.page = data.page || 1; vm.limit = data.limit || 10; return vm; }
  get totalPages(): number { return Math.ceil(this.total / this.limit); }
  get hasNextPage(): boolean { return this.page < this.totalPages; }
  get hasPrevPage(): boolean { return this.page > 1; }
}
