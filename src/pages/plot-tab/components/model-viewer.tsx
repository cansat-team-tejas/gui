import {
  Suspense,
  useEffect,
  useRef,
  useState,
  Component,
  ErrorInfo,
  ReactNode,
} from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { useTelemetryHistory } from "../../../hooks/use-xbee";

// Define the props interface
interface ModelViewerProps {
  roll?: number;
  pitch?: number;
  yaw?: number;
}

// Error Boundary for Three.js canvas
class CanvasErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Canvas Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-full flex items-center justify-center bg-gray-50">
          <div className="text-center p-4">
            <p className="text-[12px] text-red-600 font-semibold mb-2">
              Failed to load 3D viewer
            </p>
            <p className="text-[10px] text-gray-600">
              {this.state.error?.message || "Unknown error"}
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Loading fallback component
const LoadingFallback = () => (
  <div className="w-full h-full flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-2"></div>
      <p className="text-[10px] text-gray-600">Loading 3D model...</p>
    </div>
  </div>
);

// Ground plane component
const GroundPlane = () => {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -5, 0]} receiveShadow>
      <planeGeometry args={[30, 30]} />
      <meshStandardMaterial
        color="#e5e7eb"
        opacity={0.3}
        transparent
        side={THREE.DoubleSide}
      />
    </mesh>
  );
};

// Axis indicators component
const AxisIndicators = () => {
  return (
    <group position={[0, -4, 0]}>
      {/* X-axis (Red) */}
      <arrowHelper
        args={[
          new THREE.Vector3(1, 0, 0),
          new THREE.Vector3(0, 0, 0),
          3,
          0xff0000,
          0.5,
          0.3,
        ]}
      />
      {/* Y-axis (Green) */}
      <arrowHelper
        args={[
          new THREE.Vector3(0, 1, 0),
          new THREE.Vector3(0, 0, 0),
          3,
          0x00ff00,
          0.5,
          0.3,
        ]}
      />
      {/* Z-axis (Blue) */}
      <arrowHelper
        args={[
          new THREE.Vector3(0, 0, 1),
          new THREE.Vector3(0, 0, 0),
          3,
          0x0000ff,
          0.5,
          0.3,
        ]}
      />
    </group>
  );
};

// Model component that handles the 3D object
const Model = ({ roll = 0, pitch = 0, yaw = 0 }: ModelViewerProps) => {
  const modelRef = useRef<THREE.Group>(null);

  // Try to load the model, but handle errors gracefully
  const { scene } = useGLTF("/models/CANSAT.glb");

  // Apply rotation based on roll, pitch, yaw
  useEffect(() => {
    if (modelRef.current) {
      try {
        // Convert degrees to radians
        const rollRad = THREE.MathUtils.degToRad(Number(roll) || 0);
        const pitchRad = THREE.MathUtils.degToRad(Number(pitch) || 0);
        const yawRad = THREE.MathUtils.degToRad(Number(yaw) || 0);

        // Create a quaternion for rotation
        const quaternion = new THREE.Quaternion().setFromEuler(
          new THREE.Euler(pitchRad, yawRad, rollRad, "XYZ")
        );
        modelRef.current.quaternion.copy(quaternion);
      } catch (error) {
        console.error("Error applying rotation:", error);
      }
    }
  }, [roll, pitch, yaw]);

  return (
    <group ref={modelRef} rotation={[0, 0, 0]}>
      <primitive
        object={scene}
        scale={0.07}
        position={[0, -15, 0]}
        rotation={[0, 0, 0]}
        castShadow
        receiveShadow
      />
    </group>
  );
};

// Main component with 3D canvas
const ModelViewer = () => {
  const [mounted, setMounted] = useState(false);
  const history = useTelemetryHistory();

  // Ensure component only renders on client side
  useEffect(() => {
    setMounted(true);
  }, []);

  // Get latest telemetry data for orientation
  const latest = history?.[history.length - 1];
  const roll = latest?.ROLL ?? 0;
  const pitch = latest?.PITCH ?? 0;
  const yaw = latest?.YAW ?? 0;

  if (!mounted) {
    return (
      <div className="flex flex-col h-full border border-black bg-white">
        <div className="px-3 py-2 bg-[#D9D9D9] border-b border-black">
          <div className="text-[10px] text-gray-700">Loading 3D viewer...</div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <LoadingFallback />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full border border-black bg-white">
      {/* Header */}
      <div className="px-2 py-1 bg-[#D9D9D9] border-b border-black flex-shrink-0">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-black">
            3D ORIENTATION MODEL
          </span>
          <div className="flex items-center gap-2 text-[9px] font-semibold">
            <span className="text-red-600">R: {roll.toFixed(1)}°</span>
            <span className="text-green-600">P: {pitch.toFixed(1)}°</span>
            <span className="text-blue-600">Y: {yaw.toFixed(1)}°</span>
          </div>
        </div>
      </div>

      {/* 3D Canvas */}
      <div className="flex-1 relative bg-sky-200">
        <CanvasErrorBoundary>
          <Suspense fallback={<LoadingFallback />}>
            <Canvas
              shadows
              gl={{
                preserveDrawingBuffer: true,
                antialias: true,
                alpha: false,
              }}
              dpr={[1, 2]}
              camera={{ position: [26, 18, 38], fov: 45 }}
            >
              {/* Sky Background */}
              <color attach="background" args={["#87CEEB"]} />
              <fog attach="fog" args={["#b8d4e8", 30, 120]} />

              {/* Enhanced Lighting Setup */}
              <ambientLight intensity={0.7} />
              <directionalLight
                position={[10, 10, 5]}
                intensity={1.2}
                castShadow
                shadow-mapSize-width={1024}
                shadow-mapSize-height={1024}
              />
              <directionalLight position={[-5, 5, -5]} intensity={0.4} />
              <spotLight
                position={[0, 15, 0]}
                angle={0.3}
                penumbra={1}
                intensity={0.5}
                castShadow
              />
              <hemisphereLight args={["#87CEEB", "#b0b0b0", 0.5]} />

              {/* Scene Elements */}
              <AxisIndicators />
              <Model roll={roll} pitch={pitch} yaw={yaw} />

              <OrbitControls
                enablePan={false}
                enableZoom={false}
                enableRotate={false}
                minDistance={30}
                maxDistance={200}
                target={[0, -2, 0]}
                dampingFactor={0.05}
                enableDamping={true}
              />
            </Canvas>
          </Suspense>
        </CanvasErrorBoundary>

        {/* Compass Overlay - Top Right (Minimalistic) */}
        <div className="absolute top-2 right-2 w-14 h-14">
          <div className="relative w-full h-full">
            {/* Compass Circle - transparent background */}
            <div className="absolute inset-0 rounded-full">
              {/* Outer ring - subtle */}
              <svg
                className="absolute inset-0 w-full h-full"
                viewBox="0 0 100 100"
              >
                <circle
                  cx="50"
                  cy="50"
                  r="48"
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth="1"
                  opacity="0.3"
                />
              </svg>

              {/* Cardinal marker - North only */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 text-[8px] font-bold text-red-500 drop-shadow-md">
                N
              </div>

              {/* Rotating Needle */}
              <div
                className="absolute inset-1 transition-transform duration-300"
                style={{ transform: `rotate(${yaw}deg)` }}
              >
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  {/* North pointer (red arrow) - bolder with shadow */}
                  <path
                    d="M 50 10 L 46 50 L 50 48 L 54 50 Z"
                    fill="#ef4444"
                    stroke="#ffffff"
                    strokeWidth="1.5"
                  />
                  {/* South pointer - minimal */}
                  <path
                    d="M 50 90 L 46 50 L 50 52 L 54 50 Z"
                    fill="#ffffff"
                    stroke="#9ca3af"
                    strokeWidth="1"
                    opacity="0.6"
                  />
                </svg>
              </div>

              {/* Center dot */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-1 rounded-full bg-white shadow-md"></div>

              {/* Heading value - floating below */}
              <div className="absolute top-full mt-1 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-sm text-white px-1.5 py-0.5 rounded text-[8px] font-bold whitespace-nowrap shadow-md">
                {yaw.toFixed(0)}°
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModelViewer;
