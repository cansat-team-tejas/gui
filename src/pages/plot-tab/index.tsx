import Panel from "../../components/panel";
import GPSPlot from "./components/gps-plot";

const PlotTab = () => {
  return (
    <section className="flex flex-col w-full h-full bg-white p-1 gap-1 overflow-hidden">
      <div className="grid grid-cols-[2fr_1fr] gap-1 flex-1 min-h-0">
        <div className="flex flex-col gap-1 h-full">
          <Panel>FLIGHT DETAILS</Panel>

          <Panel>POWER</Panel>

          <Panel>ALTITUDE</Panel>
        </div>

        <div className="flex flex-col gap-1 h-full">
          <Panel>3D MODEL</Panel>

          <Panel>COMMS CHARTS</Panel>

          <Panel>
            <GPSPlot />
          </Panel>
        </div>
      </div>
    </section>
  );
};

export default PlotTab;
