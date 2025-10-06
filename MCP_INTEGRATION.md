# Go Fiber Telemetry Service

This Go application provides a REST API for CanSat telemetry data management and AI-assisted querying. It uses [Fiber](https://gofiber.io/) as the web framework, GORM for database operations, and integrates with Hugging Face for AI-powered responses.

## Features

- **Multi-database support**: Each API request specifies a database file via the `filename` parameter
- **AI-powered Q&A**: Natural language queries about telemetry data with automatic SQL generation
- **Command detection**: Recognizes GS (Ground Station) commands and provides formatted responses
- **Conversation history**: Stores and retrieves Q&A history for each database
- **Data insertion**: Direct insertion of telemetry data points
- **Schema auto-migration**: Automatically creates tables using GORM migrations

## Prerequisites

- Go 1.22+
- Hugging Face API token with access to `meta-llama/Llama-3.1-8B-Instruct:fireworks-ai`

## Configuration

Set the following environment variables before running the server:

| Variable             | Description                                 | Default      |
| -------------------- | ------------------------------------------- | ------------ |
| `HUGGING_FACE_TOKEN` | Bearer token for Hugging Face Inference API | **required** |
| `PORT`               | HTTP port to listen on                      | `8000`       |

## Running

```powershell
cd mcp-server
go mod tidy
$env:CGO_ENABLED=0
go run ./cmd
```

The server listens on `http://localhost:8000` by default.

## API Endpoints

All endpoints expect JSON payloads and return JSON responses. Each request must include a `filename` parameter specifying the SQLite database file to operate on.

### 1. Create Database

**POST** `/create-db`

Creates a new SQLite database file with the required tables.

**Request:**

```json
{
  "filename": "mission1.db"
}
```

**Response:**

```json
{
  "message": "Database created successfully"
}
```

### 2. Ask Questions

**POST** `/ask`

Processes natural language questions about telemetry data, generates SQL queries, executes them, and provides AI-powered conversational responses. Supports GS command detection.

If the specified database file doesn't exist, falls back to answering based on static context from a `.txt` file (e.g., `mission1.txt` for `mission1.db`, or `context.txt` as fallback).

**Request:**

```json
{
  "question": "What is the average altitude?",
  "filename": "mission1.db"
}
```

**Response:**

```json
{
  "answer": {
    "content": "The average altitude across all telemetry points is 1250.5 meters..."
  },
  "command": "ALT"
}
```

### 3. Get Telemetry Data

**POST** `/data`

Returns all telemetry data points from the specified database.

**Request:**

```json
{
  "filename": "mission1.db"
}
```

**Response:**

```json
[
  {
    "id": 1,
    "TEAM_ID": "TEJAS",
    "mission_time_s": 120.5,
    "altitude": 1250.5,
    "temperature": 25.3
    // ... all telemetry fields
  }
]
```

### 4. Insert Telemetry Data

**POST** `/insert-data`

Inserts a new telemetry data point into the database.

**Request:**

```json
{
  "filename": "mission1.db",
  "TEAM_ID": "TEJAS",
  "mission_time_s": 120.5,
  "packet_count": 45,
  "altitude": 1250.5,
  "pressure": 1013.25,
  "temperature": 25.3,
  "voltage": 3.7,
  "latitude": 12.9716,
  "longitude": 77.5946,
  "satellites": 8,
  "flight_state": 2
  // ... other optional fields
}
```

**Response:**

```json
{
  "message": "Data inserted successfully",
  "id": 123
}
```

## Data Types

### Telemetry Fields

All telemetry fields are optional (nullable) in the database:

| Field                           | Type    | Description                  |
| ------------------------------- | ------- | ---------------------------- |
| `TEAM_ID`                       | string  | Team identifier              |
| `mission_time_s`                | float64 | Mission time in seconds      |
| `packet_count`                  | int     | Packet sequence number       |
| `altitude`                      | float64 | Altitude in meters           |
| `pressure`                      | float64 | Atmospheric pressure         |
| `temperature`                   | float64 | Temperature in Celsius       |
| `voltage`                       | float64 | Battery voltage              |
| `gnss_time`                     | string  | GNSS timestamp               |
| `latitude`                      | float64 | GPS latitude                 |
| `longitude`                     | float64 | GPS longitude                |
| `gps_altitude`                  | float64 | GPS altitude                 |
| `satellites`                    | int     | Number of GPS satellites     |
| `accel_x`, `accel_y`, `accel_z` | float64 | Accelerometer readings       |
| `gyro_spin_rate`                | float64 | Gyroscope spin rate          |
| `flight_state`                  | int     | Flight state code            |
| `gyro_x`, `gyro_y`, `gyro_z`    | float64 | Gyroscope readings           |
| `roll`, `pitch`, `yaw`          | float64 | Orientation angles           |
| `mag_x`, `mag_y`, `mag_z`       | float64 | Magnetometer readings        |
| `humidity`                      | float64 | Humidity percentage          |
| `current`                       | float64 | Current draw                 |
| `power`                         | float64 | Power consumption            |
| `baro_altitude`                 | float64 | Barometric altitude          |
| `air_quality_raw`               | int     | Raw air quality sensor value |
| `aq_ethanol_ppm`                | float64 | Ethanol concentration in ppm |
| `mcu_temp_c`                    | float64 | MCU temperature              |
| `rssi_dbm`                      | int     | Signal strength in dBm       |
| `health_flags`                  | string  | Health status flags          |
| `rtc_epoch`                     | int     | Real-time clock epoch        |
| `cmd_echo`                      | string  | Command echo                 |

### Conversation Fields

| Field        | Type      | Description                              |
| ------------ | --------- | ---------------------------------------- |
| `id`         | uint      | Auto-generated primary key               |
| `question`   | string    | User's question                          |
| `answer`     | string    | AI-generated answer                      |
| `commands`   | string    | Comma-separated command codes (optional) |
| `created_at` | time.Time | Timestamp of conversation                |

## Notes

- Databases are created automatically when first accessed if they don't exist
- All database operations are thread-safe with per-request connections
- AI responses include data analysis and insights based on actual telemetry values
- Command detection recognizes predefined GS commands and returns appropriate codes
- SQL queries are generated automatically from natural language questions
- Error responses follow standard HTTP status codes with descriptive messages
