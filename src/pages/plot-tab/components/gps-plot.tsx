import { useEffect, useMemo, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Polyline,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L, { LatLngExpression } from "leaflet";
import { useTelemetryHistory } from "../../../hooks/use-xbee";

import { Rocket, Target } from "lucide-react";

// Fix default Leaflet icons
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

const LAUNCH_SITE: [number, number] = [17.4065, 78.4772];

// Fix icons and create custom ones
const setupIcons = () => {
  L.Icon.Default.mergeOptions({ iconUrl: markerIcon, shadowUrl: markerShadow });
  return {
    launch: L.divIcon({
      html: '<div style="background:#10B981;width:20px;height:20px;border-radius:50%;border:2px solid white"></div>',
      iconSize: [20, 20],
      iconAnchor: [10, 10],
    }),
    current: L.divIcon({
      html: '<div style="background:#EF4444;width:16px;height:16px;border-radius:50%;border:2px solid white"></div>',
      iconSize: [16, 16],
      iconAnchor: [8, 8],
    }),
  };
};

const AutoFollow = ({ position }: { position: LatLngExpression }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(position, undefined, { animate: true });
  }, [map, position]);
  return null;
};

const GPSPlot = () => {
  const [mounted, setMounted] = useState(false);
  const history = useTelemetryHistory();

  useEffect(() => setMounted(true), []);

  const { gpsData, latest, stats } = useMemo(() => {
    if (!history?.length)
      return { gpsData: [], latest: null, stats: { count: 0, alt: 0 } };

    const sorted = [...history].reverse();
    const gpsData = sorted
      .map((p) => {
        const lat = p.LATITUDE;
        const lng = p.LONGITUDE;
        return {
          pos: [lat, lng] as [number, number],
          data: p,
        };
      })
      .filter((p) => p.pos[0] && p.pos[1] && Math.abs(p.pos[0]) > 0.0001);

    const latest = gpsData[gpsData.length - 1];
    const alt = latest?.data.GPS_ALTITUDE ?? latest?.data.ALTITUDE ?? 0;

    return { gpsData, latest, stats: { count: gpsData.length, alt } };
  }, [history]);

  const icons = useMemo(() => setupIcons(), []);
  const center: [number, number] = latest?.pos ?? LAUNCH_SITE;

  if (!mounted)
    return (
      <div className="flex items-center justify-center h-full text-gray-400">
        Loading...
      </div>
    );

  return (
    <div className="flex flex-col h-full border border-black bg-white">
      {/* Header */}
      <div className="px-2 py-1 bg-[#D9D9D9] border-b border-black flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-black">
              GPS TRACKER
            </span>
            <span className="text-[9px] text-gray-600">
              {stats.count} points
            </span>
          </div>
          <div className="flex items-center gap-2 text-[9px] font-semibold">
            <span className="text-green-600">
              {center[0].toFixed(4)}, {center[1].toFixed(4)}
            </span>
            <span className="text-blue-600">
              {latest?.data.SATELLITES ?? 0} sats
            </span>
            <span className="text-orange-600">{stats.alt.toFixed(0)}m</span>
          </div>
        </div>
      </div>

      {/* Map Container */}
      <MapContainer
        center={center}
        zoom={15}
        style={{ height: "100%", width: "100%" }}
        zoomControl={true}
        attributionControl={false}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {/* Launch Site */}
        <Marker position={LAUNCH_SITE} icon={icons.launch}>
          <Popup className="custom-popup" closeButton={false}>
            <div className="font-mono text-xs p-1">
              <div className="font-bold text-green-600 mb-1 flex items-center gap-1 border-b border-green-200 pb-1">
                <Rocket size={12} /> LAUNCH SITE
              </div>
              <div className="text-gray-700">Team Tejas</div>
              <div className="text-gray-600 text-[10px] mt-1">
                {LAUNCH_SITE[0].toFixed(4)}, {LAUNCH_SITE[1].toFixed(4)}
              </div>
            </div>
          </Popup>
        </Marker>

        {/* GPS Track */}
        {gpsData.length > 1 && (
          <Polyline
            positions={gpsData.map((p) => p.pos)}
            pathOptions={{ color: "#1E40AF", weight: 3 }}
          />
        )}

        {/* Current Position */}
        {latest && (
          <Marker position={latest.pos} icon={icons.current}>
            <Popup className="custom-popup" closeButton={false}>
              <div className="font-mono text-xs p-1">
                <div className="font-bold text-red-600 mb-1 flex items-center gap-1 border-b border-red-200 pb-1">
                  <Target size={12} /> CURRENT POSITION
                </div>
                <div className="grid grid-cols-2 gap-2 text-[10px]">
                  <div>
                    <span className="text-gray-500">LAT:</span>
                    <span className="ml-1 font-medium">
                      {latest.pos[0].toFixed(4)}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">LON:</span>
                    <span className="ml-1 font-medium">
                      {latest.pos[1].toFixed(4)}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">ALT:</span>
                    <span className="ml-1 font-medium">{stats.alt}m</span>
                  </div>
                  <div>
                    <span className="text-gray-500">SATS:</span>
                    <span className="ml-1 font-medium">
                      {latest.data.GPS_SATS ?? latest.data.SATELLITES ?? "N/A"}
                    </span>
                  </div>
                </div>
              </div>
            </Popup>
          </Marker>
        )}

        {latest && <AutoFollow position={latest.pos} />}
      </MapContainer>
    </div>
  );
};

export default GPSPlot;
