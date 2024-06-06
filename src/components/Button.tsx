// src/components/Button.tsx
import React from 'react'

type ButtonProps = {
    label: string
}

const Button: React.FC<ButtonProps> = ({ label }) => {
    return (
        <button className="px-4 py-2 bg-blue-500 text-white rounded">
            {label}
        </button>
    )
}

export default Button
