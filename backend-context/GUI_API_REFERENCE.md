# MCP Server API & WebSocket Reference

This guide outlines the HTTP endpoints and WebSocket message contracts exposed by the MCP server. Share this with the GUI/AI team so they can integrate safely with the ground software.

---

## Mission file conventions

- Every mission stores data in a dedicated SQLite database located under the `missions/` directory.
- File names should be provided **without** path separators. The server ensures each mission file ends with `.db`.
- Example mission filename: `mission_2025-10-10.db`.

---

## HTTP endpoints

All HTTP endpoints accept and return JSON. Errors return an object with an `error` string and an appropriate HTTP status code. Unless otherwise noted, the service responds with `400` for malformed input and `500` for internal failures such as database access issues.

### Quick index

- `POST /ask` – Natural-language questions about the active mission. _Use to ask mission-specific questions and receive optional AI command suggestions._
- `POST /data` – Historical telemetry export for a mission database. _Use for historical telemetry pulls (tables, plots, exports)._
- `GET /api/xbee/status` – Connection status, mission metadata, and stats snapshot. _Use to power connection indicators and mission summaries._
- `GET /api/xbee/health` – Live link health indicators (latency, uptime, last data). _Use for real-time radio link dashboards._
- `GET /api/xbee/logs`, `/api/xbee/logs/commands`, `/api/xbee/logs/responses` – Combined or filtered command/response history. _Use when displaying chronological command/response tables._
- `GET /api/xbee/telemetry` – Latest telemetry frame. _Use to seed widgets that need the most recent packet._
- `GET /api/xbee/telemetry/stats` – Aggregated telemetry statistics (altitude, temperature, etc.). _Use for summary cards and trend headers._
- `GET /api/xbee/activity` – Most recent activity feed entries. _Use to populate the live activity log._
- `POST /api/xbee/command` – Send AT/data commands to the spacecraft. _Use when issuing commands from the GUI control surface._
- `POST /api/xbee/mission/start` – Create and switch to a new mission database. _Use during mission reset/start workflows._
- `GET /api/xbee/mission` – Retrieve current mission metadata. _Use to display the active mission name and timestamps._

### `POST /ask`

Ask the AI assistant questions about the current mission data.

> **Use case:** Natural-language questions about mission telemetry with optional AI command recommendations.

**Request body**

```json
{
  "question": "string, required",
  "filename": "mission database name, required"
}
```

**Successful response**

```json
{
  "answer": {
    "content": "Natural-language answer string"
  },
  "command": "Optional command suggestion"
}
```

- `command` is present when the AI suggests a single action (e.g., `DEPLOY`); otherwise it is omitted.

**Error responses**

- `400` when the payload is malformed or the question is blank.
- `500` when the AI or database layer fails. Body: `{ "error": "description" }`.

### `POST /data`

Fetch the most recent telemetry rows stored for a mission.

> **Use case:** Historical telemetry pulls for tables, exports, or offline analysis.

**Request body**

```json
{
  "filename": "mission database name, required"
}
```

**Successful response**

- Array of telemetry objects. Each telemetry record mirrors the columns in `internal/models/telemetry.go`. Example (fields omitted for brevity):

```json
[
  {
    "id": 123,
    "team_id": "TEAM42",
    "mission_time_s": 153.2,
    "packet_count": 87,
    "altitude": 1023.5,
    "gyro_spin_rate": 1.23,
    "yaw_rate_target": null,
    "created_at": "2025-10-10T12:34:56Z"
  }
]
```

**Error responses**

- `400` when `filename` is missing or invalid.
- `500` when the mission database cannot be opened or queried. Body: `{ "error": "description" }`.

### `GET /api/xbee/status`

Returns the current radio connection state, the active mission, and a snapshot of service statistics in a single payload. The shape mirrors the WebSocket `status` event and includes:

> **Use case:** Populate connection-state banners, current mission cards, and instant packet counters in the GUI.

```json
{
  "success": true,
  "connection": {
    "connected": true,
    "port": "COM7",
    "lastActivity": "2025-10-10T12:05:00Z"
  },
  "mission": {
    "name": "Mission_2025-10-10_12-00-00",
    "dbPath": "missions/mission_1696966400.db",
    "startTime": "2025-10-10T12:00:00Z"
  },
  "stats": {
    "packetsReceived": 123,
    "packetsSent": 45,
    "packetRate": 2.5,
    "lastDataReceived": "2025-10-10T12:04:58Z"
  }
}
```

### `GET /api/xbee/health`

Provides real-time link health data such as current latency, uptime, and seconds since the last telemetry packet:

> **Use case:** Display radio health metrics (latency gauges, uptime clocks) in dashboards.

```json
{
  "success": true,
  "health": {
    "connected": true,
    "latencyMs": 120,
    "uptimeSeconds": 86400,
    "lastDataDeltaSeconds": 1.7
  }
}
```

### `GET /api/xbee/logs`

Returns the combined command/response log in chronological order. Use the filtered variants for convenience:

- `/api/xbee/logs/commands` – outbound commands only.
- `/api/xbee/logs/responses` – only command responses/echoes.

Each entry includes the command, raw payload (if applicable), status, and timestamp.

> **Use case:** Audit trails and command history panels.

### `GET /api/xbee/telemetry`

Returns the most recent telemetry packet captured by the backend. Fields match the structure described in `internal/models/telemetry.go`.

> **Use case:** Seed UI widgets that need the freshest telemetry sample before the WebSocket stream delivers updates.

### `GET /api/xbee/telemetry/stats`

Provides derived statistics (min/max/avg altitude, temperature, etc.) for the active mission. The response wraps the stats object inside `{ "success": true, "stats": { ... } }`.

> **Use case:** Populate summary metrics (cards, hero numbers) without recomputing aggregates client-side.

### `GET /api/xbee/activity`

Returns an array of recent activity entries, each containing `timestamp`, `type`, `frameType`, and `details`. This mirrors the WebSocket `activity` push events.

> **Use case:** Fill the “recent activity” feed even before the WebSocket stream is established.

### `POST /api/xbee/command`

Send a command or raw payload to the spacecraft radio.

> **Use case:** GUI command console and quick-action buttons.

**Request body**

```json
{
  "command": "string, required",
  "data": "optional string"
}
```

**Successful response**

```json
{
  "success": true,
  "message": "Forwarded command",
  "mission": {
    "name": "Mission_2025-10-10_12-00-00",
    "dbPath": "missions/mission_1696966400.db"
  }
}
```

- When command execution fails, the response is `{ "success": false, "error": "description" }` with HTTP 500.
- Input validation failures (missing `command`) return HTTP 400 with `{ "error": "description" }`.

### `POST /api/xbee/mission/start`

Creates a new mission database, optionally naming it.

> **Use case:** Triggered from “Start Mission” workflows that spin up a fresh database and telemetry log.

**Request body (optional)**

```json
{
  "name": "Mission_2025-10-10_12-00-00"
}
```

When no name is provided, the backend generates one automatically.

**Successful response**

```json
{
  "success": true,
  "mission": {
    "id": "mission_1696966400",
    "name": "Mission_2025-10-10_12-00-00",
    "dbPath": "missions/mission_1696966400.db",
    "startTime": "2025-10-10T12:00:00Z",
    "isActive": true
  }
}
```

### `GET /api/xbee/mission`

Fetches the metadata for the currently active mission. The payload matches the `mission` object shown above.

> **Use case:** Display mission details (name, start time, DB path) in settings or status panels.

---

## WebSocket API

Connect to `ws://<host>:<port>/api/xbee/ws` for live telemetry, command echoes, and mission activity. The server requires a standard WebSocket upgrade request; non-upgrade requests receive HTTP 426.

Messages use the following envelope:

```json
{
  "action": "string",
  "data": { "key": "value" }
}
```

Server responses share this structure:

```json
{
  "type": "command_response" | "mission_response" | "stats_response" | "activity_response" | "error",
  "success": true,
  "data": {
    /* payload differs per type */
  }
}
```

On failure, `success` is `false` and an `error` string is provided. Beyond direct responses, the server streams telemetry, stats, and activity updates asynchronously using the `LiveTelemetryData` schema (see **Server push events**).

### Client actions

| Action          | Payload (`data`)                                        | Description                                                                            |
| --------------- | ------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| `send_command`  | `{ "command": "text", "data": "optional raw payload" }` | Sends an AT command or data packet to the vehicle. `data` is interpreted as raw bytes. |
| `start_mission` | `{ "name": "optional mission name" }`                   | Starts a new mission. When omitted, the server auto-generates a timestamped name.      |
| `get_stats`     | `{}`                                                    | Requests an immediate stats snapshot.                                                  |
| `get_activity`  | `{ "limit": number (optional, default 50) }`            | Requests the latest activities up to `limit` entries.                                  |

### Command responses

```json
{
  "type": "command_response",
  "success": true,
  "error": null
}
```

- On failure, `success` is `false` and `error` contains the description.

### Mission responses

```json
{
  "type": "mission_response",
  "success": true,
  "data": {
    "id": "mission_1696966400",
    "name": "Mission_2025-10-10_12-00-00",
    "startTime": "2025-10-10T12:00:00Z",
    "isActive": true,
    "dbPath": "missions/mission_1696966400.db"
  }
}
```

### Stats responses

```json
{
  "type": "stats_response",
  "success": true,
  "data": {
    "packetRate": 2.5,
    "packetsReceived": 123,
    "packetsSent": 45,
    "lastUpdate": "2025-10-10T12:05:00Z",
    "frameStats": {
      "telemetryCount": 120,
      "logEntryCount": 3,
      "commandEchoCount": 0,
      "unknownCount": 0
    },
    "connectionStatus": "connected",
    "lastDataReceived": "2025-10-10T12:04:58Z"
  }
}
```

### Activity responses

```json
{
  "type": "activity_response",
  "success": true,
  "data": [
    {
      "timestamp": "2025-10-10T12:04:57Z",
      "type": "FRAME_RECEIVED",
      "frameType": "TELEMETRY",
      "details": "Received 64-byte telemetry frame"
    }
  ]
}
```

### Error envelope

Any unknown action or server-side failure returns:

```json
{
  "type": "error",
  "success": false,
  "error": "Description of the failure"
}
```

---

## Server push events

Independently of client requests, the server sends real-time updates with this schema:

```json
{
  "type": "<event type>",
  "timestamp": "ISO-8601",
  "data": { ... },
  "stats": { ... },
  "activity": { ... },
  "error": "optional"
}
```

Depending on `type`, only some fields are populated:

| Event type          | Contents                                                                       |
| ------------------- | ------------------------------------------------------------------------------ |
| `live_telemetry`    | `data` contains the latest `Telemetry` record mirroring the `/data` structure. |
| `stats_update`      | `stats` includes the same structure as `stats_response.data`.                  |
| `activity`          | `activity` contains a single activity entry.                                   |
| `connection_status` | `activity` includes a short message about connect/disconnect events.           |

A telemetry event example:

```json
{
  "type": "live_telemetry",
  "timestamp": "2025-10-10T12:04:58Z",
  "data": {
    "mission_time_s": 158.7,
    "altitude": 1034.2,
    "roll": 0.12,
    "pitch": -0.05,
    "yaw": 1.56,
    "health_flags": "0x01"
  }
}
```

---

## Error handling strategy

- HTTP layer always returns meaningful status codes (`4xx` for client input issues, `5xx` for internal failures).
- WebSocket messages include an `error` string alongside `success: false`.
- Activity stream also surfaces error events with `type: "ERROR"` when parsing or database operations fail.

---

## Integration checklist for the GUI team

1. Allow users to select or name a mission database (`*.db`).
2. Warm up the AI using `POST /ask` with the selected mission when presenting question-answer workflows.
3. Subscribe to the WebSocket stream immediately after mission selection to receive `live_telemetry` and `stats_update` events.
4. Use `send_command` to issue commands; monitor `command_response` and activity events for feedback.
5. Refresh historical data with `POST /data` when the GUI needs tabular views or exports.
6. Handle `connection_status` events to alert operators when the radio link drops.
