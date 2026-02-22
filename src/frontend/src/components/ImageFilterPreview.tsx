import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface ImageFilterPreviewProps {
  preview: string;
  filter: string;
  onFilterChange: (filter: string) => void;
}

const filters = [
  { name: 'None', value: 'none', style: '' },
  { name: 'Bright', value: 'bright', style: 'brightness(1.2) contrast(1.1)' },
  { name: 'Contrast', value: 'contrast', style: 'contrast(1.3) brightness(1.1)' },
  { name: 'Saturate', value: 'saturate', style: 'saturate(1.5) contrast(1.1)' },
];

export default function ImageFilterPreview({ preview, filter, onFilterChange }: ImageFilterPreviewProps) {
  return (
    <div className="space-y-4">
      <div className="relative aspect-square bg-muted rounded-lg overflow-hidden">
        <img
          src={preview}
          alt="Preview"
          className="w-full h-full object-cover"
          style={{ filter: filters.find((f) => f.value === filter)?.style }}
        />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {filters.map((f) => (
          <Button
            key={f.value}
            onClick={() => onFilterChange(f.value)}
            variant={filter === f.value ? 'default' : 'outline'}
            size="sm"
            className="shrink-0"
          >
            {f.name}
          </Button>
        ))}
      </div>
    </div>
  );
}
