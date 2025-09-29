import { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  variant?: "default" | "success" | "warning";
}

const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  className = "",
  disabled = false,
  variant = "default",
  type = "button",
  ...rest
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case "success":
        return "bg-[#00AD57] text-white";
      case "warning":
        return "bg-[#FFAB00] text-white";
      default:
        return "bg-white text-black";
    }
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`border border-black px-3 py-1 text-[12px] font-bold h-[25px] flex items-center justify-center ${getVariantClasses()} ${
        disabled
          ? "opacity-50 cursor-not-allowed"
          : "hover:opacity-80 cursor-pointer active:transform active:scale-95 transition-all duration-100"
      } ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
};

export default Button;
