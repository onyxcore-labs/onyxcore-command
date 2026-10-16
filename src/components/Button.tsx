import React from 'react';
export function Button({ className = '', variant = 'primary', ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'danger' | 'ghost' }) {
 return <button className={`btn btn-${variant} ${className}`} {...props} />;
}