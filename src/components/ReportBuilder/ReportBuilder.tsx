import React, { useState } from "react";
import { Card, CardHeader, CardContent, CardTitle, CardFooter } from "../ui/Card";
import { Button } from "../ui/Button";
import { Checkbox } from "../ui/Checkbox";
import { Label } from "../ui/Label";
import { Select } from "../ui/Select";

interface ReportBuilderProps {
  availableFields: Array<{ id: string; label: string; category: string }>;
  onGenerate: (config: { fields: string[]; format: string; dateRange: string }) => void;
}

export function ReportBuilder({ availableFields, onGenerate }: ReportBuilderProps) {
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [format, setFormat] = useState("pdf");
  const [dateRange, setDateRange] = useState("7d");

  const toggleField = (fieldId: string) => {
    setSelectedFields(prev => 
      prev.includes(fieldId) ? prev.filter(f => f !== fieldId) : [...prev, fieldId]
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Build Custom Report</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-2">
          {availableFields.map((field) => (
            <div key={field.id} className="flex items-center space-x-2">
              <Checkbox id={field.id} checked={selectedFields.includes(field.id)} onCheckedChange={() => toggleField(field.id)} />
              <Label htmlFor={field.id}>{field.label}</Label>
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={() => onGenerate({ fields: selectedFields, format, dateRange })} disabled={selectedFields.length === 0}>
          Generate Report
        </Button>
      </CardFooter>
    </Card>
  );
}
