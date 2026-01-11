import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Avatar } from './ui/Avatar';

interface Employee { employee: string; productivity: number; }

export const TopEmployeesList = ({ employees }: { employees: Employee[] }) => (
  <Card>
    <CardHeader><CardTitle>Top Performers</CardTitle></CardHeader>
    <CardContent>
      <div className="space-y-4">
        {employees.map((emp, i) => (
          <div key={i} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar fallback={emp.employee.charAt(0)} size="sm" />
              <span className="font-medium">{emp.employee}</span>
            </div>
            <span className="text-green-500 font-medium">{emp.productivity}%</span>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);