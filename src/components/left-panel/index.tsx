import CommunicationPanel from "../communication-panel";
import TelemetryPanel from "../telemetry-panel";

const LeftPanel = () => {
  return (
    <div className="h-full border border-r-black min-w-[420px] max-w-[420px] overflow-hidden">
      <CommunicationPanel />
      <TelemetryPanel />
    </div>
  );
};

export default LeftPanel;
