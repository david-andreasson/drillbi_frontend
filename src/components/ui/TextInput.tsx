import React from 'react';

interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    className?: string;
}

const TextInput: React.FC<TextInputProps> = ({ className = '', ...props }) => {
    return (
        <input
            className={`w-full px-3 py-2 border rounded bg-gray-200 text-neutral-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-300 shadow-md hover:shadow-lg dark:bg-neutral-800 dark:text-neutral-100 dark:border-neutral-700 dark:placeholder-gray-400 ${className}`}
            {...props}
        />
    );
};

export default TextInput;