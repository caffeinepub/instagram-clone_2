import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useCreatePost } from '../hooks/useQueries';
import { ExternalBlob } from '../backend';
import { Loader2, Upload } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import ImageFilterPreview from '../components/ImageFilterPreview';

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [filter, setFilter] = useState<string>('none');
  const [uploadProgress, setUploadProgress] = useState(0);
  const createPost = useCreatePost();
  const navigate = useNavigate();

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

      await createPost.mutateAsync({ content: blob, caption });
      navigate({ to: '/feed' });
    } catch (error) {
      console.error('Upload error:', error);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Create New Post</h1>

      <div className="space-y-6">
        {!preview ? (
          <label className="flex flex-col items-center justify-center h-96 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
            <Upload className="h-16 w-16 text-muted-foreground mb-4" />
            <span className="text-lg text-muted-foreground">Click to upload image or video</span>
            <span className="text-sm text-muted-foreground mt-2">JPG, PNG, GIF, MP4</span>
            <input
              type="file"
              accept="image/*,video/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
        ) : (
          <div className="space-y-6">
            <ImageFilterPreview preview={preview} filter={filter} onFilterChange={setFilter} />

            <div className="space-y-2">
              <Label htmlFor="caption">Caption</Label>
              <Textarea
                id="caption"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Write a caption..."
                rows={4}
              />
            </div>

            {uploadProgress > 0 && uploadProgress < 100 && (
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            )}

            <div className="flex gap-4">
              <Button
                onClick={() => {
                  setFile(null);
                  setPreview(null);
                  setCaption('');
                  setFilter('none');
                }}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button onClick={handleUpload} disabled={createPost.isPending} className="flex-1">
                {createPost.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Share
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
