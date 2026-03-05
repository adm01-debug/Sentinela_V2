// Cards re-export
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface InfoCardProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}

export function InfoCard({ title, description, children }: InfoCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

export { Card, CardContent, CardHeader, CardTitle, CardDescription };
