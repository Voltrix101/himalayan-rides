import { useState } from 'react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../../../config/firebase';

interface ImageUploaderProps {
  onUploaded: (url: string) => void;
  pathPrefix?: string;
  label?: string;
}

export function ImageUploader({ onUploaded, pathPrefix = 'images/experiences', label = 'Upload Image' }: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const filePath = `${pathPrefix}/${Date.now()}-${file.name}`;
      const fileRef = ref(storage, filePath);
      await uploadBytes(fileRef, file);
      const url = await getDownloadURL(fileRef);
      onUploaded(url);
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  return (
    <div className="flex items-center gap-3">
      <label className="px-4 py-3 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-lg cursor-pointer">
        <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
        {isUploading ? 'Uploading...' : label}
      </label>
      {isUploading && <span className="text-white/60 text-sm">Please wait...</span>}
    </div>
  );
}



