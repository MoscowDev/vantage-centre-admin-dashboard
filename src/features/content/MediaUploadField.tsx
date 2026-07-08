import React, { useState, useRef, useEffect } from 'react';
import { Upload, Film, Image as ImageIcon, CheckCircle, Loader2 } from 'lucide-react';
import { apiClient } from '../../api/client';
import { useToast } from '../../components/ui/Toast';

interface MediaUploadFieldProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  allowedTypes?: 'image' | 'video' | 'any';
}

declare global {
  interface Window {
    cloudinary?: any;
  }
}

export const MediaUploadField: React.FC<MediaUploadFieldProps> = ({
  label,
  value,
  onChange,
  allowedTypes = 'any',
}) => {
  const { showToast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isWidgetLoaded, setIsWidgetLoaded] = useState(false);

  useEffect(() => {
    if (window.cloudinary) {
      setIsWidgetLoaded(true);
    } else {
      const script = document.createElement('script');
      script.src = 'https://widget.cloudinary.com/v2.0/global/all.js';
      script.async = true;
      script.onload = () => setIsWidgetLoaded(true);
      document.body.appendChild(script);
    }
  }, []);

  const openCloudinaryWidget = () => {
    if (!window.cloudinary) {
      showToast('Cloudinary SDK not loaded. Falling back to direct upload.', 'warning');
      fileInputRef.current?.click();
      return;
    }

    const widget = window.cloudinary.createUploadWidget(
      {
        cloudName: 'vantage-centre',
        uploadPreset: 'vantage_preset',
        sources: ['local', 'url', 'camera'],
        multiple: false,
        resourceType: allowedTypes === 'any' ? 'auto' : allowedTypes,
      },
      (error: any, result: any) => {
        if (!error && result && result.event === 'success') {
          const secureUrl = result.info.secure_url;
          onChange(secureUrl);
          showToast('Media uploaded successfully', 'success');
        } else if (error) {
          console.error('Cloudinary Widget Error:', error);
          showToast('Cloudinary upload failed.', 'error');
        }
      }
    );
    widget.open();
  };

  const handleLocalFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const formData = new FormData();
    formData.append('file', file);

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const response = await apiClient.post<{ secure_url: string }>('/admin/media/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(percent);
          }
        },
      });

      const uploadedUrl = response.data.secure_url;
      onChange(uploadedUrl);
      showToast('File uploaded successfully to server', 'success');
    } catch (err: any) {
      console.error('Local upload failed:', err);
      const errMsg = err.response?.data?.message || 'Upload failed. Check file bounds.';
      showToast(errMsg, 'error');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const isVideo = (url: string) => {
    return url.match(/\.(mp4|webm|ogg|mov)$/i) || url.includes('/video/upload/');
  };

  return (
    <div className="space-y-2 bg-canvas border border-border p-4 rounded-[8px]">
      <div className="flex justify-between items-center">
        <label className="text-[9px] font-bold uppercase tracking-widest text-muted">{label}</label>
        {value && (
          <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-600">
            <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
            <span>Assigned</span>
          </span>
        )}
      </div>

      {/* Media Upload dashed drop target */}
      {value ? (
        <div className="relative border border-border rounded-[8px] overflow-hidden bg-surface max-h-[140px] flex items-center justify-center">
          {isVideo(value) ? (
            <video src={value} className="max-h-[140px] w-full object-contain" controls />
          ) : (
            <img src={value} alt="Media Preview" className="max-h-[140px] object-contain w-full" />
          )}
          <div className="absolute top-2 right-2 bg-slate-900/80 px-2 py-1 rounded-[4px] text-[9px] font-mono text-white truncate max-w-[130px]">
            {value.split('/').pop()}
          </div>
        </div>
      ) : (
        <div className="border border-dashed border-border rounded-[8px] p-5 flex flex-col items-center justify-center text-center bg-surface">
          {allowedTypes === 'video' ? (
            <Film className="h-7 w-7 text-slate-300 mb-1.5" />
          ) : (
            <ImageIcon className="h-7 w-7 text-slate-300 mb-1.5" />
          )}
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">No media file linked</p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center gap-2 pt-1">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleLocalFileUpload}
          accept={allowedTypes === 'image' ? 'image/*' : allowedTypes === 'video' ? 'video/*' : '*/*'}
          className="hidden"
        />

        <button
          type="button"
          onClick={openCloudinaryWidget}
          disabled={isUploading}
          className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-surface border border-border hover:bg-canvas text-ink rounded-[8px] text-xs font-bold transition-all disabled:opacity-50"
        >
          {isUploading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Upload className="h-3.5 w-3.5 text-slate-400" />
          )}
          <span>{isWidgetLoaded ? 'Cloudinary Widget' : 'Local File Upload'}</span>
        </button>

        {value && (
          <button
            type="button"
            onClick={() => onChange('')}
            className="px-3 py-2 border border-transparent hover:border-danger/20 hover:text-danger hover:bg-danger/10 text-xs font-bold text-muted rounded-[8px] transition-all"
          >
            Clear
          </button>
        )}
      </div>

      {/* Upload progress meter */}
      {isUploading && (
        <div className="space-y-1">
          <div className="flex justify-between text-[9px] font-bold text-muted uppercase">
            <span>Uploading...</span>
            <span>{uploadProgress}%</span>
          </div>
          <div className="w-full bg-slate-200 h-1 rounded-full overflow-hidden">
            <div className="bg-accent h-full transition-all duration-150" style={{ width: `${uploadProgress}%` }} />
          </div>
        </div>
      )}
    </div>
  );
};
