import React from 'react';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    className?: string;
}

const Textarea: React.FC<TextareaProps> = ({ className = '', ...props }) => {
    return (
        <textarea
            className={`w-full px-3 py-2 border rounded bg-gray-200 text-neutral-900 focus:outline-none focus:ring-2 focus:ring-gray-300 shadow-md hover:shadow-lg min-h-[300px] overflow-scroll scrollbar-hide ${className}`}

            {...props}
        />
    );
};

export default Textarea;