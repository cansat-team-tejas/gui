import { BrowserRouter } from "react-router-dom";
import { useEffect } from "react";
import Header from "./components/header";
import "./index.css";
import LeftPanel from "./components/left-panel";

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
    <BrowserRouter>
      <div className="h-screen w-screen overflow-hidden font-roboto-mono antialiased">
        <Header />
        <main className="h-full flex">
          <LeftPanel />
        </main>
      </div>
    </BrowserRouter>
  );
};

export default App;
