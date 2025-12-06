import React from 'react';

import type { IconProps } from "../utils/types.ts";

export const IconLeft: React.FC<IconProps> = ({ size = 20 }) => {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 42 42"
            xmlns="http://www.w3.org/2000/svg">

            <polygon
                fillRule="evenodd"
                points="27.066,1 7,21.068 26.568,40.637 31.502,35.704 16.865,21.068 32,5.933"
                fill="currentColor"
            />
        </svg>
    );
}

