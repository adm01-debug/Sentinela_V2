import React, { useState } from "react";
import { Card, CardHeader, CardContent, CardTitle, CardFooter } from "../ui/Card";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Label } from "../ui/Label";
import { Plus, Trash2 } from "lucide-react";

interface Condition {
  field: string;
  operator: string;
  value: string;
}

interface RuleEditorProps {
  initialConditions?: Condition[];
  onSave: (conditions: Condition[]) => void;
}

export function RuleEditor({ initialConditions = [], onSave }: RuleEditorProps) {
  const [conditions, setConditions] = useState<Condition[]>(initialConditions);

  const addCondition = () => {
    setConditions([...conditions, { field: "", operator: "equals", value: "" }]);
  };

  const removeCondition = (index: number) => {
    setConditions(conditions.filter((_, i) => i !== index));
  };

  const updateCondition = (index: number, updates: Partial<Condition>) => {
    setConditions(conditions.map((c, i) => i === index ? { ...c, ...updates } : c));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Rule Conditions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {conditions.map((condition, index) => (
          <div key={index} className="flex items-end gap-2">
            <div className="flex-1">
              <Label>Field</Label>
              <Input value={condition.field} onChange={(e) => updateCondition(index, { field: e.target.value })} />
            </div>
            <div className="flex-1">
              <Label>Value</Label>
              <Input value={condition.value} onChange={(e) => updateCondition(index, { value: e.target.value })} />
            </div>
            <Button variant="destructive" size="icon" onClick={() => removeCondition(index)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
        <Button variant="outline" onClick={addCondition}><Plus className="h-4 w-4 mr-2" />Add Condition</Button>
      </CardContent>
      <CardFooter>
        <Button onClick={() => onSave(conditions)}>Save Rules</Button>
      </CardFooter>
    </Card>
  );
}
