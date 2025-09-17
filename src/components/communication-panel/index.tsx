import LabelValue, { SmallFont } from "../label-value";

const CommunicationPanel = () => {
  const LABEL_VALUE = [
    {
      label: "MISSION TIMER",
      value: (
        <>
          10<SmallFont>seconds</SmallFont>
        </>
      ),
    },
    {
      label: "PACKET RATE",
      value: (
        <>
          1.6<SmallFont>Hz</SmallFont>
        </>
      ),
    },
    {
      label: "PACKET RECEIVED",
      value: <>10</>,
    },
    {
      label: "PACKET SENT",
      value: <>65</>,
    },
    {
      label: "RSSI DOWN / UP",
      value: (
        <div className="flex gap-1">
          <div className="bg-[#00AD57] text-white px-2 w-max">
            65<SmallFont>dBm</SmallFont>
          </div>
          <div className="bg-[#00AD57] text-white px-2 w-max">
            65<SmallFont>dBm</SmallFont>
          </div>
        </div>
      ),
    },
    {
      label: "COMMAND ECHO",
      value: <>NO_CMD</>,
    },
  ];

  return (
    <section about="Communication Information">
      <div className="border border-b-black text-[13px] font-bold px-2 py-1 bg-[#D9D9D9]">
        COMMUNICATION INFORMATION
      </div>
      <div className="flex flex-col w-full">
        {LABEL_VALUE.map(({ label, value }) => (
          <LabelValue key={label} label={label}>
            {value}
          </LabelValue>
        ))}
      </div>
    </section>
  );
};

export default CommunicationPanel;
