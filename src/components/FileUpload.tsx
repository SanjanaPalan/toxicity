import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, CheckCircle2, AlertCircle, Trash2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  acceptedFormats?: string[];
  maxSize?: number;
  className?: string;
}

interface UploadedFile {
  file: File;
  preview?: string;
  status: 'uploading' | 'success' | 'error';
  error?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onFileSelect,
  acceptedFormats = ['.csv', '.xlsx', '.xls', '.txt', '.tsv'],
  maxSize = 50 * 1024 * 1024, // 50MB
  className
}) => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setIsProcessing(true);
    
    const newFiles: UploadedFile[] = acceptedFiles.map(file => ({
      file,
      status: 'uploading' as const
    }));
    
    setUploadedFiles(prev => [...prev, ...newFiles]);

    // Simulate file processing
    for (let i = 0; i < newFiles.length; i++) {
      const file = newFiles[i];
      
      try {
        // Simulate processing delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Validate file
        if (file.file.size > maxSize) {
          throw new Error(`File size exceeds ${maxSize / (1024 * 1024)}MB limit`);
        }
        
        setUploadedFiles(prev => 
          prev.map(f => 
            f.file === file.file 
              ? { ...f, status: 'success' as const }
              : f
          )
        );
        
        // Notify parent component
        onFileSelect(file.file);
        
      } catch (error) {
        setUploadedFiles(prev => 
          prev.map(f => 
            f.file === file.file 
              ? { 
                  ...f, 
                  status: 'error' as const, 
                  error: error instanceof Error ? error.message : 'Upload failed' 
                }
              : f
          )
        );
      }
    }
    
    setIsProcessing(false);
  }, [maxSize, onFileSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'text/plain': ['.txt'],
      'text/tab-separated-values': ['.tsv']
    },
    maxSize,
    multiple: true
  });

  const removeFile = (fileToRemove: File) => {
    setUploadedFiles(prev => prev.filter(f => f.file !== fileToRemove));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={cn("space-y-4", className)}>
      <Card className="border-2 border-dashed border-primary/20 transition-smooth hover:shadow-scientific hover-lift gradient-glass">
        <CardContent className="p-8">
          <div
            {...getRootProps()}
            className={cn(
              "flex flex-col items-center justify-center space-y-4 cursor-pointer transition-smooth",
              isDragActive && "scale-105"
            )}
          >
            <input {...getInputProps()} />
            
            <div className={cn(
              "w-16 h-16 rounded-full flex items-center justify-center transition-bounce",
              isDragActive 
                ? "gradient-interactive text-white shadow-intense hover-bounce" 
                : "bg-secondary text-secondary-foreground hover-glow"
            )}>
              <Upload className="w-8 h-8 float-animation" />
            </div>
            
            <div className="text-center space-y-2">
              <h3 className="text-lg font-semibold">
                {isDragActive ? "Drop your files here!" : "Upload Dataset Files"}
              </h3>
              <p className="text-muted-foreground">
                Drag & drop your SMILES datasets or click to browse
              </p>
              <p className="text-sm text-muted-foreground">
                Supports: {acceptedFormats.join(', ')} • Max size: {maxSize / (1024 * 1024)}MB
              </p>
            </div>
            
            <Button variant="outline" size="lg" className="transition-bounce hover-bounce gradient-glass border-primary/20">
              Browse Files
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Uploaded Files List */}
      {uploadedFiles.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <h4 className="font-semibold mb-4">Uploaded Files</h4>
            <div className="space-y-3">
              {uploadedFiles.map((uploadedFile, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 transition-smooth"
                >
                  <div className="flex items-center space-x-3">
                    <FileText className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-sm">{uploadedFile.file.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(uploadedFile.file.size)}
                      </p>
                      {uploadedFile.error && (
                        <p className="text-xs text-destructive">{uploadedFile.error}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {uploadedFile.status === 'uploading' && (
                      <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    )}
                    {uploadedFile.status === 'success' && (
                      <CheckCircle2 className="w-5 h-5 text-accent" />
                    )}
                    {uploadedFile.status === 'error' && (
                      <AlertCircle className="w-5 h-5 text-destructive" />
                    )}
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(uploadedFile.file)}
                      className="h-8 w-8 p-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};