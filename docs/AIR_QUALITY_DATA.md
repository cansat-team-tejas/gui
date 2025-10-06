# 📊 Air Quality Data Implementation

## Overview

The GUI processes air quality data from the MICS-5524 VOC/gas sensor integrated on the CanSat. This document explains the data flow, calculations, and accuracy expectations.

## CanSat Telemetry Data (What We Receive)

The CanSat sends **2 air quality fields** in the 37-field telemetry packet:

### Field 30: `AIR_QUALITY_RAW` (int)

- **Description**: Raw 12-bit ADC value from MICS-5524 sensor
- **Range**: 0-4095
- **Pin**: Analog pin A6
- **Purpose**: Diagnostics and sanity checking
- **Location**: Index 29 in CSV (Field 30)

### Field 31: `AQ_ETHANOL_PPM` (float)

- **Description**: Pre-calculated ethanol/VOC concentration
- **Range**: 0-500 PPM (typical)
- **Processing**: Smoothed and calculated on CanSat
- **Purpose**: Primary measurement for all gas calculations
- **Location**: Index 30 in CSV (Field 31)

## Complete Telemetry Packet Format (37 Fields, Indices 0-36)

```
TEAM_ID, TIME_S, PACKET_COUNT, ALTITUDE, PRESSURE, TEMP, VOLTAGE,
GNSS_TIME, LATITUDE, LONGITUDE, GPS_ALTITUDE, SATS,
ACCEL_X, ACCEL_Y, ACCEL_Z, GYRO_SPIN_RATE, STATE,
GYRO_X, GYRO_Y, GYRO_Z, ROLL, PITCH, YAW,
MAG_X, MAG_Y, MAG_Z, HUMIDITY,
CURRENT, POWER, BARO_ALT,
AQ_RAW, AQ_ETHANOL_PPM, TEMP_MCU, RSSI, HEALTH, RTC_EPOCH, CMD_ECHO
```

**Air Quality Position:**

- Field 30 (index 29): `air_quality_raw`
- Field 31 (index 30): `aq_ethanol_ppm`

## GUI Gas Calculations (MICS-5524 Sensor)

### About MICS-5524

The MICS-5524 is a **single VOC/gas sensor** that responds to multiple gases. The GUI estimates other gas concentrations using calibration factors from the MICS-5524 datasheet.

### Gas Concentration Formulas

```typescript
// Input from telemetry
const ethanol_ppm = telemetry_fields[30]; // Field 31 (AQ_ETHANOL_PPM)

// Calculate other gases using sensitivity ratios
const co_ppm = ethanol_ppm * 0.15; // CO (Carbon Monoxide)
const ch4_ppm = ethanol_ppm * 0.05; // CH4 (Methane)
const nh3_ppm = ethanol_ppm * 0.08; // NH3 (Ammonia)
const h2_ppm = ethanol_ppm * 0.25; // H2 (Hydrogen)
const lpg_ppm = ethanol_ppm * 0.12; // LPG (Liquefied Petroleum Gas)
const propane_ppm = ethanol_ppm * 0.1; // Propane
```

### Calibration Factors (from MICS-5524 Datasheet)

| Gas     | Factor | Accuracy | Sensitivity    | Notes                      |
| ------- | ------ | -------- | -------------- | -------------------------- |
| Ethanol | 1.00   | ±10%     | Most sensitive | Primary measurement        |
| H2      | 0.25   | ±20%     | Moderate       | Good response              |
| CO      | 0.15   | ±30%     | Lower          | Moderate cross-sensitivity |
| LPG     | 0.12   | ±30%     | Lower          | Approximate                |
| Propane | 0.10   | ±30%     | Lower          | Approximate                |
| NH3     | 0.08   | ±30%     | Lower          | Limited response           |
| CH4     | 0.05   | ±40%     | Lowest         | Weakest sensitivity        |

## Implementation Details

### Frame Parser (`src/utils/frame-parser.ts`)

```typescript
// Parse air quality fields from telemetry
AIR_QUALITY_RAW: parseFloat(fields[30]),  // Raw ADC (0-4095)
AQ_ETHANOL_PPM: parseFloat(fields[31]),   // Ethanol baseline

// Calculate derived gas concentrations
const gases = computeGasConcentrations(TELEMETRY_DATA.AQ_ETHANOL_PPM);
TELEMETRY_DATA.AQ_CO_PPM = gases.AQ_CO_PPM;
TELEMETRY_DATA.AQ_CH4_PPM = gases.AQ_CH4_PPM;
TELEMETRY_DATA.AQ_NH3_PPM = gases.AQ_NH3_PPM;
TELEMETRY_DATA.AQ_H2_PPM = gases.AQ_H2_PPM;
TELEMETRY_DATA.AQ_LPG_PPM = gases.AQ_LPG_PPM;
TELEMETRY_DATA.AQ_PROPANE_PPM = gases.AQ_PROPANE_PPM;
```

### Data Processing (`src/utils/data-processing.ts`)

#### `computeVocPpm()`

Extracts VOC PPM from telemetry data:

1. **Priority 1**: Use `AQ_ETHANOL_PPM` from firmware (pre-calculated)
2. **Fallback**: Map `AIR_QUALITY_RAW` (0-4095) to 0-100 ppm as heuristic

#### `computeGasConcentrations()`

Calculates individual gas concentrations from ethanol baseline using MICS-5524 sensitivity ratios.

```typescript
export const computeGasConcentrations = (ethanolPpm: number) => {
  return {
    AQ_CO_PPM: parseFloat((ethanolPpm * 0.15).toFixed(2)),
    AQ_CH4_PPM: parseFloat((ethanolPpm * 0.05).toFixed(2)),
    AQ_NH3_PPM: parseFloat((ethanolPpm * 0.08).toFixed(2)),
    AQ_H2_PPM: parseFloat((ethanolPpm * 0.25).toFixed(2)),
    AQ_LPG_PPM: parseFloat((ethanolPpm * 0.12).toFixed(2)),
    AQ_PROPANE_PPM: parseFloat((ethanolPpm * 0.1).toFixed(2)),
  };
};
```

#### `computeMICS5524Gases()`

Advanced calculation using Rs/R0 ratio and log-log curves (if calibration coefficients are configured). Falls back to multiplier approach if coefficients are not available.

### Type Definitions (`src/types/telemetry.ts`)

```typescript
interface ITelemetryType {
  // Raw fields from CanSat
  AIR_QUALITY_RAW?: number; // Field 30: Raw ADC (0-4095)
  AIR_QUALITY_ETHANOL_PPM?: number; // Field 31: Ethanol PPM (primary)

  // Derived gas concentrations (computed on GUI)
  VOC_PPM?: number; // Same as ethanol PPM
  CO_PPM?: number; // Carbon Monoxide (derived)
  CH4_PPM?: number; // Methane (derived)
  NH3_PPM?: number; // Ammonia (derived)
  H2_PPM?: number; // Hydrogen (derived)
  LPG_PPM?: number; // LPG (derived)
  PROPANE_PPM?: number; // Propane (derived)

  // Legacy aliases
  AQ_CO_PPM?: number;
  AQ_CH4_PPM?: number;
  AQ_NH3_PPM?: number;
  AQ_H2_PPM?: number;
  AQ_LPG_PPM?: number;
  AQ_PROPANE_PPM?: number;
}
```

## Important Notes

### 1. **Ethanol is Primary Measurement**

- All other gases are **derived estimates**, not direct measurements
- Ethanol PPM is the most accurate reading (±10%)
- Other gases have progressively lower accuracy

### 2. **Cross-Sensitivity**

- MICS-5524 responds to **multiple gases simultaneously**
- Values represent **combined exposure**, not isolated gas measurements
- Real-world readings will reflect mixture of gases present

### 3. **Calibration**

- Sensitivity ratios are from MICS-5524 datasheet
- For **absolute accuracy**, calibrate with known gas concentrations
- Factory calibration provides baseline, field calibration improves accuracy

### 4. **Temperature Compensation**

- Temperature compensation is applied **on CanSat side** (±2% per °C around 25°C)
- GUI receives already-compensated values
- MCU temperature available in `MCU_TEMP_C` field

### 5. **Data Flow**

```
CanSat MICS-5524 Sensor
    ↓
Raw ADC Reading (12-bit: 0-4095)
    ↓
CanSat Firmware Processing
    ↓
Telemetry: AIR_QUALITY_RAW + AQ_ETHANOL_PPM
    ↓
XBee Transmission
    ↓
GUI Frame Parser
    ↓
Gas Calculations (using ratios)
    ↓
Display & CSV Export
```

## Usage Examples

### Accessing Air Quality Data

```typescript
// Get latest telemetry
const telemetry = useTelemetryLatest();

// Raw sensor data
console.log(telemetry.AIR_QUALITY_RAW); // 0-4095
console.log(telemetry.AQ_ETHANOL_PPM); // PPM value

// Derived gas concentrations
console.log(telemetry.AQ_CO_PPM); // CO concentration
console.log(telemetry.AQ_H2_PPM); // H2 concentration
console.log(telemetry.AQ_CH4_PPM); // CH4 concentration
```

### Display Recommendations

```typescript
// Show ethanol as primary air quality metric
<div>Air Quality: {telemetry.AQ_ETHANOL_PPM.toFixed(1)} PPM</div>

// Show derived gases with accuracy disclaimer
<div className="text-sm text-gray-500">
  Estimated concentrations:
  CO: {telemetry.AQ_CO_PPM} PPM (±30%)
  H2: {telemetry.AQ_H2_PPM} PPM (±20%)
</div>
```

## Troubleshooting

### Issue: All gas values are 0

- **Check**: Is `AQ_ETHANOL_PPM` non-zero?
- **Cause**: Sensor may be warming up or not calibrated
- **Solution**: Wait for sensor warm-up period (~30 seconds)

### Issue: Erratic readings

- **Check**: `AIR_QUALITY_RAW` value (should be 0-4095)
- **Cause**: Sensor may be overloaded or faulty
- **Solution**: Check sensor wiring and calibration

### Issue: Readings seem too high/low

- **Check**: Temperature compensation
- **Cause**: Extreme temperature affecting sensor
- **Solution**: Review `MCU_TEMP_C` field, consider recalibration

## References

1. **MICS-5524 Datasheet**: SGX Sensortech MICS-5524 specifications
2. **CanSat Firmware**: `TELEMETRY.cpp` - Air quality data transmission
3. **GUI Implementation**:
   - `src/utils/frame-parser.ts` - Data parsing
   - `src/utils/data-processing.ts` - Gas calculations
   - `src/types/telemetry.ts` - Type definitions

## Changelog

- **2025-10-02**: Updated air quality implementation to match firmware specification
  - Corrected ADC range to 12-bit (0-4095)
  - Added LPG and Propane gas calculations
  - Updated documentation with MICS-5524 sensor details
  - Clarified accuracy expectations and cross-sensitivity notes
