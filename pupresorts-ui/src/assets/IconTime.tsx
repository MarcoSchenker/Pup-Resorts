import React from 'react';
import type {IconProps} from "../utils/types.ts";

export const IconTime: React.FC<IconProps> = ({size = 20, color}) => {
    return (
        <svg width={size}
             height={size}
             viewBox="0 0 20 20"
             fill={color}
             xmlns="http://www.w3.org/2000/svg">

            <path
                fillRule="evenodd"
                d="M10 20C15.5229 20 20 15.5229 20 10C20 4.47715 15.5229 0 10 0C4.47715 0 0 4.47715 0 10C0 15.5229 4.47715 20 10 20ZM8.75 3.75V10.5178L12.8661 14.6339L14.6339 12.8661L11.25 9.48224V3.75H8.75Z"/>
        </svg>
    );
}
