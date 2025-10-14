/**
 * Connection Status Component
 * Displays current connection status and selected port information
 */
import LabelValue from "../../../components/label-value";
import Panel from "../../../components/panel";
import { useIsConnected, useSelectedPort } from "../../../hooks/use-xbee-go";

const ConnectionStatusComponent = () => {
  const isConnected = useIsConnected();
  const selectedPort = useSelectedPort();

  return (
    <Panel title="CONNECTION STATUS" variant="default">
      <div className="border border-black bg-white p-2">
        <div className="text-[10px] font-bold mb-2">CONNECTION STATUS</div>
        <div className="grid grid-cols-2 gap-2">
          <LabelValue
            label="STATUS"
            labelClassName="text-[10px] font-bold min-w-[140px] max-w-[140px]"
          >
            <div
              className={`px-2 py-1 text-[10px] font-bold text-white ${
                isConnected ? "bg-[#00AD57]" : "bg-red-500"
              }`}
            >
              {isConnected ? "CONNECTED" : "DISCONNECTED"}
            </div>
          </LabelValue>
          <LabelValue
            label="SELECTED PORT"
            labelClassName="text-[10px] font-bold min-w-[140px] max-w-[140px]"
          >
            <div className="text-[10px] font-bold">
              {selectedPort || "NONE"}
            </div>
          </LabelValue>
        </div>
      </div>
    </Panel>
  );
};

export default ConnectionStatusComponent;
