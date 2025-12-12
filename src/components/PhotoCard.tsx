import { useState } from 'react';
import { X } from 'lucide-react';
import { Photo } from '@/types/report';
import { cn } from '@/lib/utils';

interface PhotoCardProps {
  photo: Photo;
  onUpdateDescription: (description: string) => void;
  onRemove: () => void;
}

const MAX_CHARS = 110;

export function PhotoCard({ photo, onUpdateDescription, onRemove }: PhotoCardProps) {
  const [description, setDescription] = useState(photo.description);

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= MAX_CHARS) {
      setDescription(value);
      onUpdateDescription(value);
    }
  };

  const charCount = description.length;
  const isNearLimit = charCount >= MAX_CHARS - 20;

  return (
    <div className="bg-card rounded-lg border border-border overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <div className="relative aspect-video bg-muted">
        <img
          src={photo.src}
          alt={photo.description || 'Foto do relatório'}
          className="w-full h-full object-cover"
        />
        <button
          onClick={onRemove}
          className="absolute top-2 right-2 p-1.5 bg-destructive text-destructive-foreground rounded-full hover:bg-destructive/90 transition-colors"
          aria-label="Remover foto"
        >
          <X size={16} />
        </button>
      </div>
      <div className="p-3">
        <textarea
          value={description}
          onChange={handleDescriptionChange}
          placeholder="Descrição da foto..."
          className="w-full h-20 px-3 py-2 text-sm bg-muted border border-border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
          maxLength={MAX_CHARS}
        />
        <div className={cn(
          "text-xs text-right mt-1",
          isNearLimit ? "text-primary" : "text-muted-foreground"
        )}>
          {charCount}/{MAX_CHARS}
        </div>
      </div>
    </div>
  );
}
