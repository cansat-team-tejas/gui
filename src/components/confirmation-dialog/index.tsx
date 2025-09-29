import { ReactNode } from "react";
import Button from "../button";

interface ConfirmationDialogProps {
  isOpen: boolean;
  title: string;
  message?: string;
  children?: ReactNode;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: "default" | "success" | "warning";
  onConfirm: () => void;
  onCancel: () => void;
  isDangerous?: boolean;
}

const ConfirmationDialog = ({
  isOpen,
  title,
  message,
  children,
  confirmText = "Confirm",
  cancelText = "Cancel",
  confirmVariant = "default",
  onConfirm,
  onCancel,
  isDangerous = false,
}: ConfirmationDialogProps) => {
  if (!isOpen) return null;

  // Handle backdrop click to close
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onCancel();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={handleBackdropClick}
    >
      <div className="bg-white border-2 border-black min-w-[300px] max-w-[500px] mx-4">
        {/* Header */}
        <div className="bg-[#D9D9D9] border-b border-black px-4 py-2">
          <h3 className="text-[13px] font-bold text-black">{title}</h3>
        </div>

        {/* Content */}
        <div className="p-4">
          {message && (
            <p className="text-[12px] text-black mb-4 leading-relaxed">
              {message}
            </p>
          )}
          {children && <div className="mb-4">{children}</div>}

          {/* Action Buttons */}
          <div className="flex gap-2 justify-end">
            <Button onClick={onCancel} className="min-w-[80px]">
              {cancelText}
            </Button>
            <Button
              onClick={onConfirm}
              variant={isDangerous ? "warning" : confirmVariant}
              className={`min-w-[80px] ${
                isDangerous ? "bg-red-500 text-white hover:bg-red-600" : ""
              }`}
            >
              {confirmText}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationDialog;
