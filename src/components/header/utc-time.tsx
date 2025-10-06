import { useEffect, useState } from "react";

const UTCTime = () => {
  const [currentTime, setCurrentTime] = useState<string>("00:00:00");

  const updateTime = () => {
    const now = new Date();
    const hours = String(now.getUTCHours()).padStart(2, "0");
    const minutes = String(now.getUTCMinutes()).padStart(2, "0");
    const seconds = String(now.getUTCSeconds()).padStart(2, "0");
    setCurrentTime(`${hours}:${minutes}:${seconds}`);
  };

  useEffect(() => {
    updateTime();

    const intervalId = setInterval(updateTime, 1000);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="flex items-center gap-3 h-full">
      <p className="text-[14px] font-bold">UTC: {currentTime}</p>
      <p className="text-[14px] font-bold">ID: 046</p>
    </div>
  );
};

export default UTCTime;
