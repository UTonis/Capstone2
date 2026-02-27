/**
 * FestivalImage - 축제 이미지 컴포넌트
 * 이미지 URL이 없거나 로딩에 실패하면 로컬 '이미지 준비중' 이미지로 자동 전환
 */

import React, { useState } from 'react';
import { Image, ImageStyle, StyleProp } from 'react-native';

const PLACEHOLDER = require('../assets/icons/image_placeholder.png');

interface FestivalImageProps {
    uri: string | null | undefined;
    style: StyleProp<ImageStyle>;
    resizeMode?: 'cover' | 'contain' | 'stretch' | 'center';
}

function FestivalImage({ uri, style, resizeMode = 'cover' }: FestivalImageProps) {
    const [failed, setFailed] = useState(false);

    if (!uri || failed) {
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
            onError={() => setFailed(true)}
        />
    );
}

export default FestivalImage;
