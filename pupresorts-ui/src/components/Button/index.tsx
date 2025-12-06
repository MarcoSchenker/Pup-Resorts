import React from "react";
import "./index.css";

export type ButtonVariant = "fulfilled" | "outlined" | "ghost";
type ButtonSize = "small" | "medium" | "large" | "largeWide" | "rounded";


interface IconProps {
    color?: string;
    size?: number;
}

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    type?: "button" | "submit" | "reset";
    size?: ButtonSize;
    leftIcon?: React.ComponentType<IconProps>;
    rightIcon?: React.ComponentType<IconProps>;
    className?: string
}

export const Button: React.FC<ButtonProps> = ({
                                                  variant = "fulfilled",
                                                  type: buttonType = 'submit',
                                                  leftIcon : LeftIcon,
                                                  rightIcon: RightIcon,
                                                  disabled = false,
                                                  className = "",
                                                  onClick,
                                                  children,
                                                  size = "large",
                                              }) => {
    const fontSize: Record<ButtonSize, string> = {
        large: "body-1-bold",
        medium: "body-2",
        small: "body-3",
        largeWide: "body-2",
        rounded: "body-2",
    };

    return (
        <button
            type={buttonType}
            className={variant + " " + size + " " + fontSize[size] + " " + className}
            disabled={disabled}
            onClick={onClick}
        >
            {LeftIcon && (
                <span className="leftIcon">
                    <LeftIcon
                        color={variant === "fulfilled" ? "white" : "currentColor"}
                        size={size === "medium" ? 20 : 16}
                    />
                </span>
            )}
            {children}
            {RightIcon && (
                <span className="rightIcon">
                    <RightIcon
                        color={variant === "fulfilled" ? "white" : "currentColor"}
                        size={size === "medium" ? 20 : 16}
                    />
                </span>
            )}
        </button>
    );
};

export default Button;
