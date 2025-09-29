import { ReactNode } from "react";

interface ISmallFontType {
  children: ReactNode;
  className?: string;
}

interface ILabelValueType {
  label: string;
  children: ReactNode;
  labelClassName?: string;
  valueClassName?: string;
  containerClassName?: string;
}

export const SmallFont = ({
  children,
  className = "text-[10px] font-medium",
}: ISmallFontType) => <span className={className}>{children}</span>;

const LabelValue = ({
  label,
  children,
  labelClassName = "font-bold text-[12px] min-w-[120px] max-w-[120px]",
  valueClassName = "font-bold text-[14px]",
  containerClassName = "flex gap-4 px-2 py-[2px] min-h-[20px] items-center hover:bg-gray-50 transition-colors",
}: ILabelValueType) => (
  <div className={containerClassName}>
    <span className={labelClassName}>{label}:</span>
    <span className={`${valueClassName}`}>{children}</span>
  </div>
);

export default LabelValue;
