import { useState } from "react";
import { format } from "date-fns";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface Screenshot {
  id: string;
  url: string;
  thumbnailUrl: string;
  timestamp: string;
}

interface Props {
  screenshots: Screenshot[];
}

export const ScreenshotGallery = ({ screenshots }: Props) => {
  const [selected, setSelected] = useState<Screenshot | null>(null);

  return (
    <>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {screenshots.map((ss) => (
          <div
            key={ss.id}
            role="button"
            tabIndex={0}
            className="cursor-pointer overflow-hidden rounded-lg bg-muted"
            onClick={() => setSelected(ss)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setSelected(ss);
              }
            }}
          >
            <img src={ss.thumbnailUrl} alt="" className="h-32 w-full object-cover" />
            <div className="p-2 text-sm text-muted-foreground">
              {format(new Date(ss.timestamp), "HH:mm")}
            </div>
          </div>
        ))}
      </div>
      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-w-4xl">
          {selected && <img src={selected.url} alt="" className="w-full" />}
        </DialogContent>
      </Dialog>
    </>
  );
};
