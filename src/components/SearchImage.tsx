import React, { useState } from 'react';
import { Image, ImageStyle, StyleProp } from 'react-native';
import { resolveImageUrl } from '../services/api';

const PLACEHOLDER = require('../assets/icons/image_placeholder.png');

interface SearchImageProps {
    imageUrl: string | null | undefined;
    style: StyleProp<ImageStyle>;
    resizeMode?: 'cover' | 'contain' | 'stretch' | 'center';
}

const SearchImage = ({ imageUrl, style, resizeMode = 'cover' }: SearchImageProps) => {
    const [hasError, setHasError] = useState(false);

    const uri = resolveImageUrl(imageUrl);

    if (!uri || hasError) {
        return (
            <Image
                source={PLACEHOLDER}
                style={style}
                resizeMode={resizeMode}
            />
        );
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
