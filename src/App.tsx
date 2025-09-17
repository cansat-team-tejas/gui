import { BrowserRouter, Route, Routes } from "react-router-dom";
import { useEffect } from "react";
import Header from "./components/header";
import "./index.css";
import LeftPanel from "./components/left-panel";
import { XBeeProvider } from "./contexts/xbee-provider";
import SimpleXBeeDashboard from "./components/simple-xbee-dashboard";
import ROUTE_PATHS from "./route-paths";
import PlotTab from "./pages/plot-tab";
import CSVTab from "./pages/csv-tab";
import LogTab from "./pages/log-tab";

const App = () => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey && event.key === "r") || event.key === "F5") {
        event.preventDefault();
        window.location.reload();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <XBeeProvider>
      <BrowserRouter>
        <div className="h-screen w-screen overflow-hidden font-roboto-mono antialiased">
          <Header />
          <main className="h-full flex">
            <LeftPanel />
            <Routes>
              <Route path={ROUTE_PATHS.PLOT_TAB} element={<PlotTab />} />
              <Route path={ROUTE_PATHS.CSV_TAB} element={<CSVTab />} />
              <Route path={ROUTE_PATHS.LOG_TAB} element={<LogTab />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </XBeeProvider>
  );
};

export default App;
