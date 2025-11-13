import React from "react";

export interface InputProps
    extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ label, error, leftIcon, rightIcon, className = "", ...props }, ref) => {
        return (
            <div className="w-full flex flex-col gap-2">
                {label && (
                    <label className="font-medium text-base text-gray-700">
                        {label}
                    </label>
                )}

                <div className="relative w-full">
                    {leftIcon && (
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                            {leftIcon}
                        </span>
                    )}
                    {rightIcon && (
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 cursor-pointer">
                            {rightIcon}
                        </span>
                    )}

                    <input
                        ref={ref}
                        className={`
              w-full border rounded-lg px-3 py-2 outline-none
              focus:ring-2 focus:ring-blue-300 focus:border-blue-300
              ${leftIcon ? "pl-10" : ""}
              ${rightIcon ? "pr-10" : ""}
              ${error ? "border-red-500" : "border-gray-300"}
              ${className}
            `}
                        {...props}
                    />
                </div>

                {error && <p className="text-sm text-red-500">{error}</p>}
            </div>
        );
    }
);

Input.displayName = "Input";
export default Input;
