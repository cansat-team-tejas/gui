# Confirmation Dialog Component

A reusable confirmation dialog component that matches the application's design system.

## Features

- Consistent styling with app design system
- Customizable title, message, and button text
- Support for dangerous actions (red button for destructive operations)
- Backdrop click to close
- Proper accessibility and focus management
- Configurable button variants

## Usage

```tsx
import { useState } from "react";
import ConfirmationDialog from "../components/confirmation-dialog";

const MyComponent = () => {
  const [showDialog, setShowDialog] = useState(false);

  const handleDelete = () => {
    // Perform delete operation
    console.log("Item deleted");
    setShowDialog(false);
  };

  return (
    <>
      <button onClick={() => setShowDialog(true)}>Delete Item</button>

      <ConfirmationDialog
        isOpen={showDialog}
        title="DELETE CONFIRMATION"
        message="Are you sure you want to delete this item? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        isDangerous={true}
        onConfirm={handleDelete}
        onCancel={() => setShowDialog(false)}
      />
    </>
  );
};
```

## Props

| Prop             | Type                                  | Default   | Description                                      |
| ---------------- | ------------------------------------- | --------- | ------------------------------------------------ |
| `isOpen`         | `boolean`                             | -         | Controls dialog visibility                       |
| `title`          | `string`                              | -         | Dialog title (shown in header)                   |
| `message`        | `string`                              | -         | Optional message text                            |
| `children`       | `ReactNode`                           | -         | Custom content instead of message                |
| `confirmText`    | `string`                              | "Confirm" | Confirm button text                              |
| `cancelText`     | `string`                              | "Cancel"  | Cancel button text                               |
| `confirmVariant` | `"default" \| "success" \| "warning"` | "default" | Button variant (ignored if isDangerous=true)     |
| `onConfirm`      | `() => void`                          | -         | Confirm button callback                          |
| `onCancel`       | `() => void`                          | -         | Cancel button callback                           |
| `isDangerous`    | `boolean`                             | `false`   | Makes confirm button red for destructive actions |

## Design System Integration

- Uses `#D9D9D9` for header background (consistent with other panels)
- Black borders and consistent typography sizes
- Red button for dangerous actions
- Proper spacing and layout matching app components
- Integrates with existing `Button` component

## Examples

### Basic Confirmation

```tsx
<ConfirmationDialog
  isOpen={showDialog}
  title="CONFIRM ACTION"
  message="Are you sure you want to proceed?"
  onConfirm={handleConfirm}
  onCancel={handleCancel}
/>
```

### Dangerous Action

```tsx
<ConfirmationDialog
  isOpen={showDialog}
  title="DELETE USER"
  message="This will permanently delete the user account and all associated data."
  confirmText="Delete User"
  isDangerous={true}
  onConfirm={handleDelete}
  onCancel={handleCancel}
/>
```

### Custom Content

```tsx
<ConfirmationDialog
  isOpen={showDialog}
  title="SAVE CHANGES"
  onConfirm={handleSave}
  onCancel={handleCancel}
>
  <div>
    <p className="text-[12px] mb-2">The following changes will be saved:</p>
    <ul className="text-[11px] list-disc list-inside">
      <li>Updated port configuration</li>
      <li>New telemetry settings</li>
      <li>Modified data filters</li>
    </ul>
  </div>
</ConfirmationDialog>
```
