import React from 'react';

import type { IconProps } from "../utils/types.ts";

export const IconRight: React.FC<IconProps> = ({ size = 20 }) => {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 42 42"
            xmlns="http://www.w3.org/2000/svg">

            <polygon
                fillRule="evenodd"
                points="13.933,1 34,21.068 14.431,40.637 9.498,35.704 24.136,21.068 9,5.933"
                fill="currentColor"
            />
        </svg>
    );
}
