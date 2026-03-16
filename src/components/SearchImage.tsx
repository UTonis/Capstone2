import React, { useState } from 'react';
import { Image, ImageStyle, StyleProp } from 'react-native';
import { BASE_URL } from '../services/api';

const PLACEHOLDER = require('../assets/icons/image_placeholder.png');

interface SearchImageProps {
    imageUrl: string | null | undefined;
    style: StyleProp<ImageStyle>;
    resizeMode?: 'cover' | 'contain' | 'stretch' | 'center';
}

const SearchImage = ({ imageUrl, style, resizeMode = 'cover' }: SearchImageProps) => {
    const [hasError, setHasError] = useState(false);

    if (!imageUrl || hasError) {
        return (
            <Image
                source={PLACEHOLDER}
                style={style}
                resizeMode={resizeMode}
            />
        );
    }

    let uri = imageUrl;
    if (!imageUrl.startsWith('http')) {
        if (imageUrl.startsWith('//')) {
            uri = `https:${imageUrl}`;
        } else {
            // uploads/ 로 시작하는 상대 경로 처리
            uri = `${BASE_URL}/${imageUrl.replace(/\\/g, '/')}`;
        }
    }

    return (
        <Image
            source={{ uri }}
            style={style}
            resizeMode={resizeMode}
            onError={() => setHasError(true)}
            defaultSource={PLACEHOLDER}
        />
    );
};

export default SearchImage;
