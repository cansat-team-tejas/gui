# CanSat Constants Documentation

This document explains what each constant in `constants.h` means for GUI development and system understanding.

## Hardware Configuration Constants

### I2C Device Addresses

- **`BNO055_I2C_ADDRESS = 0x28`** - I2C address for the BNO055 9-axis IMU sensor (gyroscope, accelerometer, magnetometer)
- **`INA219_I2C_ADDRESS = 0x40`** - I2C address for the INA219 power monitoring chip (measures voltage, current, power)

### SPI Pin Assignments (BME280 Environmental Sensor)

- **`BME280_CS_PIN = 10`** - Chip Select pin for BME280 environmental sensor (pressure, temperature, humidity)
- **`BME280_SCK_PIN = 13`** - SPI Clock pin for BME280
- **`BME280_SDI_PIN = 11`** - SPI Data Input (MOSI) pin for BME280
- **`BME280_SDO_PIN = 12`** - SPI Data Output (MISO) pin for BME280

### Digital Pin Assignments

- **`SERVO_PIN = 9`** - PWM pin controlling the parachute deployment servo motor
- **`MICS5524_ANALOG_PIN = A6`** - Analog input pin for MiCS-5524 air quality sensor
- **`BNO055_RESET_PIN = 7`** - Digital pin to hardware reset the IMU sensor
- **`XBEE_RESET_PIN = 8`** - Digital pin to hardware reset the XBee radio module
- **`GPS_RESET_PIN = 16`** - Digital pin to hardware reset the GPS module
- **`SD_CARD_CS_PIN = 254`** - Chip Select pin for SD card storage

### Hardware Configuration

- **`I2C_CLOCK_SPEED = 400000`** - I2C bus speed in Hz (400kHz - fast mode)
- **`ADC_RESOLUTION = 12`** - Analog-to-Digital Converter resolution in bits (4096 levels)
- **`ADC_AVERAGING = 4`** - Number of ADC samples to average for noise reduction
- **`STARTUP_DELAY = 100`** - Milliseconds to wait during system initialization
- **`SENSOR_CYCLE_COUNT = 5`** - Number of different sensors in the reading cycle

### Communication Settings

- **`GPS_BAUD_RATE = 38400`** - Serial communication speed with GPS module in bits per second
- **`XBEE_BAUD_RATE = 115200`** - Serial communication speed with XBee radio in bits per second
- **`SERIAL_BAUD_RATE = 9600`** - USB serial debug console speed in bits per second

## Mission Parameters

### Team & Environment

- **`TEAM_ID = "046"`** - Your team identification number for competition
- **`SEA_LEVEL_PRESSURE = 1013.25`** - Standard atmospheric pressure in hPa for altitude calculations

### Altitude Thresholds (in meters)

- **`LAUNCH_DETECTION_ALTITUDE = 20.0`** - Height above ground to detect rocket launch
- **`IMPACT_DETECTION_ALTITUDE = 5.0`** - Height above ground to detect landing/impact
- **`PARACHUTE_DEPLOY_ALTITUDE = 1000.0`** - Height to deploy main parachute
- **`SECONDARY_DEPLOY_ALTITUDE = 500.0`** - Height to deploy backup/secondary parachute
- **`MAX_ALTITUDE = 1000.0`** - Expected maximum flight altitude
- **`GROUND_LEVEL_ALTITUDE = 100.0`** - Local ground level reference altitude

### XBee Radio Configuration

- **`XBEE_DEST_HIGH = 0x0013A200`** - Upper 32 bits of ground station XBee address
- **`XBEE_DEST_LOW = 0x4249CE82`** - Lower 32 bits of ground station XBee address
- **`LOG_DATA_LABEL = "LOG:"`** - Prefix for system log messages
- **`CMD_ECHO_LABEL = "CMD_ECHO:"`** - Prefix for command acknowledgment messages

## Timing Constants (in milliseconds)

### Data Processing Intervals

- **`SENSOR_PROCESS_INTERVAL = 100`** - Read sensors every 100ms (10Hz rate)
- **`TELEMETRY_DATA_INTERVAL = 100`** - Send telemetry every 100ms (10Hz rate)
- **`LOG_DATA_INTERVAL = 5000`** - Send system logs every 5 seconds

### Communication Timing

- **`COMM_SEND_DELAY = 25`** - Delay between radio transmissions to prevent overflow
- **`RSSI_UPDATE_INTERVAL = 8000`** - Check radio signal strength every 8 seconds

### System Maintenance

- **`XBEE_INIT_DELAY = 1000`** - Wait 1 second for XBee radio initialization
- **`SD_FLUSH_INTERVAL = 3000`** - Write SD card buffer to storage every 3 seconds
- **`SD_LOG_FLUSH_INTERVAL = 7000`** - Flush log data to SD card every 7 seconds
- **`SD_TIMER_INTERVAL = 8000`** - SD card maintenance tasks every 8 seconds

## Buffer & Memory Constants

### Queue Sizes

- **`LOG_QUEUE_SIZE = 40`** - Maximum number of log messages in memory buffer
- **`TELEMETRY_QUEUE_SIZE = 240`** - Maximum number of telemetry packets in buffer
- **`COMM_QUEUE_SIZE = 24`** - Maximum number of outgoing radio messages in buffer
- **`LOG_DRAIN_COUNT = 75`** - Number of log entries to process at once

### Memory Buffer Sizes (in bytes)

- **`SD_BUFFER_SIZE = 2048`** - SD card write buffer size (2KB)
- **`TELEMETRY_BUFFER_SIZE = 2048`** - Telemetry formatting buffer size (2KB)
- **`FILENAME_BUFFER_SIZE = 128`** - Maximum filename length buffer
- **`LOG_LINE_BUFFER_SIZE = 64`** - Single log line formatting buffer

### Communication Limits

- **`RSSI_INVALID_VALUE = -128.0`** - Signal strength value indicating no signal
- **`GPS_INVALID_ALTITUDE = -500.0`** - GPS altitude indicating invalid/no fix
- **`XBEE_FRAME_ID = 0x52`** - Frame identifier for XBee packet tracking
- **`BUFFER_FLUSH_MASK = 0x07`** - Bit mask for buffer management timing

## System Constants

### Pressure & Reset Values

- **`QNH_MIN = 800.0`** - Minimum valid sea level pressure setting (hPa)
- **`QNH_MAX = 1100.0`** - Maximum valid sea level pressure setting (hPa)
- **`RESET_DELAY_SHORT = 100`** - Short delay for hardware resets (ms)
- **`RESET_DELAY_LONG = 200`** - Long delay for hardware resets (ms)
- **`SCB_AIRCR_RESET = 0x05FA0004`** - ARM Cortex system reset register value

### Buffer & Conversion Constants

- **`MILLIS_TO_SECONDS = 0.001`** - Convert milliseconds to seconds
- **`GPS_BLEND_FACTOR = 1.0`** - Weight for GPS/barometer altitude blending
- **`IMU_SENSOR_ID = 12345`** - Unique identifier for IMU sensor

## Servo Control Constants

### Parachute Deployment

- **`CLOSED_POSITION = 0`** - Servo angle (degrees) for parachute compartment closed
- **`OPEN_POSITION = 180`** - Servo angle (degrees) for parachute compartment open
- **`DEPLOYMENT_DURATION = 2000`** - Time to keep servo active during deployment (ms)

## Sensor Calibration Constants

### Air Quality Sensor

- **`AIR_QUALITY_SAMPLES = 50`** - Number of samples for sensor calibration
- **`CLEAN_AIR_RATIO = 3.6`** - Expected sensor resistance ratio in clean air

### IMU Sensor

- **`GYRO_CALIB_LEVEL = 6`** - Gyroscope calibration accuracy level (0-3, higher is better)
- **`ACCEL_CALIB_LEVEL = 6`** - Accelerometer calibration accuracy level (0-3, higher is better)

## Flight State Constants

### Mission Phases

- **`BOOT = 0`** - System starting up, initializing sensors
- **`TEST_MODE = 1`** - Ground testing mode, sensors active but no deployment
- **`LAUNCH_PAD = 2`** - Ready for launch, waiting for altitude increase
- **`ASCENT = 3`** - Rocket climbing, monitoring for apogee
- **`ROCKET_DEPLOY = 4`** - Rocket parachute deployed, CanSat ejected
- **`DESCENT = 5`** - Free falling, monitoring for main parachute deployment altitude
- **`SECONDARY_DEPLOY = 6`** - Main parachute deployed, monitoring for backup deployment
- **`FINAL_DESCENT = 7`** - All parachutes deployed, descending to landing
- **`IMPACT = 8`** - Landed, mission complete

## Ground Station Commands

### System Control

- **`START_TELEMETRY = "START_TX"`** - Begin sending telemetry data
- **`STOP_TELEMETRY = "STOP_TX"`** - Stop sending telemetry data
- **`STATUS = "STATUS"`** - Request system status report
- **`START = "START"`** - Activate all systems for mission
- **`SHUTDOWN = "SHUTDOWN"`** - Safe shutdown of all systems

### Calibration Commands

- **`CALIBRATE_SENSORS = "CAL_SENSORS"`** - Calibrate all sensors
- **`CALIBRATE_GYRO = "CAL_GYRO"`** - Calibrate gyroscope only
- **`CALIBRATE_BARO = "CAL_BARO"`** - Calibrate barometric pressure sensor
- **`CALIBRATE_ACCEL = "CAL_ACCEL"`** - Calibrate accelerometer
- **`AIR_QUALITY_CAL = "AIR_QUALITY_CAL"`** - Force air quality sensor calibration

### Emergency & Reset

- **`RESET_SYSTEM = "RESET"`** - Software reset of entire system
- **`RESET_CONFIRM = "RESET_CONFIRM"`** - Confirm system reset command
- **`EMERGENCY = "EMERGENCY"`** - Emergency parachute deployment
- **`DEPLOY_SECONDARY = "DEPLOY_SECONDARY"`** - Manually deploy backup parachute

### Hardware Reset Commands

- **`XBEE_RESET = "XBEE_RESET"`** - Software reset of XBee radio
- **`XBEE_HW_RESET = "XBEE_HW_RESET"`** - Hardware reset of XBee radio
- **`GPS_RESET = "GPS_RESET"`** - Hardware reset of GPS module

### Data Management

- **`QNH = "QNH:"`** - Set sea level pressure for altitude calculation
- **`SD_CLEAN = "SD_CLEAN"`** - Clear all data from SD card
- **`SD_INFO = "SD_INFO"`** - Get SD card storage information
- **`SD_LIST = "SD_LIST"`** - List files on SD card
- **`SD_DIR_INFO = "SD_DIR_INFO:"`** - Get directory information
- **`SD_DIR_DELETE = "SD_DIR_DELETE:"`** - Delete directory from SD card

## Filter Constants

### Signal Processing

- **`PRESSURE_EMA_ALPHA = 0.1`** - Exponential moving average filter strength for pressure (0.0-1.0, lower = more smoothing)
- **`ALTITUDE_GPS_BLEND_BETA = 0.02`** - Blending factor between GPS and barometric altitude (0.0-1.0)

## Logging Constants (Single Character Codes)

### System Events

- **`'$'`** - Log queue initialized
- **`'%'`** - Telemetry queue initialized
- **`'A'`** - System startup complete
- **`'B'`** - System error occurred
- **`'C'`** - System reset detected
- **`'D'`** - System ready for operation

### Environmental Sensor (BME280)

- **`'E'`** - Environmental sensor failed to initialize
- **`'F'`** - Environmental sensor initialized successfully
- **`'G'`** - Environmental data reading taken

### GPS Module

- **`'H'`** - GPS failed to initialize
- **`'I'`** - GPS initialized successfully
- **`'J'`** - GPS data reading taken
- **`'K'`** - GPS achieved position fix
- **`'g'`** - GPS hardware reset performed

### IMU Sensor (BNO055)

- **`'L'`** - IMU failed to initialize
- **`'M'`** - IMU initialized successfully
- **`'N'`** - IMU data reading taken

### Power Monitor (INA219)

- **`'O'`** - Power monitor failed to initialize
- **`'P'`** - Power monitor initialized successfully
- **`'Q'`** - Power data reading taken

### Air Quality Sensor (MiCS-5524)

- **`'R'`** - Air quality sensor operating successfully
- **`'S'`** - Air quality data reading taken
- **`'w'`** - Air quality sensor warmed up (3 minute warmup complete)
- **`'c'`** - Air quality sensor calibrated
- **`'r'`** - Air quality sensor failed to initialize
- **`'s'`** - Air quality sensor reading error
- **`'v'`** - Air quality invalid voltage/resistance reading
- **`'x'`** - Air quality calibration failed
- **`'a'`** - Air quality auto-calibration performed
- **`'d'`** - Air quality sensor appears disconnected
- **`'u'`** - Air quality warmup period started
- **`'h'`** - High gas concentration detected
- **`'b'`** - Air quality baseline resistance updated

### Parachute System

- **`'T'`** - Parachute deployed successfully
- **`'U'`** - Parachute deployment failed
- **`'V'`** - Parachute system armed for deployment

### Communication System

- **`'W'`** - Serial communication failed
- **`'X'`** - Serial communication successful
- **`'Y'`** - Radio communication failed
- **`'Z'`** - Radio communication successful
- **`'1'`** - No response from ground station
- **`'2'`** - Command received from ground station
- **`'z'`** - XBee radio reset performed

### Data Management

- **`'3'`** - Data buffer overflow occurred
- **`'4'`** - Data saved successfully
- **`'5'`** - Data cleared/deleted

### Ground Commands Received

- **`'6'`** - Reset command received
- **`'7'`** - Telemetry rate change command received
- **`'8'`** - Calibration command received
- **`'9'`** - Emergency command received
- **`'!'`** - Start command received
- **`'0'`** - Shutdown command received

### Flight State Changes

- **`'{'`** - Entered BOOT state
- **`'}'`** - Entered TEST_MODE state
- **`'['`** - Entered LAUNCH_PAD state
- **`']'`** - Entered ASCENT state
- **`'('`** - Entered ROCKET_DEPLOY state
- **`')'`** - Entered DESCENT state
- **`'='`** - Entered SECONDARY_DEPLOY state
- **`'+'`** - Entered FINAL_DESCENT state
- **`'*'`** - Entered IMPACT state

### SD Card Operations

- **`'@'`** - SD card initialized successfully
- **`'#'`** - SD card initialization failed
- **`'^'`** - SD card write successful
- **`'~'`** - SD card write failed

### Telemetry Control

- **`'|'`** - Telemetry transmission started
- **`'/'`** - Telemetry transmission stopped

### Calibration Events

- **`':'`** - Gyroscope calibration performed
- **`';'`** - Barometer calibration performed
- **`'<'`** - Accelerometer calibration performed
- **`'>'`** - Magnetometer calibration performed
- **`'i'`** - IMU calibration started
- **`'?'`** - Calibration sequence completed

### System Status

- **`'&'`** - Log file initialization failed
- **`'.'`** - Command controller initialized
- **`'q'`** - Sea level pressure (QNH) updated

## Health Flags (Bit Field)

These are combined into a single 16-bit value in telemetry:

- **`ENV_OK = 1 << 0`** - Bit 0: Environmental sensor (BME280) is working
- **`GPS_OK = 1 << 1`** - Bit 1: GPS module is working
- **`IMU_OK = 1 << 2`** - Bit 2: IMU sensor (BNO055) is working
- **`POWER_OK = 1 << 3`** - Bit 3: Power monitor (INA219) is working
- **`AIR_OK = 1 << 4`** - Bit 4: Air quality sensor (MiCS-5524) is working
- **`SD_OK = 1 << 5`** - Bit 5: SD card storage is working
- **`COMM_OK = 1 << 6`** - Bit 6: XBee radio communication is working

**Example**: Health flags value of `0x7F` (127 decimal) means all systems are operational.

---

## For GUI Development

### Key Values to Monitor:

1. **Health Flags** - Show system component status
2. **Flight State** - Current mission phase
3. **Log Codes** - Real-time system events
4. **Altitude Values** - Mission progress tracking
5. **Air Quality Data** - Environmental monitoring

### Critical Commands for GUI:

1. **`START_TX`** - Essential for receiving data
2. **`AIR_QUALITY_CAL`** - Required for air quality readings
3. **`STATUS`** - System health check
4. **`EMERGENCY`** - Safety override

### Timing Expectations:

- **Telemetry Rate**: 10Hz (every 100ms)
- **Air Quality Warmup**: 3 minutes (180 seconds)
- **Log Messages**: Every 5 seconds
- **Signal Strength**: Updated every 8 seconds
