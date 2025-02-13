import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Image as ImageIcon } from 'lucide-react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, updateDoc } from 'firebase/firestore';
import { auth, db, storage } from '../lib/firebase';
import { Button } from '../components/Button';

export function UploadLogoPage() {
  const [logo, setLogo] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (!auth.currentUser) return;

    const file = acceptedFiles[0];
    if (!file) return;

    setIsUploading(true);
    setError(null);

    try {
      const storageRef = ref(storage, `logos/${auth.currentUser.uid}/${Date.now()}_${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);

      await updateDoc(doc(db, 'profiles', auth.currentUser.uid), {
        logo: downloadURL,
      });

      setLogo(downloadURL);
    } catch (err) {
      setError('Failed to upload logo');
    } finally {
      setIsUploading(false);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png'],
    },
    maxFiles: 1,
    multiple: false,
  });

  return (
    <div className='bg-lime dark:bg-transparent h-screen rounded-xl'>

    
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="bg-white dark:bg-darkgray border border-lime rounded-3xl shadow-lg p-6">
        <div className="flex items-center space-x-4 mb-8">
          <div className="bg-lime p-3 rounded-full">
            <ImageIcon className="h-6 w-6 text-darklime" />
          </div>
          <h1 className="text-2xl font-bold text-darklime dark:text-lime">Upload Logo</h1>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer
            transition-colors duration-200
            ${isDragActive ? ' bg-yellow-50' : 'border-gray-300 hover:border-lime dark:hover:border-darklime'}
          `}
        >
          <input {...getInputProps()} />
          <Upload className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2 text-sm text-gray-600">
            Drag and drop your logo here, or click to select a file
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Supports: JPG, PNG (Max size: 5MB)
          </p>
        </div>

        {isUploading && (
          <div className="mt-4 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400"></div>
          </div>
        )}

        {logo && (
          <div className="mt-6">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Preview</h3>
            <div className="relative w-32 h-32 rounded-lg overflow-hidden">
              <img
                src={logo}
                alt="Company Logo"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        )}
      </div>
    </div>
    </div>
  );
}