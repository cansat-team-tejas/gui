import React from "react";
import { useXBeeStore, xbeeSelectors } from "../../store/xbee";
import Button from "../button";

export const AutoConnectButton: React.FC = () => {
  const isConnected = useXBeeStore(xbeeSelectors.isConnected);
  const autoDetecting = useXBeeStore(xbeeSelectors.autoDetecting);
  const selectedPort = useXBeeStore(xbeeSelectors.selectedPort);

  const handleAutoConnect = async () => {
    const store = useXBeeStore.getState();
    if (isConnected) {
      await store.disconnect();
    } else {
      await store.autoDetectAndConnect();
    }
  };

  const getButtonText = () => {
    if (autoDetecting) return "DETECTING...";
    if (isConnected) return `DISCONNECT (${selectedPort})`;
    return "AUTO-DETECT XBEE";
  };

  const getButtonVariant = () => {
    if (isConnected) return "warning";
    return "success";
  };

  return (
    <Button
      onClick={handleAutoConnect}
      variant={getButtonVariant()}
      disabled={autoDetecting}
      className="w-full"
    >
      {getButtonText()}
    </Button>
  );
};
