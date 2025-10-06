/**
 * Enhanced Panel Component with Design System
 */

import { ReactNode, useState } from "react";

interface IPanelType {
  children: ReactNode;
  title?: string;
  variant?: "default" | "flush";
  className?: string;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
}

export const Panel = ({
  children,
  title,
  variant = "default",
  className = "",
  collapsible = false,
  defaultCollapsed = false,
}: IPanelType) => {
  const [collapsed, setCollapsed] = useState<boolean>(defaultCollapsed);

  return (
    <div className={`border border-black bg-white h-full ${className}`}>
      {title && (
        <div
          className="bg-[#D9D9D9] border-b border-black px-3 py-2 flex items-center justify-between cursor-pointer"
          onClick={() => {
            if (collapsible) setCollapsed((c) => !c);
          }}
        >
          <div className="text-[12px] font-bold text-black">{title}</div>
          {collapsible && (
            <div className="text-[12px] font-bold text-black">
              {collapsed ? "SHOW" : "HIDE"}
            </div>
          )}
        </div>
      )}

      {!collapsed && (
        <div className={variant === "flush" ? "p-0" : "p-3"}>{children}</div>
      )}
    </div>
  );
};

export default Panel;
