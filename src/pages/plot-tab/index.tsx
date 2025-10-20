import GPSPlot from "./components/gps-plot";
import ModelViewer from "./components/model-viewer";
import MotionPanel from "./components/comms-panel";
import AltitudeChart from "./components/altitude-chart";
import EnvironmentalPanel from "./components/sensor-panel";

const PlotTab = () => {
  return (
    <section className="flex flex-col w-full h-full bg-white p-1 gap-1 overflow-hidden">
      {/* Charts and Visualizations - Full Height */}
      <div className="grid grid-cols-[3fr_2fr] gap-1 flex-1 min-h-0 overflow-hidden">
        {/* Left Column - Charts */}
        <div className="flex flex-col gap-1 h-full min-h-0 overflow-hidden">
          {/* Altitude chart gets more room now */}
          <div className="flex-[0.65] min-h-0 overflow-hidden">
            <AltitudeChart />
          </div>
          <div className="grid grid-cols-2 gap-1 flex-[0.35] min-h-0">
            <MotionPanel />
            <EnvironmentalPanel />
          </div>
        </div>

        {/* Right Column - 3D and Map */}
        <div className="flex flex-col gap-1 h-full min-h-0 overflow-hidden">
          <div className="flex-1 min-h-0">
            <ModelViewer />
          </div>
          <div className="flex-1 min-h-0">
            <GPSPlot />
          </div>
        </div>
      </div>
    </section>
  );
};

export default PlotTab;
