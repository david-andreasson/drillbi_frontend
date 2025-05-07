import React from 'react';

interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    className?: string;
}

const TextInput: React.FC<TextInputProps> = ({ className = '', ...props }) => {
    return (
        <input
            className={`w-full px-3 py-2 border rounded bg-gray-200 text-neutral-900 focus:outline-none focus:ring-2 focus:ring-gray-300 shadow-md hover:shadow-lg ${className}`}

            {...props}
        />
    );
};

export default TextInput;