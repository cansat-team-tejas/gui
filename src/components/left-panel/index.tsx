import CommunicationPanel from "../communication-panel";
import TelemetryPanel from "../telemetry-panel";

const LeftPanel = () => {
  return (
    <div className="h-full border border-r-black min-w-[400px] max-w-[400px] overflow-hidden">
      <CommunicationPanel />
      <TelemetryPanel />
    </div>
  );
};

export default LeftPanel;
