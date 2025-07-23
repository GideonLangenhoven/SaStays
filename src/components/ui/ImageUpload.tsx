import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, X, Camera, Video, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface UploadedFile {
  id: string;
  url: string;
  file?: File;
  isMain?: boolean;
}

interface ImageUploadProps {
  onFilesChange: (files: File[]) => void;
  existingImages?: string[];
}

export const ImageUpload: React.FC<ImageUploadProps> = ({ onFilesChange, existingImages = [] }) => {
  const [photos, setPhotos] = useState<UploadedFile[]>(
    existingImages.map((url, index) => ({
      id: `existing-${index}`,
      url,
      isMain: index === 0,
    }))
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const newPhotos: UploadedFile[] = files
      .filter(file => file.type.startsWith('image/'))
      .map(file => ({
        id: `new-${Date.now()}-${Math.random()}`,
        url: URL.createObjectURL(file),
        file,
        isMain: false,
      }));

    if (newPhotos.length > 0) {
      const updatedPhotos = [...photos, ...newPhotos];
      if (updatedPhotos.length > 0 && !updatedPhotos.some(p => p.isMain)) {
        updatedPhotos[0].isMain = true;
      }
      setPhotos(updatedPhotos);
      onFilesChange(updatedPhotos.map(p => p.file).filter((f): f is File => !!f));
    }
  };

  const removePhoto = (id: string) => {
    const updatedPhotos = photos.filter(photo => photo.id !== id);
    if (updatedPhotos.length > 0 && !updatedPhotos.some(p => p.isMain)) {
      updatedPhotos[0].isMain = true;
    }
    setPhotos(updatedPhotos);
    onFilesChange(updatedPhotos.map(p => p.file).filter((f): f is File => !!f));
  };

  const setMainPhoto = (id: string) => {
    setPhotos(
      photos.map(photo => ({
        ...photo,
        isMain: photo.id === id,
      }))
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="h-5 w-5" />
          Photos
        </CardTitle>
        <CardDescription>
          Upload high-quality photos. The first photo will be the main image.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <Upload className="mx-auto h-12 w-12 text-gray-400" />
          <div className="mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
            >
              Upload Photos
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
          <p className="mt-2 text-sm text-gray-500">
            Drag and drop or click to upload (JPG, PNG).
          </p>
        </div>

        {photos.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {photos.map(photo => (
              <div key={photo.id} className="relative group">
                <img
                  src={photo.url}
                  alt="Property"
                  className="w-full h-32 object-cover rounded-lg"
                />
                {photo.isMain && (
                  <Badge className="absolute top-2 left-2 bg-primary">
                    Main
                  </Badge>
                )}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    type="button"
                    size="icon"
                    variant="destructive"
                    className="h-6 w-6"
                    onClick={() => removePhoto(photo.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                {!photo.isMain && (
                  <div className="absolute bottom-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      onClick={() => setMainPhoto(photo.id)}
                    >
                      <Star className="h-4 w-4 mr-1" />
                      Main
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};