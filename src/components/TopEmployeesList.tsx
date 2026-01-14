import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface Employee { 
  employee: string; 
  productivity: number; 
}

export const TopEmployeesList = ({ employees }: { employees: Employee[] }) => (
  <Card>
    <CardHeader><CardTitle>Top Performers</CardTitle></CardHeader>
    <CardContent>
      <div className="space-y-4">
        {employees.map((emp, i) => (
          <div key={i} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="text-xs">
                  {emp.employee.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="font-medium">{emp.employee}</span>
            </div>
            <span className="text-green-500 font-medium">{emp.productivity}%</span>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);
