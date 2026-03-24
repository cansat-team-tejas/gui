import {
  Rocket,
  Satellite,
  Github,
  Download,
  Code2,
  Radio,
  Cpu,
  Trophy,
  MapPin,
  ExternalLink,
  Terminal,
  Wifi,
  Database,
  Layers,
  Linkedin,
  Globe,
  CheckCircle,
  Loader2,
  Zap,
  Activity,
} from "lucide-react";
import { useState } from "react";

// ── Config ──────────────────────────────────────────────────────────────────

const GITHUB_REPO = "https://github.com/cansat-team-tejas";
const RELEASE_URL =
  "https://github.com/cansat-team-tejas/cansat-gui/releases/latest/download/CanSat-Setup.exe";

// Author personal links
const PORTFOLIO_URL = "https://sagargujarathi.dev";
const LINKEDIN_URL = "https://linkedin.com/in/sagargujarathi";
const GITHUB_PERSONAL_URL = "https://github.com/sagargujarathi";

const openExternal = (url: string) => {
  if ((window as any).electronAPI?.shell?.openExternal) {
    (window as any).electronAPI.shell.openExternal(url);
  } else {
    window.open(url, "_blank", "noopener,noreferrer");
  }
};

// ── Data ─────────────────────────────────────────────────────────────────────

const TEAM_MEMBERS = [
  {
    name: "Sagar Gujarathi",
    role: "Software Lead",
    initials: "SG",
    description:
      "Ground station GUI, real-time telemetry pipeline, Electron desktop application, AI integration",
    icon: <Code2 size={20} />,
    color: "#00AD57",
    image: "/images/sagar-gujarathi.webp",
    linkedin: "https://linkedin.com/in/sagargujarathi",
    github: "https://github.com/sagargujarathi",
  },
  {
    name: "Raguveer Reddy Rajidi",
    role: "Active Gyro Lead",
    initials: "RR",
    description:
      "Reaction wheel attitude control, IMU sensor fusion, active spin stabilization system",
    icon: <Cpu size={20} />,
    color: "#FFAB00",
    linkedin: "https://www.linkedin.com/in/raguveer-reddy-rajidi-9a2339287/",
    github: null,
  },
  {
    name: "Balapraneeth Sagar Yerneni",
    role: "Communications Lead",
    initials: "BY",
    description:
      "XBee RF link design, data framing protocol, ground-to-cansat telemetry transmission",
    icon: <Radio size={20} />,
    color: "#3B82F6",
    linkedin:
      "https://www.linkedin.com/in/bala-praneeth-sagar-yarneni-3a208a247/",
    github: null,
  },
];

const TECH_STACK = [
  { label: "Electron", icon: <Terminal size={12} /> },
  { label: "React 18", icon: <Layers size={12} /> },
  { label: "TypeScript", icon: <Code2 size={12} /> },
  { label: "Vite", icon: <Zap size={12} /> },
  { label: "Zustand", icon: <Database size={12} /> },
  { label: "Tailwind CSS", icon: <Layers size={12} /> },
  { label: "Recharts", icon: <Activity size={12} /> },
  { label: "React Leaflet", icon: <MapPin size={12} /> },
  { label: "Three.js", icon: <Satellite size={12} /> },
  { label: "XBee API", icon: <Wifi size={12} /> },
  { label: "React Hook Form", icon: <Terminal size={12} /> },
  { label: "Zod", icon: <Layers size={12} /> },
];

const TeamCard = ({
  name,
  role,
  initials,
  description,
  icon,
  color,
  image,
  linkedin,
  github,
}: (typeof TEAM_MEMBERS)[number] & { image?: string }) => (
  <div className="border border-black bg-white flex flex-col">
    <div
      className="flex items-center gap-3 px-4 py-3 text-white"
      style={{ backgroundColor: color }}
    >
      <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-[11px] font-black overflow-hidden border-2 border-white/20 shrink-0">
        {image ? (
          <img src={image} alt={name} className="w-full h-full object-cover" />
        ) : (
          initials
        )}
      </div>
      <div>
        <div className="text-[12px] font-black leading-tight">{name}</div>
        <div className="text-[10px] font-bold opacity-80 uppercase tracking-wide">
          {role}
        </div>
      </div>
      <div className="ml-auto opacity-70">{icon}</div>
    </div>
    <p className="px-4 py-3 text-[11px] text-gray-600 leading-relaxed flex-1">
      {description}
    </p>
    {(linkedin || github) && (
      <div className="px-4 py-2 border-t border-gray-100 flex gap-2">
        {linkedin && (
          <button
            onClick={() => openExternal(linkedin)}
            className="flex items-center gap-1 text-[9px] font-bold text-[#0A66C2] hover:underline"
          >
            <Linkedin size={10} /> LinkedIn
          </button>
        )}
        {github && (
          <button
            onClick={() => openExternal(github)}
            className="flex items-center gap-1 text-[9px] font-bold text-gray-700 hover:underline"
          >
            <Github size={10} /> GitHub
          </button>
        )}
      </div>
    )}
  </div>
);

const TechPill = ({
  label,
  icon,
}: {
  label: string;
  icon: React.ReactNode;
}) => (
  <div className="flex items-center gap-1.5 border border-black bg-white px-3 py-1.5 text-[10px] font-bold tracking-wide">
    <span className="text-gray-500">{icon}</span>
    {label}
  </div>
);

// ── Page ─────────────────────────────────────────────────────────────────────

const InfoPage = () => {
  const [downloadState, setDownloadState] = useState<
    "idle" | "loading" | "saved"
  >("idle");

  const handleDownloadInstaller = async () => {
    if (downloadState === "loading") return;

    // If Electron installer IPC is available, try a local save-copy first
    const api = (window as any).electronAPI?.installer;
    if (api?.saveCopy) {
      setDownloadState("loading");
      try {
        const result = await api.saveCopy();
        if (result.success) {
          setDownloadState("saved");
          setTimeout(() => setDownloadState("idle"), 3000);
          return;
        }
        if (result.reason === "canceled") {
          setDownloadState("idle");
          return;
        }
        // not-found: installer hasn't been built yet
        alert(
          "Installer not found.\nRun `npm run build:electron` first to generate CanSat-Setup.exe.",
        );
      } catch {
        alert(
          "Failed to open save dialog. Please run `npm run build:electron` to generate the installer.",
        );
      }
      setDownloadState("idle");
      return;
    }

    // Fallback for web/non-Electron context
    alert("Run this app inside Electron to download the installer.");
  };

  return (
    <div className="h-full overflow-y-auto bg-gray-50 font-roboto-mono">
      {/* ── Hero Banner ─────────────────────────────────────────────────── */}
      <div className="bg-black text-white px-8 py-8 border-b-2 border-[#00AD57]">
        <div className="flex items-center gap-2 mb-4">
          <Trophy size={12} className="text-[#FFAB00]" />
          <span className="text-[9px] tracking-[0.25em] text-gray-400 uppercase font-bold">
            IN-Space · ISRO CanSat / Rocketry Championship
          </span>
        </div>

        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Rocket size={26} className="text-[#00AD57]" />
              <h1 className="text-[30px] font-black tracking-tighter leading-none">
                TEAM TEJAS
              </h1>
              <Satellite size={22} className="text-[#FFAB00]" />
            </div>
            <p className="text-[11px] text-gray-400 leading-relaxed max-w-[480px]">
              Real-time ground station for a student-built CanSat payload
              competing in the national IN-Space / ISRO challenge. Handles live
              telemetry, command uplink, GPS tracking, and AI-assisted mission
              analysis.
            </p>
          </div>

          <div className="flex flex-col items-end gap-2 shrink-0">
            <div className="text-[9px] text-gray-500 uppercase tracking-widest">
              Version
            </div>
            <div className="text-[24px] font-black text-[#00AD57] leading-none">
              v1.0.0
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* ── Team Members ────────────────────────────────────────────────── */}
        <div>
          <div className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-2">
            Team Members
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {TEAM_MEMBERS.map((m) => (
              <TeamCard key={m.name} {...m} />
            ))}
          </div>
        </div>

        {/* ── Competition Info ───────────────────────────────────────────── */}
        <div className="border border-black bg-white">
          <div className="px-4 py-2 border-b border-black bg-[#D9D9D9] flex items-center gap-2">
            <MapPin size={12} />
            <span className="text-[11px] font-black tracking-wider">
              ABOUT THE COMPETITION
            </span>
          </div>
          <div className="px-4 py-3 space-y-2 text-[11px] text-gray-700 leading-relaxed">
            <p>
              <strong>IN-Space ISRO CanSat/Rocketry Championship</strong> is a
              national-level competition organized by the Indian National Space
              Promotion and Authorization Center (IN-SPACe) under ISRO, India.
            </p>
            <p>
              Teams design, build, and fly a miniature satellite (CanSat) aboard
              a student-built rocket. The payload must survive launch, collect
              scientific data during descent, and transmit telemetry in
              real-time to a ground station.
            </p>
            <p>
              Team Tejas developed an active gyro-stabilized CanSat with a
              reaction-wheel attitude control system — transmitting 35-field
              telemetry at 10 Hz over an XBee RF link.
            </p>
          </div>
        </div>

        {/* ── Technology Stack ───────────────────────────────────────────── */}
        <div>
          <div className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-2">
            Technology Stack
          </div>
          <div className="flex flex-wrap gap-1.5">
            {TECH_STACK.map(({ label, icon }) => (
              <TechPill key={label} label={label} icon={icon} />
            ))}
          </div>
        </div>

        {/* ── Developer ─────────────────────────────────────────────────── */}
        <div className="border border-black bg-white">
          <div className="px-4 py-2 border-b border-black bg-[#D9D9D9] flex items-center gap-2">
            <Code2 size={12} />
            <span className="text-[11px] font-black tracking-wider">
              BUILT BY
            </span>
          </div>
          <div className="px-4 py-3 flex items-center justify-between flex-wrap gap-3">
            <div>
              <div className="text-[13px] font-black">Sagar Gujarathi</div>
              <div className="text-[10px] text-gray-500">
                Software Lead · Team Tejas
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => openExternal(PORTFOLIO_URL)}
                className="flex items-center gap-1.5 px-3 py-2 border border-black bg-black text-white text-[10px] font-bold hover:bg-gray-900 transition-colors"
              >
                <Globe size={13} />
                sagargujarathi.dev
                <ExternalLink size={9} className="opacity-60" />
              </button>
              <button
                onClick={() => openExternal(LINKEDIN_URL)}
                className="flex items-center gap-1.5 px-3 py-2 border border-black bg-[#0A66C2] text-white text-[10px] font-bold hover:opacity-90 transition-opacity"
              >
                <Linkedin size={13} />
                /sagargujarathi
                <ExternalLink size={9} className="opacity-60" />
              </button>
              <button
                onClick={() => openExternal(GITHUB_PERSONAL_URL)}
                className="flex items-center gap-1.5 px-3 py-2 border border-black bg-[#D9D9D9] text-black text-[10px] font-bold hover:bg-gray-300 transition-colors"
              >
                <Github size={13} />
                /sagargujarathi
                <ExternalLink size={9} className="opacity-60" />
              </button>
            </div>
          </div>
        </div>

        {/* ── Downloads & Links ──────────────────────────────────────────── */}
        <div>
          <div className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-2">
            Project Links
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => openExternal(GITHUB_REPO)}
              className="flex items-center gap-2 px-4 py-2.5 border border-black bg-black text-white text-[11px] font-bold hover:bg-gray-900 transition-colors"
            >
              <Github size={15} />
              GitHub Repository
              <ExternalLink size={10} className="opacity-60" />
            </button>
            <button
              onClick={handleDownloadInstaller}
              disabled={downloadState === "loading"}
              className="flex items-center gap-2 px-4 py-2.5 border border-black bg-[#00AD57] text-white text-[11px] font-bold hover:opacity-90 transition-opacity disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {downloadState === "loading" ? (
                <Loader2 size={15} className="animate-spin" />
              ) : downloadState === "saved" ? (
                <CheckCircle size={15} />
              ) : (
                <Download size={15} />
              )}
              {downloadState === "saved" ? "Saved!" : "Download .exe (Windows)"}
              {downloadState === "idle" && (
                <ExternalLink size={10} className="opacity-60" />
              )}
            </button>
          </div>
          <p className="text-[9px] text-gray-400 mt-2">
            Requires Windows 10/11 x64. Built with Electron + electron-builder.
          </p>
        </div>

        {/* ── Footer ────────────────────────────────────────────────────── */}
        <div className="border-t border-gray-200 pt-4 text-[9px] text-gray-400 flex justify-between items-center">
          <span>Team Tejas · Ground Station GUI v1.0.0</span>
          <span>IN-Space ISRO Championship · 2025–26</span>
        </div>
      </div>
    </div>
  );
};

export default InfoPage;
