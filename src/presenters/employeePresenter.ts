export const employeePresenter = {
  toView: (e: any) => ({ id: e.id, name: e.name, email: e.email, department: e.department, position: e.position, status: e.status, statusColor: e.status === 'active' ? 'green' : e.status === 'inactive' ? 'gray' : 'red', team: e.team?.name, initials: e.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) }),
  toList: (employees: any[]) => employees.map(e => employeePresenter.toView(e)),
  toSelect: (employees: any[]) => employees.map(e => ({ value: e.id, label: e.name })),
};
