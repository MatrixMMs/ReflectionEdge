import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '../firebase';
import imageCompression from 'browser-image-compression';

export interface UploadProgress {
  progress: number;
  fileName: string;
}

export interface UploadedImage {
  url: string;
  fileName: string;
}

export const uploadImage = async (
  file: File,
  onProgress?: (progress: UploadProgress) => void
): Promise<UploadedImage> => {
  try {
    // Compress the image
    const options = {
      maxSizeMB: 1,
      maxWidthOrHeight: 1920,
      useWebWorker: true
    };
    
    const compressedFile = await imageCompression(file, options);
    
    // Create a unique filename
    const timestamp = Date.now();
    const fileName = `${timestamp}-${file.name}`;
    const storageRef = ref(storage, `trade-screenshots/${fileName}`);

    // Upload the file
    const uploadTask = uploadBytes(storageRef, compressedFile);
    
    // Get the download URL
    const snapshot = await uploadTask;
    const downloadURL = await getDownloadURL(snapshot.ref);

    return {
      url: downloadURL,
      fileName: fileName
    };
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};

export const deleteImage = async (url: string): Promise<void> => {
  try {
    const storageRef = ref(storage, url);
    await deleteObject(storageRef);
  } catch (error) {
    console.error('Error deleting image:', error);
    throw error;
  }
};

export const validateImage = (file: File): { isValid: boolean; error?: string } => {
  // Check if file is an image
  if (!file.type.startsWith('image/')) {
    return { isValid: false, error: 'File must be an image' };
  }

  // Check file size (5MB limit)
  const maxSize = 5 * 1024 * 1024; // 5MB in bytes
  if (file.size > maxSize) {
    return { isValid: false, error: 'Image size must be less than 5MB' };
  }

  return { isValid: true };
};

export const uploadMultipleImages = async (
  files: File[],
  onProgress?: (progress: UploadProgress) => void
): Promise<UploadedImage[]> => {
  const uploadPromises = files.map(file => uploadImage(file, onProgress));
  return Promise.all(uploadPromises);
}; 