go mod tidy
go run ./cmd

# MCP / XBee Go Backend Integration

The Go backend exposes a single mission-control service that manages XBee telemetry, mission databases, and AI assistance. It now uses [Fiber](https://gofiber.io/) with Ollama-powered responses and an auto-managed mission pipeline.

## Highlights

- **Hands-free XBee link** – automatic detect/connect/reconnect cycle
- **Mission lifecycle** – missions are started on demand and mapped to individual SQLite databases
- **Real-time telemetry** – streaming via WebSocket plus REST fallbacks
- **AI chat** – `/api/chat` and `/api/chat/ws` for low-latency responses and command detection
- **Telemetry analytics** – packet rate, health, and summary statistics provided by dedicated endpoints
- **Instruction profiles** – AI behaviour configured via `ai_instructions.toml`

## Prerequisites

- Go 1.22+
- Ollama running locally with the configured model (default `gemma3:4b`)
- XBee radio connected to the host machine

## Configuration

| Variable      | Description            | Default                  |
| ------------- | ---------------------- | ------------------------ |
| `PORT`        | HTTP port to listen on | `8000`                   |
| `LLM_API_URL` | Ollama endpoint        | `http://localhost:11434` |
| `LLM_MODEL`   | Ollama model name      | `gemma3:4b`              |

## Running Locally

```powershell
cd mcp-server

$env:CGO_ENABLED=0
go run ./cmd
```

The GUI assumes the backend is reachable at `http://localhost:8000` unless overridden in settings.

## Core Endpoints

### Mission & Telemetry Management

| Endpoint                    | Method | Description                                                                          |
| --------------------------- | ------ | ------------------------------------------------------------------------------------ |
| `/api/xbee/mission/start`   | `POST` | Start a mission with a friendly name (returns mission metadata, including `dbPath`). |
| `/api/xbee/mission`         | `GET`  | Retrieve the active mission (id, name, start time, db path).                         |
| `/api/xbee/status`          | `GET`  | Connection snapshot with mission, stats, and radio configuration.                    |
| `/api/xbee/telemetry`       | `GET`  | Paginated telemetry history (supports `start_time`, `end_time`, `limit`).            |
| `/api/xbee/telemetry/stats` | `GET`  | Aggregate telemetry statistics (min/max/avg).                                        |
| `/api/xbee/health`          | `GET`  | Link health diagnostic (uptime, last packet, packet counters).                       |

> **Automatic ingestion** – telemetry frames received over XBee are persisted by the backend; the GUI no longer posts telemetry manually.

### Command & Activity

| Endpoint             | Method | Description                                                                |
| -------------------- | ------ | -------------------------------------------------------------------------- |
| `/api/xbee/command`  | `POST` | Send a command to the CanSat (body: `{ "command": "START", "data": "" }`). |
| `/api/xbee/logs`     | `GET`  | Combined command/response history (latest 10,000 entries).                 |
| `/api/xbee/activity` | `GET`  | Structured activity feed (frame processed, connection changes, errors).    |

### AI Assistance

| Endpoint           | Method | Description                                                                                                                               |
| ------------------ | ------ | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `/api/chat`        | `POST` | Non-streaming chat (`{ "messages": [{ "role": "user", "content": "..." }], "stream": false }`). Returns `{ success, message, command? }`. |
| `/api/chat/ws`     | `GET`  | WebSocket chat streaming (bidirectional); messages follow the same shape as `/api/chat`.                                                  |
| `/api/chat/health` | `GET`  | Health probe for the AI service.                                                                                                          |

### WebSocket

`ws://<host>/api/xbee/ws` streams real-time updates. Message `type` values:

- `telemetry` – latest telemetry payload
- `stats` – updated packet/command counters
- `mission` – mission metadata changes
- `health` – connection health
- `activity` – logging events

## Mission Metadata Structure

```json
{
  "id": "mission_1696752000",
  "name": "Mission_2025-10-10_10-00-00",
  "startTime": "2025-10-10T10:00:00Z",
  "isActive": true,
  "dbPath": "missions/mission_1696752000.db"
}
```

The GUI stores the `dbPath` so it can route AI questions to the correct mission database when required.

## Telemetry Shape

Key fields returned by `/api/xbee/telemetry`:

| Field                                    | Description                          |
| ---------------------------------------- | ------------------------------------ |
| `TEAM_ID`                                | Team identifier (string)             |
| `mission_time_s`                         | Mission clock in seconds             |
| `packet_count`                           | Packet number (auto-increment)       |
| `altitude`, `gps_altitude`               | Barometric & GNSS altitude (meters)  |
| `pressure`, `temperature`, `voltage`     | Core environment & power metrics     |
| `latitude`, `longitude`                  | GNSS coordinates                     |
| `satellites`                             | GNSS satellite lock count            |
| `accel_*`, `gyro_*`, `mag_*`             | IMU sensor axes                      |
| `humidity`, `current`, `power`           | Additional environment/power signals |
| `air_quality_raw`, `aq_ethanol_ppm`      | Air quality sensor data              |
| `mcu_temp_c`, `rssi_dbm`, `health_flags` | Board telemetry                      |
| `cmd_echo`                               | Latest command echo, if present      |

## GUI Integration Notes

- `MCPService.createDatabase` now proxies `/api/xbee/mission/start` and falls back to legacy `/create-db` only if the new endpoint is absent.
- Telemetry auto-ingestion means the GUI no longer posts `/insert-data`; the integration hook simply listens for mission metadata updates.
- `MCPService.askQuestion` calls `/api/chat` by default and gracefully falls back to legacy `/ask` for older deployments.
- Configure the backend base URL in **Settings → Backend URL**; the AI port toggle is retained for backward compatibility but not required.

## Troubleshooting

- **No real-time data** – verify WebSocket connectivity (`/api/xbee/ws`) and check `/api/xbee/health` for downtime.
- **Mission not starting** – confirm `/api/xbee/mission/start` returns `success: true` and that the `START` command was acknowledged (`commandEchoHistory`).
- **AI errors** – check `/api/chat/health` and ensure Ollama is running with the configured model.
- **Legacy endpoints** – if you are running an older backend build, the GUI automatically falls back to `/create-db` and `/ask` where needed.
  **Request:**
