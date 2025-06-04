import React from 'react';

interface PrimaryButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;
    className?: string;
}

const PrimaryButton: React.FC<PrimaryButtonProps> = ({ 
    children, 
    className = '', 
    onClick,
    ...props 
}) => {
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        console.log('PrimaryButton clicked');
        if (onClick && !props.disabled) {
            onClick(e);
        } else if (props.disabled) {
            e.preventDefault();
            e.stopPropagation();
        }
    };

    return (
        <button
            className={`px-4 py-2 text-base font-medium rounded ${
                props.disabled 
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                    : 'bg-gray-200 text-neutral-900 hover:bg-gray-300 transition shadow-md hover:shadow-lg cursor-pointer'
            } ${className}`}
            onClick={handleClick}
            {...props}
        >
            {children}
        </button>
    );
};

export default PrimaryButton;