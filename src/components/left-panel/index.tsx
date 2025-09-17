import CommunicationPanel from "../communication-panel";
import TelemetryPanel from "../telemetry-panel";

const LeftPanel = () => {
  return (
    <div className="h-full border border-r-black w-[400px]">
      <CommunicationPanel />
      <TelemetryPanel />
    </div>
  );
};

export default LeftPanel;
