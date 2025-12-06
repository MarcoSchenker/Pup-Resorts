import React from 'react';

import type {IconProps} from "../utils/types.ts";

interface ExtendedIconProps extends IconProps {
    color?: string;
}

export const IconColumns: React.FC<ExtendedIconProps> = ({size = 14, color = "var(--primary-500)"})  => {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 512 512"
            fill="none"
            xmlns="http://www.w3.org/2000/svg">

            <g>
                <g>
                    <g>
                        <rect width="149.333" height="512" fill={color}/>
                        <rect x="192" width="128" height="512" fill={color}/>
                        <rect x="362.667" width="149.333" height="512" fill={color}/>
                    </g>
                </g>
            </g>
        </svg>
    );
}