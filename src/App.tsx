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
import { useXBeeGoStore } from "./store/xbee-go";
import AITab from "./pages/ai-tab";
import { QueryProvider } from "./providers/query-provider";
import { useMCPIntegration } from "./hooks/use-mcp-integration";

const App = () => {
  const updateConnectionStatus = useXBeeGoStore(
    (state) => state.updateConnectionStatus
  );
  const connectWebSocket = useXBeeGoStore((state) => state.connectWebSocket);
  const disconnectWebSocket = useXBeeGoStore(
    (state) => state.disconnectWebSocket
  );

  useMCPIntegration();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey && event.key === "r") || event.key === "F5") {
        event.preventDefault();
        window.location.reload();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    // Add error handling to prevent crashes when backend is down
    const safeUpdateConnectionStatus = async () => {
      try {
        await updateConnectionStatus();
      } catch (error) {
        console.warn("Backend connection unavailable:", error);
      }
    };

    safeUpdateConnectionStatus();

    const statusInterval = setInterval(() => {
      safeUpdateConnectionStatus();
    }, 30000);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      clearInterval(statusInterval);
    };
  }, [updateConnectionStatus]);

  useEffect(() => {
    try {
      connectWebSocket();
    } catch (error) {
      console.warn("Failed to initialize telemetry stream:", error);
    }

    return () => {
      try {
        disconnectWebSocket();
      } catch (error) {
        console.warn("Failed to tear down telemetry stream:", error);
      }
    };
  }, [connectWebSocket, disconnectWebSocket]);

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
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </QueryProvider>
  );
};

export default App;
