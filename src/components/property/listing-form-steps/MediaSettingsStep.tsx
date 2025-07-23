
import React, { useRef } from 'react';
import { useFormContext } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Upload, X, Camera, Video, Star } from 'lucide-react';

interface MediaSettingsStepProps {
  uploadedPhotos: Array<{ id: string; url: string; file?: File; isMain: boolean }>;
  uploadedVideos: Array<{ id: string; url: string; thumbnail: string; file?: File }>;
  handlePhotoUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleVideoUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  removePhoto: (id: string) => void;
  setMainPhoto: (id: string) => void;
  removeVideo: (id: string) => void;
}

export const MediaSettingsStep: React.FC<MediaSettingsStepProps> = ({
  uploadedPhotos,
  uploadedVideos,
  handlePhotoUpload,
  handleVideoUpload,
  removePhoto,
  setMainPhoto,
  removeVideo,
}) => {
  const { register, watch, setValue } = useFormContext();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Camera className="h-5 w-5" />Photos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <Camera className="mx-auto h-12 w-12 text-gray-400" />
            <div className="mt-4">
              <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}><Upload className="mr-2 h-4 w-4" />Upload Photos</Button>
              <input ref={fileInputRef} type="file" multiple accept="image/*" className="hidden" onChange={handlePhotoUpload} />
            </div>
            <p className="mt-2 text-sm text-gray-500">Upload high-quality photos (JPG, PNG). First photo will be your main photo.</p>
          </div>
          {uploadedPhotos.length > 0 && (
            <div className="grid grid-cols-3 gap-4">
              {uploadedPhotos.map((photo) => (
                <div key={photo.id} className="relative group">
                  <img src={photo.url} alt="Property" className="w-full h-32 object-cover rounded-lg" />
                  {photo.isMain && (<Badge className="absolute top-2 left-2 bg-green-500">Main Photo</Badge>)}
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button type="button" size="sm" variant="destructive" onClick={() => removePhoto(photo.id)}><X className="h-3 w-3" /></Button>
                  </div>
                  {!photo.isMain && (
                    <div className="absolute bottom-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button type="button" size="sm" variant="outline" onClick={() => setMainPhoto(photo.id)}><Star className="h-3 w-3" /></Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Video className="h-5 w-5" />Videos (Optional)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <Video className="mx-auto h-12 w-12 text-gray-400" />
            <div className="mt-4">
              <Button type="button" variant="outline" onClick={() => videoInputRef.current?.click()}><Upload className="mr-2 h-4 w-4" />Upload Videos</Button>
              <input ref={videoInputRef} type="file" multiple accept="video/*" className="hidden" onChange={handleVideoUpload} />
            </div>
            <p className="mt-2 text-sm text-gray-500">Upload video tours (MP4, MOV). Max 10MB per video.</p>
          </div>
          {uploadedVideos.length > 0 && (
            <div className="grid grid-cols-2 gap-4">
              {uploadedVideos.map((video) => (
                <div key={video.id} className="relative group">
                  <video src={video.url} className="w-full h-32 object-cover rounded-lg" controls />
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button type="button" size="sm" variant="destructive" onClick={() => removeVideo(video.id)}><X className="h-3 w-3" /></Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Booking Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="minAge">Minimum Guest Age</Label>
            <Input id="minAge" type="number" min="18" max="99" {...register('guestRequirements.minAge', { valueAsNumber: true })} />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5"><Label>Verification Required</Label><p className="text-sm text-muted-foreground">Require guests to verify their identity</p></div>
            <Switch checked={watch('guestRequirements.verificationRequired')} onCheckedChange={(checked) => setValue('guestRequirements.verificationRequired', checked)} />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5"><Label>Government ID Required</Label><p className="text-sm text-muted-foreground">Require guests to provide government-issued ID</p></div>
            <Switch checked={watch('guestRequirements.governmentIdRequired')} onCheckedChange={(checked) => setValue('guestRequirements.governmentIdRequired', checked)} />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5"><Label>Instant Booking</Label><p className="text-sm text-muted-foreground">Allow guests to book instantly without approval</p></div>
            <Switch checked={watch('instantBooking')} onCheckedChange={(checked) => setValue('instantBooking', checked)} />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5"><Label>Active Listing</Label><p className="text-sm text-muted-foreground">Make this listing visible to guests</p></div>
            <Switch checked={watch('isActive')} onCheckedChange={(checked) => setValue('isActive', checked)} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};