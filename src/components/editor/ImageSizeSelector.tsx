import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlignLeft, AlignCenter, AlignRight, Maximize } from 'lucide-react';

interface ImageSizeSelectorProps {
  sizePreset: string;
  setSizePreset: (preset: string) => void;
  imageWidth?: number;
  imageHeight?: number;
  setImageWidth: (width: number | undefined) => void;
  setImageHeight: (height: number | undefined) => void;
  originalWidth: number;
  originalHeight: number;
  onPresetChange: (preset: string) => void;
  alignment: string;
  setAlignment: (alignment: string) => void;
}

export const ImageSizeSelector: React.FC<ImageSizeSelectorProps> = ({
  sizePreset,
  setSizePreset,
  imageWidth,
  imageHeight,
  setImageWidth,
  setImageHeight,
  originalWidth,
  originalHeight,
  onPresetChange,
  alignment,
  setAlignment,
}) => {
  return (
    <div className="space-y-4">
      <div>
        <Label>Image Size</Label>
        <div className="grid grid-cols-5 gap-2 mt-2">
          <Button
            type="button"
            variant={sizePreset === 'small' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onPresetChange('small')}
          >
            Small
          </Button>
          <Button
            type="button"
            variant={sizePreset === 'medium' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onPresetChange('medium')}
          >
            Medium
          </Button>
          <Button
            type="button"
            variant={sizePreset === 'large' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onPresetChange('large')}
          >
            Large
          </Button>
          <Button
            type="button"
            variant={sizePreset === 'full' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onPresetChange('full')}
          >
            Full
          </Button>
          <Button
            type="button"
            variant={sizePreset === 'custom' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSizePreset('custom')}
          >
            Custom
          </Button>
        </div>
        {originalWidth > 0 && (
          <p className="text-xs text-muted-foreground mt-2">
            Original: {originalWidth} × {originalHeight}px • 
            {sizePreset === 'small' && ' 400px width'}
            {sizePreset === 'medium' && ' 600px width'}
            {sizePreset === 'large' && ' 800px width'}
            {sizePreset === 'full' && ' Full width'}
          </p>
        )}
      </div>

      {sizePreset === 'custom' && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="custom-width">Width (px)</Label>
            <Input
              id="custom-width"
              type="number"
              placeholder="Auto"
              value={imageWidth || ''}
              onChange={(e) => setImageWidth(e.target.value ? parseInt(e.target.value) : undefined)}
            />
          </div>
          <div>
            <Label htmlFor="custom-height">Height (px)</Label>
            <Input
              id="custom-height"
              type="number"
              placeholder="Auto"
              value={imageHeight || ''}
              onChange={(e) => setImageHeight(e.target.value ? parseInt(e.target.value) : undefined)}
            />
          </div>
        </div>
      )}

      <div className="pt-4 border-t">
        <Label>Image Alignment</Label>
        <div className="grid grid-cols-4 gap-2 mt-2">
          <Button
            type="button"
            variant={alignment === 'left' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setAlignment('left')}
            className="flex items-center justify-center gap-1"
          >
            <AlignLeft className="h-4 w-4" />
            Left
          </Button>
          <Button
            type="button"
            variant={alignment === 'center' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setAlignment('center')}
            className="flex items-center justify-center gap-1"
          >
            <AlignCenter className="h-4 w-4" />
            Center
          </Button>
          <Button
            type="button"
            variant={alignment === 'right' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setAlignment('right')}
            className="flex items-center justify-center gap-1"
          >
            <AlignRight className="h-4 w-4" />
            Right
          </Button>
          <Button
            type="button"
            variant={alignment === 'full' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setAlignment('full')}
            className="flex items-center justify-center gap-1"
          >
            <Maximize className="h-4 w-4" />
            Full
          </Button>
        </div>
      </div>
    </div>
  );
};
