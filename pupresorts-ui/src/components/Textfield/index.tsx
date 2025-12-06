import './index.css';

import React from 'react';

interface IconProps {
    color?: string;
    size?: number;
}

export interface TextFieldProps
    extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    helperText?: string | boolean;
    variant?: 'default' | 'error';
    type?: 'text' | 'email' | 'password' | 'date';
    withIcon?: React.ComponentType<IconProps>;
    onClickIcon?: () => void;
    placeholder?: string;
    value?: string;
    name?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    max?: string;
    min?: string;
}

export const TextField: React.FC<TextFieldProps> = ({
                                                 label,
                                                 helperText,
                                                 variant = 'default',
                                                 type = 'text',
                                                 withIcon: Icon,
                                                 onClickIcon,
                                                 placeholder = '',
                                                 value,
                                                 name,
                                                 onChange,
                                                 max,
                                                 min,
                                             }) => {

    return (
        <div className="textfield-container">
            {label &&
                <label className="body-2 textfield-label">{label}</label>
            }
            <div className={`textfield-input-wrapper ${variant}`}>
                <input
                    type={type}
                    value={value}
                    name={name}
                    placeholder={placeholder}
                    onChange={onChange}
                    className="textfield-input body-1"
                    max={max}
                    min={min}
                />

                {Icon && (
                    <button
                        type='button'
                        className="textfield-icon"
                        onClick={onClickIcon}
                    >
                        <Icon
                            size={20}
                            color="var(--grey-700)" />
                    </button>
                )}
            </div>

            {helperText &&
                <p className={`body-3 textfield-helper ${variant}`}
                   >
                    {helperText}
                </p>
            }
        </div>
    );
};

export default TextField;