// src/components/Button.tsx
import React from "react";

type ButtonProps = {
  label: string;
};

const Button: React.FC<ButtonProps> = ({ label }) => {
  return (
    <button className="rounded bg-blue-500 px-4 py-2 text-white">
      {label}
    </button>
  );
};

export default Button;
