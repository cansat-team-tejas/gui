/**
 * Enhanced Panel Component with Design System
 */
import React from "react";

interface PanelProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "compact";
  collapsible?: boolean;
  defaultCollapsed?: boolean;
}

export const Panel: React.FC<PanelProps> = ({
  title,
  children,
  className = "",
  variant = "default",
  collapsible = false,
  defaultCollapsed = false,
}) => {
  const [isCollapsed, setIsCollapsed] = React.useState(defaultCollapsed);

  const handleToggle = () => {
    if (collapsible) {
      setIsCollapsed(!isCollapsed);
    }
  };

  const panelClasses = [
    "border border-black bg-white",
    "transition-all duration-200 ease-in-out",
    className,
  ].join(" ");

  const headerClasses = [
    "bg-gray-200 border-b border-black",
    variant === "compact" ? "px-2 py-1" : "px-3 py-2",
    collapsible ? "cursor-pointer hover:bg-gray-300" : "",
    "flex items-center justify-between",
  ].join(" ");

  const titleClasses = [
    "font-bold text-black",
    variant === "compact" ? "text-[10px]" : "text-[12px]",
  ].join(" ");

  const contentClasses = [
    variant === "compact" ? "p-2" : "p-3",
    "transition-all duration-200 ease-in-out",
    isCollapsed ? "hidden" : "block",
  ].join(" ");

  return (
    <div className={panelClasses}>
      <div className={headerClasses} onClick={handleToggle}>
        <div className={titleClasses}>{title}</div>
        {collapsible && (
          <div className="text-[10px] text-gray-600">
            {isCollapsed ? "▶" : "▼"}
          </div>
        )}
      </div>
      {!isCollapsed && <div className={contentClasses}>{children}</div>}
    </div>
  );
};

export default Panel;
