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
import AITab from "./pages/ai-tab";
import { QueryProvider } from "./providers/query-provider";
import { CLUSTER_IDS } from "./constants";
import { getClusterName } from "./utils/cluster-helpers";
import { useMCPIntegration } from "./hooks/use-mcp-integration";

const App = () => {
  const processFrame = useXBeeStore((state) => state.processFrame);
  const processATResponse = useXBeeStore((state) => state.processATResponse);

  // Initialize MCP integration for automatic telemetry insertion
  useMCPIntegration();

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
          if (frame?.type === "AT_RESPONSE") {
            // Handle AT response frames directly
            processATResponse(frame);
          } else if (frame?.data && typeof frame.data === "string") {
            // Handle text-based frames with cluster ID filtering for explicit frames
            // Cluster IDs (explicit frames only):
            // 0x0001 = TELEMETRY
            // 0x0002 = LOG
            // 0x0003 = CMD_RESPONSE

            if (frame.explicitMetadata?.clusterId) {
              const clusterId = frame.explicitMetadata.clusterId;
              const clusterName = getClusterName(clusterId);

              switch (clusterId) {
                case CLUSTER_IDS.TELEMETRY: // 0x0001
                  processFrame(frame.data);
                  break;
                case CLUSTER_IDS.LOG: // 0x0002
                  processFrame(frame.data);
                  break;
                case CLUSTER_IDS.CMD_RESPONSE: // 0x0003
                  processFrame(frame.data);
                  break;
                default:
                  // Unknown cluster ID - log but still process
                  console.warn(`Unknown cluster ID: ${clusterName}`);
                  processFrame(frame.data);
              }
            } else {
              // Standard frame (0x90) or explicit frame without cluster filtering
              processFrame(frame.data);
            }
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
  }, [processFrame, processATResponse]);

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
