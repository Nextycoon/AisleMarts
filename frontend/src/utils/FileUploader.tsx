/**
 * AisleMarts File Uploader - Production Ready
 * Secure file uploads with pre-signed URLs and progress tracking
 */

import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';

const API_BASE = process.env.EXPO_PUBLIC_BACKEND_URL || 'https://marketplace-docs.preview.emergentagent.com';

interface UploadConfig {
  maxFileSizeMB: number;
  allowedExtensions: string[];
  allowedMimeTypes: string[];
  uploadTimeoutMinutes: number;
  contexts: string[];
}

interface UploadOptions {
  context: 'rfq' | 'affiliate' | 'product' | 'profile' | 'general';
  onProgress?: (progress: number) => void;
  onError?: (error: string) => void;
  metadata?: Record<string, string>;
}

interface UploadResult {
  success: boolean;
  fileUrl?: string;
  fileKey?: string;
  uploadId?: string;
  error?: string;
}

class FileUploader {
  private static instance: FileUploader;
  private config: UploadConfig | null = null;
  private authToken: string | null = null;

  public static getInstance(): FileUploader {
    if (!FileUploader.instance) {
      FileUploader.instance = new FileUploader();
    }
    return FileUploader.instance;
  }

  /**
   * Initialize uploader with auth token
   */
  public setAuthToken(token: string) {
    this.authToken = token;
  }

  /**
   * Get upload configuration from server
   */
  public async getConfig(): Promise<UploadConfig> {
    if (this.config) {
      return this.config;
    }

    try {
      const response = await fetch(`${API_BASE}/v1/uploads/config`);
      if (!response.ok) {
        throw new Error(`Failed to get config: ${response.status}`);
      }
      
      this.config = await response.json();
      return this.config!;
      
    } catch (error) {
      console.error('Error fetching upload config:', error);
      
      // Fallback config
      return {
        maxFileSizeMB: 25,
        allowedExtensions: ['.jpg', '.jpeg', '.png', '.pdf', '.doc', '.docx'],
        allowedMimeTypes: ['image/jpeg', 'image/png', 'application/pdf'],
        uploadTimeoutMinutes: 15,
        contexts: ['rfq', 'affiliate', 'product', 'profile', 'general']
      };
    }
  }

  /**
   * Pick image from camera or gallery
   */
  public async pickImage(options: { 
    allowsEditing?: boolean;
    quality?: number;
    source?: 'camera' | 'gallery' | 'both';
  } = {}): Promise<DocumentPicker.DocumentPickerAsset | null> {
    try {
      // Request permissions
      if (options.source === 'camera' || options.source === 'both' || !options.source) {
        const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
        if (cameraPermission.status !== 'granted') {
          throw new Error('Camera permission is required');
        }
      }

      if (options.source === 'gallery' || options.source === 'both' || !options.source) {
        const galleryPermission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (galleryPermission.status !== 'granted') {
          throw new Error('Gallery permission is required');
        }
      }

      let result: ImagePicker.ImagePickerResult;

      if (options.source === 'camera') {
        result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: options.allowsEditing ?? true,
          aspect: [4, 3],
          quality: options.quality ?? 0.8,
        });
      } else {
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: options.allowsEditing ?? true,
          aspect: [4, 3],
          quality: options.quality ?? 0.8,
        });
      }

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        
        // Convert to DocumentPicker format for consistency
        return {
          uri: asset.uri,
          name: `image_${Date.now()}.jpg`,
          mimeType: 'image/jpeg',
          size: asset.fileSize || 0,
          file: undefined as any, // Not available in Expo
        };
      }

      return null;
    } catch (error) {
      console.error('Error picking image:', error);
      throw error;
    }
  }

  /**
   * Pick document file
   */
  public async pickDocument(options: {
    type?: string[];
    multiple?: boolean;
  } = {}): Promise<DocumentPicker.DocumentPickerAsset[] | null> {
    try {
      const config = await this.getConfig();
      
      const result = await DocumentPicker.getDocumentAsync({
        type: options.type || config.allowedMimeTypes,
        multiple: options.multiple ?? false,
        copyToCacheDirectory: true,
      });

      if (!result.canceled) {
        return result.assets;
      }

      return null;
    } catch (error) {
      console.error('Error picking document:', error);
      throw error;
    }
  }

  /**
   * Upload single file with progress tracking
   */
  public async uploadFile(
    file: DocumentPicker.DocumentPickerAsset,
    options: UploadOptions
  ): Promise<UploadResult> {
    try {
      // Validate auth token
      if (!this.authToken) {
        throw new Error('Authentication token required');
      }

      // Get upload config
      const config = await this.getConfig();

      // Validate file size
      const fileSizeMB = file.size ? file.size / 1024 / 1024 : 0;
      if (fileSizeMB > config.maxFileSizeMB) {
        throw new Error(`File size (${fileSizeMB.toFixed(1)}MB) exceeds maximum (${config.maxFileSizeMB}MB)`);
      }

      // Validate file type
      const fileExtension = this.getFileExtension(file.name || '');
      if (!config.allowedExtensions.includes(fileExtension.toLowerCase())) {
        throw new Error(`File type ${fileExtension} not allowed`);
      }

      // Get file info
      const fileInfo = await FileSystem.getInfoAsync(file.uri);
      if (!fileInfo.exists) {
        throw new Error('File does not exist');
      }

      console.log('📁 Starting upload for:', file.name, `(${fileSizeMB.toFixed(1)}MB)`);

      // Step 1: Get signed upload URL
      const signedUrlResponse = await this.getSignedUploadUrl({
        filename: file.name || 'unnamed_file',
        content_type: file.mimeType || 'application/octet-stream',
        file_size: file.size || 0,
        upload_context: options.context,
        metadata: options.metadata || {}
      });

      console.log('🔐 Got signed URL:', signedUrlResponse.upload_id);

      // Step 2: Upload file to signed URL
      const uploadResult = await this.uploadToSignedUrl(
        file.uri,
        signedUrlResponse.upload_url,
        file.mimeType || 'application/octet-stream',
        options.onProgress
      );

      if (!uploadResult.success) {
        throw new Error(uploadResult.error || 'File upload failed');
      }

      console.log('⬆️ File uploaded successfully');

      // Step 3: Confirm upload
      const confirmResult = await this.confirmUpload({
        upload_id: signedUrlResponse.upload_id,
        file_key: signedUrlResponse.file_key,
        actual_size: file.size,
        upload_context: options.context
      });

      console.log('✅ Upload confirmed:', confirmResult.file_url);

      return {
        success: true,
        fileUrl: confirmResult.file_url,
        fileKey: confirmResult.file_key,
        uploadId: confirmResult.upload_id
      };

    } catch (error) {
      console.error('Upload error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      
      if (options.onError) {
        options.onError(errorMessage);
      }

      return {
        success: false,
        error: errorMessage
      };
    }
  }

  /**
   * Upload multiple files
   */
  public async uploadMultiple(
    files: DocumentPicker.DocumentPickerAsset[],
    options: UploadOptions
  ): Promise<UploadResult[]> {
    const results: UploadResult[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      console.log(`📁 Uploading file ${i + 1}/${files.length}: ${file.name}`);
      
      const result = await this.uploadFile(file, {
        ...options,
        onProgress: (progress) => {
          // Adjust progress for multiple files
          const totalProgress = ((i / files.length) + (progress / files.length)) * 100;
          if (options.onProgress) {
            options.onProgress(totalProgress);
          }
        }
      });
      
      results.push(result);
      
      // Stop on first failure if desired
      if (!result.success) {
        console.error(`❌ Failed to upload ${file.name}:`, result.error);
      }
    }
    
    return results;
  }

  /**
   * Get signed upload URL from server
   */
  private async getSignedUploadUrl(request: any) {
    const response = await fetch(`${API_BASE}/v1/uploads/signed-url`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.authToken}`,
      },
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `Server error: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Upload file to pre-signed URL
   */
  private async uploadToSignedUrl(
    fileUri: string,
    signedUrl: string,
    contentType: string,
    onProgress?: (progress: number) => void
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // For development with mock signed URLs, we'll simulate the upload
      if (signedUrl.includes('mock-s3')) {
        console.log('🔄 Simulating upload to mock S3...');
        
        // Simulate upload progress
        if (onProgress) {
          for (let i = 0; i <= 100; i += 10) {
            onProgress(i);
            await new Promise(resolve => setTimeout(resolve, 100));
          }
        }
        
        return { success: true };
      }

      // Real S3 upload (for production)
      const fileInfo = await FileSystem.getInfoAsync(fileUri);
      if (!fileInfo.exists) {
        throw new Error('File not found');
      }

      const uploadResult = await FileSystem.uploadAsync(signedUrl, fileUri, {
        httpMethod: 'PUT',
        headers: {
          'Content-Type': contentType,
        },
        uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
      });

      if (uploadResult.status >= 200 && uploadResult.status < 300) {
        return { success: true };
      } else {
        throw new Error(`Upload failed with status: ${uploadResult.status}`);
      }

    } catch (error) {
      console.error('Error uploading to signed URL:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed'
      };
    }
  }

  /**
   * Confirm upload completion
   */
  private async confirmUpload(request: any) {
    const response = await fetch(`${API_BASE}/v1/uploads/confirm`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.authToken}`,
      },
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `Confirmation failed: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Get file extension from filename
   */
  private getFileExtension(filename: string): string {
    const lastDot = filename.lastIndexOf('.');
    return lastDot > 0 ? filename.substring(lastDot) : '';
  }

  /**
   * Cancel upload (if supported)
   */
  public async cancelUpload(uploadId: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE}/v1/uploads/${uploadId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${this.authToken}`,
        },
      });

      return response.ok;
    } catch (error) {
      console.error('Error cancelling upload:', error);
      return false;
    }
  }
}

export default FileUploader;
export type { UploadOptions, UploadResult, UploadConfig };