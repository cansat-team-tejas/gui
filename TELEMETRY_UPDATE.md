# Telemetry Packet Structure Update

## Overview

Updated the GUI to match the new C++ telemetry packet format from the firmware.

## New Telemetry Structure (29 fields)

Based on the C++ sprintf format:

```cpp
"%s,%.1f,%u,%.1f,%.0f,%.1f,%.2f,%s,%.6f,%.6f,%.1f,%d," // ID, time, count, baro alt, pressure, temp, volt, GNSS time, lat, lon, GPS alt, sats
"%.2f,%.2f,%.2f,%.2f,%d,"                              // accel x,y,z, spin rate, flight state
"%.2f,%.2f,%.2f,%.1f,%.1f,%.1f,%.1f,%.1f,%.1f,%.1f,"   // gyro x,y,z, roll, pitch, yaw, mag x,y,z
"%.2f,%.2f,%.1f,%.1f,%.1f,%d,%lu,%s,%s"                // humidity, current, power, baro_alt, mcu_temp, rssi, rtc_epoch, echo, log
```

## Field Mapping

| Index | Field Name     | Type   | Format | Description                     |
| ----- | -------------- | ------ | ------ | ------------------------------- |
| 0     | TEAM_ID        | string | %s     | Team identifier                 |
| 1     | MISSION_TIME_S | number | %.1f   | Mission time in seconds         |
| 2     | PACKET_COUNT   | number | %u     | Packet counter                  |
| 3     | ALTITUDE       | number | %.1f   | Barometric altitude             |
| 4     | PRESSURE       | number | %.0f   | Atmospheric pressure            |
| 5     | TEMPERATURE    | number | %.1f   | Environmental temperature       |
| 6     | VOLTAGE        | number | %.2f   | System voltage                  |
| 7     | GNSS_TIME      | string | %s     | GNSS timestamp                  |
| 8     | LATITUDE       | number | %.6f   | GPS latitude                    |
| 9     | LONGITUDE      | number | %.6f   | GPS longitude                   |
| 10    | GPS_ALTITUDE   | number | %.1f   | GPS altitude                    |
| 11    | SATELLITES     | number | %d     | GPS satellite count             |
| 12    | ACCEL_X        | number | %.2f   | Acceleration X-axis             |
| 13    | ACCEL_Y        | number | %.2f   | Acceleration Y-axis             |
| 14    | ACCEL_Z        | number | %.2f   | Acceleration Z-axis             |
| 15    | GYRO_SPIN_RATE | number | %.2f   | Gyroscope spin rate             |
| 16    | FLIGHT_STATE   | number | %d     | Flight controller state         |
| 17    | GYRO_X         | number | %.2f   | Gyroscope X-axis                |
| 18    | GYRO_Y         | number | %.2f   | Gyroscope Y-axis                |
| 19    | GYRO_Z         | number | %.2f   | Gyroscope Z-axis                |
| 20    | ROLL           | number | %.1f   | Roll angle                      |
| 21    | PITCH          | number | %.1f   | Pitch angle                     |
| 22    | YAW            | number | %.1f   | Yaw angle                       |
| 23    | MAG_X          | number | %.1f   | Magnetometer X-axis             |
| 24    | MAG_Y          | number | %.1f   | Magnetometer Y-axis             |
| 25    | MAG_Z          | number | %.1f   | Magnetometer Z-axis             |
| 26    | HUMIDITY       | number | %.2f   | Relative humidity               |
| 27    | CURRENT        | number | %.2f   | System current                  |
| 28    | POWER          | number | %.1f   | System power                    |
| 29    | BARO_ALTITUDE  | number | %.1f   | Barometric altitude (duplicate) |
| 30    | MCU_TEMP_C     | number | %.1f   | MCU temperature                 |
| 31    | RSSI_DBM       | number | %d     | Signal strength                 |
| 32    | RTC_EPOCH      | number | %lu    | RTC timestamp                   |
| 33    | CMD_ECHO       | string | %s     | Command echo                    |
| 34    | LOG_DATA       | string | %s     | Log data codes                  |

## Updated Commands

Based on the new GS_COMMANDS namespace:

### System Control

- START_TX
- STOP_TX
- STATUS
- CAL_SENSORS
- RESET
- START
- SHUTDOWN
- SD_CLEAN
- SD_INFO

### Communication & Actuation

- COMM_STATUS
- LANDER_STAGE1
- LANDER_STAGE2
- SECONDARY_DEPLOY

### RTC Time Management

- SET_MISSION_START
- GET_TIME
- SET_TIME:
- RTC_STATUS

### MCU Monitoring

- MCU_STATUS

### Emergency

- EMERGENCY

## Removed Legacy Fields

The following fields were removed as they are no longer part of the telemetry packet:

- GNSS_LATITUDE (replaced by LATITUDE)
- GNSS_LONGITUDE (replaced by LONGITUDE)
- GNSS_ALTITUDE (replaced by GPS_ALTITUDE)
- GNSS_SATS (replaced by SATELLITES)
- AIR_QUALITY_RAW
- AIR_QUALITY_ETHANOL_PPM
- HEALTH_FLAGS
- All derived air quality fields (VOC_PPM, CO_PPM, etc.)
- Reaction wheel commands (ARM_RW, DISARM_RW, etc.)
- Hardware reset commands
- SD card list command

## Log Data Format Change

LOG_DATA now contains raw log codes in format "codecodecode" instead of timestamped entries like "[time code]" for optimization and efficiency.

## Files Updated

- `src/types/telemetry.ts` - Updated main telemetry interface
- `src/data/csv-data.ts` - Updated CSV data structure and columns
- `src/pages/settings/constants.ts` - Updated command definitions
- `src/pages/settings/index.tsx` - Updated UI to use new command categories
- `src/components/telemetry-panel/index.tsx` - Updated field references
- `src/hooks/use-mcp-integration.ts` - Updated MCP integration field mapping
- `src/pages/plot-tab/components/gps-plot.tsx` - Updated GPS field references
