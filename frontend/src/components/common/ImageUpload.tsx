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
    entityType?: string; // e.g. 'users', 'courses'
    entityId?: string | number;
    category?: string; // e.g. 'photo', 'thumbnail'
}

export const ImageUpload = ({
    value,
    onChange,
    label,
    className = "",
    variant = 'standard',
    placeholder = "Upload Image",
    entityType,
    entityId,
    category
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
        if (entityType) formData.append('entity_type', entityType);
        if (entityId) formData.append('entity_id', String(entityId));
        if (category) {
            formData.append('category', category);
        } else if (variant === 'avatar') {
            formData.append('category', 'photo');
        } else if (variant === 'banner') {
            formData.append('category', 'banner');
        }

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
                return "w-full h-48 rounded-xl bg-white";
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
                    relative overflow-hidden bg-gray-50 border-2 border-dashed border-gray-300 
                    text-gray-400 hover:border-indigo-500 hover:bg-indigo-50 transition-all duration-200 cursor-pointer group
                    flex items-center justify-center
                    ${getContainerStyles()}
                    ${isUploading ? 'opacity-50 pointer-events-none' : ''}
                `}
                title="Click to upload image"
            >
                {preview ? (
                    <>
                        <img
                            src={getImageUrl(preview)}
                            alt="Preview"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                                // Simple gray placeholder with an 'X' icon
                                (e.target as HTMLImageElement).src = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22150%22%20height%3D%22150%22%20viewBox%3D%220%200%20150%20150%22%20fill%3D%22none%22%3E%3Crect%20width%3D%22150%22%20height%3D%22150%22%20fill%3D%22%23F3F4F6%22%2F%3E%3Ctext%20x%3D%2250%25%22%20y%3D%2250%25%22%20dominant-baseline%3D%22middle%22%20text-anchor%3D%22middle%22%20font-family%3D%22sans-serif%22%20font-size%3D%2214%22%20fill%3D%22%239CA3AF%22%3EImage%20Error%3C%2Ftext%3E%3C%2Fsvg%3E';
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
            {
                variant === 'standard' && (
                    <p className="text-xs text-gray-500">
                        Recommended: 1280x720px (16:9). Max 5MB.
                    </p>
                )
            }
        </div >
    );
};
