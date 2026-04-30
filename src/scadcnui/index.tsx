import React from 'react';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: any; size?: any };
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ children, className, ...props }, ref) => {
  return (
    <button ref={ref} className={`scadcnui-btn ${className ?? ''}`} {...props}>
      {children}
    </button>
  );
});
Button.displayName = 'ScadcnuiButton';

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & { variant?: any };
export const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, ...props }, ref) => {
  return (
    <input ref={ref} className={`scadcnui-input ${className ?? ''}`} {...props} />
  );
});
Input.displayName = 'ScadcnuiInput';

export default { Button, Input };
