import React, { useState, ChangeEvent } from "react";
import { Card, CardHeader, CardContent, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface TemplateEditorProps {
  initialTemplate?: { name: string; content: string; variables: string[] };
  onSave: (template: { name: string; content: string; variables: string[] }) => void;
}

export function TemplateEditor({ initialTemplate, onSave }: TemplateEditorProps) {
  const [name, setName] = useState(initialTemplate?.name || "");
  const [content, setContent] = useState(initialTemplate?.content || "");
  
  const extractVariables = (text: string): string[] => {
    const matches = text.match(/\{\{([^}]+)\}\}/g);
    return matches ? [...new Set(matches.map(m => m.replace(/[{}]/g, "")))] : [];
  };

  const variables = extractVariables(content);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Template Editor</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>Template Name</Label>
          <Input 
            value={name} 
            onChange={(e: ChangeEvent<HTMLInputElement>) => setName(e.target.value)} 
            placeholder="Enter template name" 
          />
        </div>
        <div>
          <Label>Content</Label>
          <Textarea 
            value={content} 
            onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setContent(e.target.value)} 
            placeholder="Enter template content. Use {{variable}} for dynamic values." 
            rows={6} 
          />
        </div>
        {variables.length > 0 && (
          <div>
            <Label>Detected Variables</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {variables.map((v) => (
                <span key={v} className="px-2 py-1 bg-muted rounded text-sm">{`{{${v}}}`}</span>
              ))}
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={() => onSave({ name, content, variables })} disabled={!name || !content}>
          Save Template
        </Button>
      </CardFooter>
    </Card>
  );
}
