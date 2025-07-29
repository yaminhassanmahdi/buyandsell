"use client";

import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { X, Upload, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface UploadedFile {
  filename: string;
  url: string;
  size: number;
  type: string;
}

interface ImageUploadProps {
  value: string[];
  onChange: (urls: string[]) => void;
  maxFiles?: number;
  maxSize?: number; // in MB
  accept?: string;
  className?: string;
  showPreview?: boolean;
}

export default function ImageUpload({
  value,
  onChange,
  maxFiles = 5,
  maxSize = 5,
  accept = "image/*",
  className = "",
  showPreview = true
}: ImageUploadProps) {
  // Ensure value is always an array
  const safeValue = Array.isArray(value) ? value : [];
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleFiles = useCallback(async (files: FileList) => {
    if (!files || files.length === 0) return;

    // Check file limits
    if (safeValue.length + files.length > maxFiles) {
      setError(`Maximum ${maxFiles} files allowed`);
      return;
    }

    setError(null);
    setUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      
      // Validate and append files
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Check file type
        if (!file.type.startsWith('image/')) {
          setError('Only image files are allowed');
          setUploading(false);
          return;
        }

        // Check file size
        if (file.size > maxSize * 1024 * 1024) {
          setError(`File size must be less than ${maxSize}MB`);
          setUploading(false);
          return;
        }

        formData.append('files', file);
      }

      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 100);

      const response = await fetch('/api/upload/images', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const result = await response.json();
      const newUrls = result.files.map((file: UploadedFile) => file.url);
      
      // Update the parent component
      onChange([...safeValue, ...newUrls]);

      setTimeout(() => {
        setUploadProgress(0);
        setUploading(false);
      }, 500);

    } catch (error) {
      console.error('Upload error:', error);
      setError(error instanceof Error ? error.message : 'Upload failed');
      setUploading(false);
      setUploadProgress(0);
    }
  }, [safeValue, onChange, maxFiles, maxSize]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  }, [handleFiles]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  }, [handleFiles]);

  const removeImage = useCallback((index: number) => {
    const newValue = [...safeValue];
    newValue.splice(index, 1);
    onChange(newValue);
  }, [safeValue, onChange]);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      <Card 
        className={`border-2 border-dashed transition-colors ${
          dragActive 
            ? 'border-primary bg-primary/5' 
            : 'border-muted-foreground/25 hover:border-primary/50'
        }`}
      >
        <CardContent className="p-6">
          <div
            className="text-center"
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <div className="mx-auto h-12 w-12 text-muted-foreground mb-4">
              {uploading ? (
                <Upload className="h-12 w-12 animate-pulse" />
              ) : (
                <ImageIcon className="h-12 w-12" />
              )}
            </div>
            
            <div className="space-y-2">
              <h3 className="text-lg font-medium">
                {uploading ? 'Uploading...' : 'Upload Images'}
              </h3>
              <p className="text-sm text-muted-foreground">
                Drag and drop images here, or click to select files
              </p>
              <p className="text-xs text-muted-foreground">
                Max {maxFiles} files, {maxSize}MB each. Supports JPG, PNG, GIF, WebP
              </p>
            </div>

            {uploading && (
              <div className="mt-4">
                <Progress value={uploadProgress} className="w-full" />
                <p className="text-sm text-muted-foreground mt-2">
                  {uploadProgress}% complete
                </p>
              </div>
            )}

            {!uploading && (
              <div className="mt-4">
                <input
                  type="file"
                  accept={accept}
                  multiple
                  onChange={handleInputChange}
                  className="hidden"
                  id="file-upload"
                  disabled={safeValue.length >= maxFiles}
                />
                <label htmlFor="file-upload">
                  <Button 
                    type="button" 
                    variant="outline" 
                    disabled={safeValue.length >= maxFiles}
                    className="cursor-pointer"
                    asChild
                  >
                    <span>
                      <Upload className="h-4 w-4 mr-2" />
                      Choose Files
                    </span>
                  </Button>
                </label>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Image Previews */}
      {showPreview && safeValue.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Uploaded Images ({safeValue.length})</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {safeValue.map((url, index) => (
              <div key={index} className="relative group">
                <div className="aspect-square rounded-lg overflow-hidden border">
                  <img
                    src={url}
                    alt={`Upload ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => removeImage(index)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload Status */}
      {safeValue.length > 0 && (
        <p className="text-sm text-muted-foreground">
          {safeValue.length} of {maxFiles} files uploaded
        </p>
      )}
    </div>
  );
} 