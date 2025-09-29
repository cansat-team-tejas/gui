import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import ROUTE_PATHS from "../../route-paths";
import PlotTabIcon from "../../assets/icons/plot-tab-icon";
import CSVTabIcon from "../../assets/icons/csv-tab-icon";
import AITabIcon from "../../assets/icons/ai-tab-icon";
import LogTabIcon from "../../assets/icons/log-tab-icon";
import InfoIcon from "../../assets/icons/info-icon";
import SettingsIcon from "../../assets/icons/settings-icon";
import LogOutIcon from "../../assets/icons/log-out-icon";
import ConfirmationDialog from "../confirmation-dialog";

const TABS = [
  { name: "PLOT TAB", path: ROUTE_PATHS.PLOT_TAB, icon: <PlotTabIcon /> },
  { name: "CSV TAB", path: ROUTE_PATHS.CSV_TAB, icon: <CSVTabIcon /> },
  { name: "LOG TAB", path: ROUTE_PATHS.LOG_TAB, icon: <LogTabIcon /> },
  { name: "AI TAB", path: ROUTE_PATHS.AI_TAB, icon: <AITabIcon /> },
];

const RouteTab = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    window.close();
  };

  const cancelLogout = () => {
    setShowLogoutConfirm(false);
  };

  const LINKS = [
    { name: "INFO", path: ROUTE_PATHS.INFO, icon: <InfoIcon /> },
    { name: "SETTINGS", path: ROUTE_PATHS.SETTINGS, icon: <SettingsIcon /> },
    {
      name: "LOG OUT",
      onClick: handleLogout,
      icon: <LogOutIcon />,
    },
  ];

  return (
    <>
      <nav className="border border-black h-full flex p-[2px] gap-[2px] bg-white">
        {TABS.map((tab) => (
          <button
            key={tab.name}
            onClick={() => navigate(tab.path)}
            className={`flex items-center gap-2 px-3 text-[12px] w-max font-bold ${
              pathname === tab.path
                ? "bg-[#00AD57] text-white"
                : "bg-white text-black"
            }`}
          >
            {tab.icon}
            {tab.name}
          </button>
        ))}
      </nav>

      {LINKS.map((link) => (
        <button
          key={link.name}
          onClick={() => (link.path ? navigate(link.path) : link.onClick?.())}
          className={`flex items-center justify-center h-full aspect-square border border-black ${
            link.path && pathname === link.path
              ? "text-white bg-black"
              : "bg-white text-black"
          }`}
        >
          {link.icon}
        </button>
      ))}

      {/* Logout Confirmation Modal */}
      <ConfirmationDialog
        isOpen={showLogoutConfirm}
        title="CONFIRM LOGOUT"
        message="Are you sure you want to close the application? Any unsaved data will be lost."
        confirmText="Yes, Close App"
        cancelText="Cancel"
        isDangerous={true}
        onConfirm={confirmLogout}
        onCancel={cancelLogout}
      />
    </>
  );
};

export default RouteTab;
