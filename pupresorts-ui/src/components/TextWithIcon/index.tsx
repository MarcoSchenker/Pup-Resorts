import React from "react";
import type {IconProps} from "../../utils/types.ts";
import "./index.css";

export interface TextWithIconProps{
    text: string;
    icon: React.ComponentType<IconProps>;
    size?: number;
    color?: string;
    onClick?: () => void;
}

export const TextWithIcon: React.FC<TextWithIconProps> = ({
                                                                 text,
                                                                 icon: Icon,
                                                                 size = 14,
                                                                 color = "currentColor",
                                                                 onClick
                                                             }) => {
    return (
        <div className="text-with-icon-container"
             onClick={onClick}
             role={onClick ? "button" : undefined}>
            <Icon size={size} color={color}/>
            <p className="text-with-icon-text body-1-medium" style={{color: color}}>{text}</p>
        </div>
    );
};

export default TextWithIcon;
