import React from 'react';

import type {IconProps} from "../utils/types.ts";

export const IconInfo: React.FC<IconProps> = ({size, color})  => {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill={color}
            xmlns="http://www.w3.org/2000/svg">

            <path d="M12 0C5.37258 0 0 5.37258 0 12C0 18.6274 5.37258 24 12 24C18.6274 24 24 18.6274 24 12C24 5.37258 18.6274 0 12 0ZM12 4.03448C13.3342 4.03448 14.4158 5.11608 14.4158 6.45033C14.4158 7.78458 13.3343 8.86617 12 8.86617C10.6658 8.86617 9.58416 7.78458 9.58416 6.45033C9.58416 5.11608 10.6658 4.03448 12 4.03448ZM14.5543 19.9655H9.44578V17.9221H11.1177V12.9529H10.0959V10.9095H13.161V11.0953V12.9529V17.9221H14.5543V19.9655Z"/>

        </svg>

    );
}