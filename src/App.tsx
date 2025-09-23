import { BrowserRouter, Route, Routes } from "react-router-dom";
import { useEffect } from "react";
import Header from "./components/header";
import "./index.css";
import LeftPanel from "./components/left-panel";
import ROUTE_PATHS from "./route-paths";
import PlotTab from "./pages/plot-tab";
import CSVTab from "./pages/csv-tab";
import LogTab from "./pages/log-tab";
import SettingsPage from "./pages/settings";
import { useXBeeStore } from "./store/xbee";

const App = () => {
  const processFrame = useXBeeStore((state) => state.processFrame);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey && event.key === "r") || event.key === "F5") {
        event.preventDefault();
        window.location.reload();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    // Set up XBee frame listener for incoming data
    let unsubscribeXBeeFrames: (() => void) | undefined;

    if (window.electronAPI?.xbee?.onFrameReceived) {
      unsubscribeXBeeFrames = window.electronAPI.xbee.onFrameReceived(
        (frame: any) => {
          // Extract frame data - Buffer is converted to string in main process
          if (frame?.data && typeof frame.data === "string") {
            processFrame(frame.data);
          }
        }
      );
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      if (unsubscribeXBeeFrames) {
        unsubscribeXBeeFrames();
      }
    };
  }, [processFrame]);

  return (
    <BrowserRouter>
      <div className="flex flex-col h-screen w-screen overflow-hidden font-roboto-mono antialiased">
        <Header />
        <main className="h-full flex overflow-hidden">
          <LeftPanel />
          <Routes>
            <Route path={ROUTE_PATHS.PLOT_TAB} element={<PlotTab />} />
            <Route path={ROUTE_PATHS.CSV_TAB} element={<CSVTab />} />
            <Route path={ROUTE_PATHS.LOG_TAB} element={<LogTab />} />
            <Route path={ROUTE_PATHS.SETTINGS} element={<SettingsPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
};

export default App;
