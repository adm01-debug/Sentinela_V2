import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardContent, CardTitle, CardFooter } from "@/components/ui/card";
import { Star } from "lucide-react";

interface FeedbackFormProps {
  onSubmit: (data: { rating: number; comment: string }) => void;
  loading?: boolean;
}

export function FeedbackForm({ onSubmit, loading }: FeedbackFormProps) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ rating, comment });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Compartilhe seu Feedback</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div>
            <Label>Avaliação</Label>
            <div className="flex gap-1 mt-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button 
                  key={star} 
                  type="button" 
                  onClick={() => setRating(star)} 
                  className="focus:outline-none"
                >
                  <Star 
                    className={`h-6 w-6 ${star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} 
                  />
                </button>
              ))}
            </div>
          </div>
          <div>
            <Label htmlFor="comment">Comentários</Label>
            <Textarea 
              id="comment" 
              value={comment} 
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setComment(e.target.value)} 
              placeholder="Conte-nos o que você achou..." 
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={loading || rating === 0}>
            {loading ? "Enviando..." : "Enviar Feedback"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
