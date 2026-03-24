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
import AITab from "./pages/ai-tab";
import InfoPage from "./pages/info";
import { QueryProvider } from "./providers/query-provider";
import { useFrameListener } from "./hooks/use-frame-listener";
import { useSimulation } from "./hooks/use-simulation";

const App = () => {
  useFrameListener();
  useSimulation();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey && event.key === "r") || event.key === "F5") {
        event.preventDefault();
        window.location.reload();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    // Auto-fullscreen for browser environment on first interaction
    const handleFirstInteraction = () => {
      if (!window.electronAPI && !document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {
          // Ignore errors (e.g., if fullscreen is not permitted)
        });
      }
      // Remove listener after first interaction
      window.removeEventListener("click", handleFirstInteraction);
    };

    window.addEventListener("click", handleFirstInteraction);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("click", handleFirstInteraction);
    };
  }, []);

  return (
    <QueryProvider>
      <BrowserRouter>
        <div className="flex flex-col h-screen w-screen overflow-hidden font-roboto-mono antialiased">
          <Header />
          <main className="h-full flex overflow-hidden">
            <LeftPanel />
            <Routes>
              <Route path={ROUTE_PATHS.PLOT_TAB} element={<PlotTab />} />
              <Route path={ROUTE_PATHS.CSV_TAB} element={<CSVTab />} />
              <Route path={ROUTE_PATHS.LOG_TAB} element={<LogTab />} />
              <Route path={ROUTE_PATHS.AI_TAB} element={<AITab />} />
              <Route path={ROUTE_PATHS.SETTINGS} element={<SettingsPage />} />
              <Route path={ROUTE_PATHS.INFO} element={<InfoPage />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </QueryProvider>
  );
};

export default App;
