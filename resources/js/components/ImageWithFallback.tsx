import React, { useState } from 'react';

interface ImageWithFallbackProps extends React.ImgHTMLAttributes<HTMLImageElement> {
    fallbackSrc?: string;
}

// Gambar placeholder default jika gambar produk gagal dimuat
const DEFAULT_FALLBACK = "https://placehold.co/400x300/F9FAFB/1F2937?text=Image+Not+Found";

export function ImageWithFallback({ src, fallbackSrc = DEFAULT_FALLBACK, ...props }: ImageWithFallbackProps) {
    const [imgSrc, setImgSrc] = useState(src);

    const handleError = () => {
        setImgSrc(fallbackSrc);
    };

    return (
        <img
            src={imgSrc}
            onError={handleError}
            {...props}
        />
    );
}
