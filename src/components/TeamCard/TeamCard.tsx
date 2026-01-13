import React from "react";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "../ui/Card";
import { Avatar, AvatarImage, AvatarFallback } from "../ui/Avatar";
import { Badge } from "../ui/Badge";
import { Users } from "lucide-react";

interface TeamMember {
  id: string;
  name: string;
  avatar?: string;
}

interface TeamCardProps {
  name: string;
  description?: string;
  members: TeamMember[];
  memberCount: number;
  department?: string;
  onClick?: () => void;
}

export function TeamCard({ name, description, members, memberCount, department, onClick }: TeamCardProps) {
  const displayMembers = members.slice(0, 4);
  const remaining = memberCount - displayMembers.length;

  return (
    <Card className="cursor-pointer hover:bg-accent/50 transition-colors" onClick={onClick}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{name}</CardTitle>
          {department && <Badge variant="outline">{department}</Badge>}
        </div>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex -space-x-2">
            {displayMembers.map((member) => (
              <Avatar key={member.id} className="border-2 border-background h-8 w-8">
                {member.avatar && <AvatarImage src={member.avatar} />}
                <AvatarFallback>{member.name[0]}</AvatarFallback>
              </Avatar>
            ))}
            {remaining > 0 && (
              <div className="flex items-center justify-center h-8 w-8 rounded-full bg-muted text-xs font-medium">
                +{remaining}
              </div>
            )}
          </div>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>{memberCount}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
