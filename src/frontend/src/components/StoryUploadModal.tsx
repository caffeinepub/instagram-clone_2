import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { usePostStory } from '../hooks/useQueries';
import { ExternalBlob } from '../backend';
import { Loader2, Upload } from 'lucide-react';
import { toast } from 'sonner';

export default function StoryUploadModal({ onClose }: { onClose: () => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const postStory = usePostStory();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    try {
      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      const blob = ExternalBlob.fromBytes(uint8Array).withUploadProgress((percentage) => {
        setUploadProgress(percentage);
      });

      await postStory.mutateAsync(blob);
      onClose();
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload story');
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add to Your Story</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {!preview ? (
            <label className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
              <Upload className="h-12 w-12 text-muted-foreground mb-2" />
              <span className="text-sm text-muted-foreground">Click to upload image or video</span>
              <input
                type="file"
                accept="image/*,video/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          ) : (
            <div className="space-y-4">
              <img src={preview} alt="Preview" className="w-full h-64 object-cover rounded-lg" />
              {uploadProgress > 0 && uploadProgress < 100 && (
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              )}
              <div className="flex gap-2">
                <Button onClick={() => { setFile(null); setPreview(null); }} variant="outline" className="flex-1">
                  Change
                </Button>
                <Button onClick={handleUpload} disabled={postStory.isPending} className="flex-1">
                  {postStory.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Share
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
