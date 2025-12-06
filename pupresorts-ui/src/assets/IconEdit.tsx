import React from 'react';
import type {IconProps} from "../utils/types.ts";

export const IconEdit: React.FC<IconProps> = ({size, color})  => {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 20 20"
            fill={color}
            xmlns="http://www.w3.org/2000/svg">

            <path d="M10.3661 4.63391L1.25 13.75V18.75H6.25L15.3661 9.63391L10.3661 4.63391Z"
                />
            <path d="M12.1339 2.86611L17.1339 7.86611L18.9645 6.03554C19.6275 5.37249 20 4.47321 20 3.53554C20 1.58291 18.4171 0 16.4645 0C15.5268 0 14.6275 0.372494 13.9645 1.03553L12.1339 2.86611Z"
                />
        </svg>
    );
}
