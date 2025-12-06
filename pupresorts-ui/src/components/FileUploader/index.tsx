import "./index.css";

import {type ChangeEvent, useEffect, useRef, useState} from "react";

import {IconCross} from "../../assets/IconCross.tsx";
import {IconImage} from "../../assets/IconImage.tsx";
import Button from "../../components/Button";

interface FileUploaderProps {
    onImageSelect: (file: File | null) => void;
    currentImage?: string;
    selectedImage?: File | string | null;
}

const FileUploader = ({ onImageSelect, currentImage, selectedImage }: FileUploaderProps) => {
    const [previewUrl, setPreviewUrl] = useState<string | undefined>(currentImage);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (selectedImage instanceof File) {
            const localUrl = URL.createObjectURL(selectedImage);
            setPreviewUrl(localUrl);
            return () => URL.revokeObjectURL(localUrl);
        } else if (typeof selectedImage === 'string') {
            setPreviewUrl(selectedImage);
        } else if (selectedImage === null) {
            setPreviewUrl(undefined);
        }
    }, [selectedImage]);

    const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files ? e.target.files[0] : null;
        if (file) {
            const localUrl = URL.createObjectURL(file);
            setPreviewUrl(localUrl);
            onImageSelect(file);
        }
    };
    const handleRemoveImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl); // Liberar el recurso
            setPreviewUrl(undefined);
        }
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
        onImageSelect(null);
    };
    return (
        <div
            className="image-uploader"
            onClick={() => fileInputRef.current?.click()}
        >
            {previewUrl ? (
                <>
                    <img src={previewUrl} alt="Dog Cover" className="uploaded-image"  />
                    <div className="edit-icon" onClick={handleRemoveImage}
                    >
                        <IconCross/>
                    </div>
                </>
            ) : (
                <div className="placeholder">
                    <IconImage/>
                    <Button
                        className="UploadImage-button"
                        variant="fulfilled"
                        size="medium"
                        type="button"
                    >
                        Agrega una foto de tu perro!
                    </Button>
                </div>
            )}

            <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleImageChange}
                style={{ display: "none" }}
            />
        </div>
    );
};

export default FileUploader;