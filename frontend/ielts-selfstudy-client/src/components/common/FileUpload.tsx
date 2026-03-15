import { useState, useRef } from 'react';
import { Button } from '../ui';
import { uploadFile } from '../../api/filesApi';

interface FileUploadProps {
    onUploadComplete: (url: string) => void;
    folder?: string;
    accept?: string;
    placeholder?: string;
    currentValue?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
    onUploadComplete,
    folder = 'common',
    accept = '*/*',
    placeholder = 'Upload file',
    currentValue
}) => {
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            const res = await uploadFile(file, folder);
            onUploadComplete(res.url);
        } catch (error) {
            console.error("Upload failed", error);
            alert("Upload failed");
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    return (
        <div className="flex items-center gap-2">
            <input
                type="hidden" // Or text if you want to allow manual entry
                value={currentValue || ''}
            />
            <div className="flex-1 text-sm text-gray-600 truncate bg-gray-50 px-3 py-2 rounded border">
                {currentValue || <span className="text-gray-400">{placeholder}</span>}
            </div>
            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept={accept}
                onChange={handleFileChange}
            />
            <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={uploading}
                onClick={() => fileInputRef.current?.click()}
            >
                {uploading ? 'Uploading...' : 'Upload'}
            </Button>
        </div>
    );
};
