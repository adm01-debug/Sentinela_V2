import { useState } from 'react';
import { Dialog } from './ui/Dialog';
import { format } from 'date-fns';

interface Screenshot { id: string; url: string; thumbnailUrl: string; timestamp: string; }
interface Props { screenshots: Screenshot[]; }

export const ScreenshotGallery = ({ screenshots }: Props) => {
  const [selected, setSelected] = useState<Screenshot | null>(null);

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {screenshots.map(ss => (
          <div key={ss.id} className="cursor-pointer rounded-lg overflow-hidden bg-muted" onClick={() => setSelected(ss)}>
            <img src={ss.thumbnailUrl} alt="" className="w-full h-32 object-cover" />
            <div className="p-2 text-sm text-muted-foreground">{format(new Date(ss.timestamp), 'HH:mm')}</div>
          </div>
        ))}
      </div>
      <Dialog open={!!selected} onClose={() => setSelected(null)}>
        {selected && <img src={selected.url} alt="" className="w-full" />}
      </Dialog>
    </>
  );
};