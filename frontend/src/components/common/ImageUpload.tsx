
import { useState, useRef } from 'react';
import { Image as ImageIcon, Loader2, Camera } from 'lucide-react';
import api from '../../lib/axios';
import toast from 'react-hot-toast';
import { getImageUrl } from '../../lib/utils';

interface ImageUploadProps {
    value?: string;
    onChange: (url: string) => void;
    label?: string;
    className?: string;
    variant?: 'standard' | 'avatar' | 'banner';
    placeholder?: string;
}

export const ImageUpload = ({
    value,
    onChange,
    label,
    className = "",
    variant = 'standard',
    placeholder = "Upload Image"
}: ImageUploadProps) => {
    const [isUploading, setIsUploading] = useState(false);
    const [preview, setPreview] = useState(value);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validation
        if (!file.type.startsWith('image/')) {
            toast.error('Please upload an image file');
            return;
        }

        if (file.size > 5 * 1024 * 1024) { // 5MB limit
            toast.error('Image size should be less than 5MB');
            return;
        }

        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await api.post('/upload/', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            const url = response.data.url;
            setPreview(url);
            onChange(url);
            toast.success('Image uploaded successfully');
        } catch (error) {
            console.error('Upload failed:', error);
            toast.error('Failed to upload image');
        } finally {
            setIsUploading(false);
        }
    };

    const handleContainerClick = () => {
        if (!isUploading) {
            fileInputRef.current?.click();
        }
    };

    // Styles based on variant
    const getContainerStyles = () => {
        switch (variant) {
            case 'avatar':
                return "w-32 h-32 rounded-full";
            case 'banner':
                return "w-full h-48 rounded-xl";
            default: // standard
                return "w-full h-48 rounded-xl max-w-md"; // Limit width for standard to look like thumbnail
        }
    };

    const getPlaceholderContent = () => {
        if (variant === 'avatar') {
            return (
                <div className="flex flex-col items-center justify-center text-gray-400">
                    <Camera className="w-8 h-8 mb-1" />
                </div>
            );
        }
        return (
            <div className="flex flex-col items-center justify-center text-gray-500">
                {isUploading ? (
                    <Loader2 className="w-8 h-8 animate-spin mb-2" />
                ) : (
                    <ImageIcon className="w-8 h-8 mb-2" />
                )}
                <span className="text-sm font-medium">{isUploading ? "Uploading..." : placeholder}</span>
            </div>
        );
    };

    return (
        <div className={`space-y-2 ${className}`}>
            {label && <label className="block text-sm font-medium text-gray-700">{label}</label>}

            <div
                onClick={handleContainerClick}
                className={`
                    relative overflow-hidden bg-gray-100 border-2 border-dashed border-gray-300 
                    flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors group
                    ${getContainerStyles()}
                    ${isUploading ? 'opacity-50 pointer-events-none' : ''}
                `}
            >
                {preview ? (
                    <>
                        <img
                            src={getImageUrl(preview)}
                            alt="Preview"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=Error';
                            }}
                        />
                        {/* Overlay */}
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="text-white flex flex-col items-center">
                                <Camera className="w-6 h-6 mb-1" />
                                <span className="text-xs font-medium">Change Image</span>
                            </div>
                        </div>
                    </>
                ) : (
                    getPlaceholderContent()
                )}

                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileChange}
                />
            </div>
            {variant === 'standard' && (
                <p className="text-xs text-gray-500">
                    Recommended: 1280x720px (16:9). Max 5MB.
                </p>
            )}
        </div>
    );
};
