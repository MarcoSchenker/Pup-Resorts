import React from 'react';
import type {IconProps} from "../utils/types.ts";

export const IconLocation: React.FC<IconProps> = ({size = 20, color}) => {
    return (
        <svg width={size} height={size}
             viewBox="0 0 20 20"
             fill={color}
             xmlns="http://www.w3.org/2000/svg">

            <path
                d="M18 3L17 2L2 8V10L9 11L10 18H12L18 3Z" />
        </svg>
    );
}

