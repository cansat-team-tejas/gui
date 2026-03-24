import type { ITelemetryType } from "../types/telemetry";


const TEAM_ID = "1046";
const MISSION_PERIOD = 80; // seconds — simulation loop length

// Launch site: Sriharikota SDSC, India (13.7199°N, 80.2304°E)
const BASE_LAT = 13.7199;
const BASE_LON = 80.2304;

// State transition → log symbol mapping (matches firmware LOG_CONSTANTS)
const STATE_SYMBOLS: Record<number, string> = {
  2: "{", // LAUNCH_PAD
  3: "]", // ASCENT
  4: "(", // ROCKET_DEPLOY
  5: ")", // DESCENT
  6: "=", // SECONDARY_DEPLOY
  7: "+", // FINAL_DESCENT
  8: "*", // IMPACT
};


/**
 * Standard atmosphere pressure at altitude h (metres).
 * ISA formula: P = P₀ × (1 − Lh/T₀)^(gM/RL)
 */
const pressureAtAlt = (h: number): number =>
  101325 * Math.pow(1 - 2.25577e-5 * h, 5.25588);

/** ISA temperature lapse: 6.5 °C/km, sea-level baseline 25 °C */
const tempAtAlt = (h: number): number => 25 - 6.5 * (h / 1000);

/** Box-Muller Gaussian noise with given standard deviation */
const gaussNoise = (std: number): number => {
  const u = Math.max(1e-10, 1 - Math.random());
  const v = Math.random();
  return std * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
};


interface PhaseInfo {
  state: number;
  altitude: number; // metres AGL
  phase: string;
}

function getFlightPhase(t: number): PhaseInfo {
  const lt = t % MISSION_PERIOD; // loop time

  if (lt < 3) return { state: 0, altitude: 0, phase: "boot" };
  if (lt < 5) return { state: 2, altitude: 0, phase: "launch_pad" };

  if (lt < 17) {
    // Ascent: ease-out curve (fast at launch, slows near apogee)
    const frac = (lt - 5) / 12;
    return {
      state: 3,
      altitude: 850 * (1 - Math.pow(1 - frac, 2)),
      phase: "ascent",
    };
  }

  if (lt < 19) return { state: 4, altitude: 850, phase: "rocket_deploy" };

  if (lt < 30) {
    const frac = (lt - 19) / 11;
    return { state: 5, altitude: 850 - 550 * frac, phase: "descent" };
  }

  if (lt < 32) return { state: 6, altitude: 300, phase: "secondary_deploy" };

  if (lt < 70) {
    const frac = (lt - 32) / 38;
    return { state: 7, altitude: 300 * (1 - frac), phase: "final_descent" };
  }

  return { state: 8, altitude: 0, phase: "impact" };
}


// Module-level previous-state tracker (reset on sim restart)
let _prevState = -1;

export function resetSimPrevState(): void {
  _prevState = -1;
}

function buildLogData(t: number, currentState: number): string {
  // Reset prev state at the start of each loop
  if (t % MISSION_PERIOD < 0.15 && t > 0.1) _prevState = -1;

  if (currentState !== _prevState) {
    const sym = STATE_SYMBOLS[currentState];
    _prevState = currentState;
    if (sym) return `[${Math.round(t * 100)} ${sym}]`;
  }
  return "";
}


/**
 * Pure function: generates one realistic telemetry frame at time `t` seconds.
 * `packetNum` is the 1-based sequence number since simulation start.
 */
export function generateSimFrame(
  t: number,
  packetNum: number
): ITelemetryType {
  const { state, altitude, phase } = getFlightPhase(t);
  const h = Math.max(0, altitude);

  const isBoosting = phase === "ascent" && t % MISSION_PERIOD < 8;
  const isDeploy =
    phase === "rocket_deploy" || phase === "secondary_deploy";
  const isDescent =
    phase === "descent" || phase === "final_descent";

  // Accelerometers (m/s²)
  const accelX = gaussNoise(isBoosting ? 1.2 : isDeploy ? 2.5 : 0.15);
  const accelY = gaussNoise(isBoosting ? 1.0 : isDeploy ? 2.5 : 0.15);
  const accelZ = isBoosting
    ? 38.0 + gaussNoise(2.5) // rocket motor thrust ≈ 4g
    : isDeploy
    ? 4.5 + gaussNoise(4.0) // pyro shock
    : 9.81 + gaussNoise(0.2); // normal gravity

  // Gyroscopes (deg/s)
  const gyroStd = isDeploy ? 25 : isBoosting ? 8 : isDescent ? 3 : 0.5;
  const gyroX = gaussNoise(gyroStd);
  const gyroY = gaussNoise(gyroStd);
  const gyroZ = gaussNoise(gyroStd * 0.6);
  const spinRate = Math.abs(gaussNoise(gyroStd)) + Math.abs(gyroZ);

  // Attitude (degrees)
  const roll = gaussNoise(isDeploy ? 35 : isBoosting ? 8 : 2.5);
  const pitch = gaussNoise(isDeploy ? 30 : isBoosting ? 6 : 2.0);
  const yaw = (t * 3.0) % 360;

  // GPS
  const dLat = h * 1.2e-6 * Math.sin(t * 0.08);
  const dLon = h * 1.5e-6 * Math.cos(t * 0.06);
  const sats = state > 1 ? Math.round(9 + gaussNoise(1.5)) : 0;

  // Power
  const voltage = (isBoosting ? 7.15 : 7.38) + gaussNoise(0.04);
  const current = (isBoosting ? 2.1 : 0.85) + gaussNoise(0.08);

  // Environment
  const pressure = pressureAtAlt(h) + gaussNoise(25);
  const temperature = tempAtAlt(h) + gaussNoise(0.4);
  const humidity = Math.max(10, 55 - h * 0.035) + gaussNoise(1.5);
  const mcuTemp = 38 + (isBoosting ? 3 : 0) + gaussNoise(0.8);

  // Magnetometer (µT, Earth field near Sriharikota)
  const magX = 28.4 + gaussNoise(1.5);
  const magY = -14.8 + gaussNoise(1.5);
  const magZ = 41.2 + gaussNoise(1.5);

  // RSSI — degrades with altitude
  const rssi = Math.round(-55 - h * 0.025 + gaussNoise(4));

  // GNSS time string
  const now = new Date();
  const gnssTime = [
    now.getUTCHours(),
    now.getUTCMinutes(),
    now.getUTCSeconds(),
  ]
    .map((n) => String(n).padStart(2, "0"))
    .join(":");

  return {
    TEAM_ID,
    MISSION_TIME_S: parseFloat(t.toFixed(1)),
    PACKET_COUNT: packetNum,
    ALTITUDE: parseFloat(h.toFixed(1)),
    PRESSURE: parseFloat(pressure.toFixed(0)),
    TEMPERATURE: parseFloat(temperature.toFixed(1)),
    VOLTAGE: parseFloat(voltage.toFixed(2)),
    GNSS_TIME: gnssTime,
    LATITUDE: parseFloat((BASE_LAT + dLat).toFixed(6)),
    LONGITUDE: parseFloat((BASE_LON + dLon).toFixed(6)),
    GPS_ALTITUDE: parseFloat((h + gaussNoise(2.5)).toFixed(1)),
    SATELLITES: Math.max(0, sats),
    ACCEL_X: parseFloat(accelX.toFixed(2)),
    ACCEL_Y: parseFloat(accelY.toFixed(2)),
    ACCEL_Z: parseFloat(accelZ.toFixed(2)),
    GYRO_SPIN_RATE: parseFloat(spinRate.toFixed(2)),
    FLIGHT_STATE: state,
    GYRO_X: parseFloat(gyroX.toFixed(2)),
    GYRO_Y: parseFloat(gyroY.toFixed(2)),
    GYRO_Z: parseFloat(gyroZ.toFixed(2)),
    ROLL: parseFloat(roll.toFixed(1)),
    PITCH: parseFloat(pitch.toFixed(1)),
    YAW: parseFloat(yaw.toFixed(1)),
    MAG_X: parseFloat(magX.toFixed(1)),
    MAG_Y: parseFloat(magY.toFixed(1)),
    MAG_Z: parseFloat(magZ.toFixed(1)),
    HUMIDITY: parseFloat(humidity.toFixed(2)),
    CURRENT: parseFloat(current.toFixed(2)),
    POWER: parseFloat((voltage * current).toFixed(1)),
    BARO_ALTITUDE: parseFloat((h + gaussNoise(0.8)).toFixed(1)),
    MCU_TEMP_C: parseFloat(mcuTemp.toFixed(1)),
    RSSI_DBM: rssi,
    RTC_EPOCH: Math.floor(Date.now() / 1000),
    CMD_ECHO: "",
    LOG_DATA: buildLogData(t, state),
  };
}
