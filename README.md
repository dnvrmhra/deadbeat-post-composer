# Deadbeat Post Composer

Full-stack social media scheduling and post management application comprising a modern React TypeScript frontend and a containerized Spring Boot REST backend.

---

## Table of Contents

- [System Overview](#system-overview)
- [System Architecture and Interaction Flow](#system-architecture-and-interaction-flow)
- [Directory Structure and Organization](#directory-structure-and-organization)
- [Frontend Architecture](#frontend-architecture)
  - [Core Features](#core-features)
  - [UX Enhancements](#ux-enhancements)
  - [Execution Instructions](#execution-instructions)
- [Backend Architecture](#backend-architecture)
  - [Experiment 2.1.1: RESTful APIs with Spring Boot](#experiment-211-restful-apis-with-spring-boot)
  - [Experiment 2.1.2: Global Exception Handling and Structured Logging](#experiment-212-global-exception-handling-and-structured-logging)
  - [Spring Profiles](#spring-profiles)
  - [File-Based Logging](#file-based-logging)
  - [Execution Instructions via Docker](#execution-instructions-via-docker)
- [API Specification and Endpoints](#api-specification-and-endpoints)
- [End-to-End Request and Response Lifecycle](#end-to-end-request-and-response-lifecycle)
- [Verification and Testing Guide](#verification-and-testing-guide)
- [Technology Stack Summary](#technology-stack-summary)

---

## System Overview

The system provides a decoupled, scalable architecture designed to support content composition across multiple social networks:

1. **Client Layer (Frontend)**: React 18 single-page application built with TypeScript, Redux Toolkit, and Vite. Handles cross-platform content drafting, character limit enforcement per platform, date and time scheduling, and real-time live preview.
2. **Server Layer (Backend)**: Spring Boot 3 application executing inside a Docker container. Provides a layered REST API (Controller, Service, Repository) backed by an in-memory H2 database. Implements Bean Validation, centralized exception handling, MDC-based distributed request tracing, file-based rolling log management, and environment profiling.

---

## System Architecture and Interaction Flow

```
+-----------------------------------------------------------------------------------+
|                                 USER ENVIRONMENT                                  |
|                             Web Browser / Postman                                 |
+-----------------------------------------------------------------------------------+
                                         |
                       [HTTP Port 5173]  |  [HTTP Port 8080]
                                         |
        +--------------------------------+--------------------------------+
        |                                                                 |
        v                                                                 v
+------------------------------------+          +-----------------------------------------+
|      FRONTEND (React + Vite)       |          |         BACKEND (Docker Container)      |
|                                    |          |                                         |
|  - Multi-platform post composer    |          |  +-----------------------------------+  |
|  - Redux Toolkit state storage     |          |  |       CorrelationIdFilter         |  |
|  - Real-time social preview engine |          |  |  Generates / Extracts Trace UUID  |  |
|  - Custom scheduling picker        |          |  |  Sets X-Correlation-ID header     |  |
|  - Role-based routing and auth     |          |  +-----------------------------------+  |
|  - Toast notification system       |          |                   |                     |
|  - Keyboard shortcuts              |          |  +-----------------------------------+  |
|                                    |          |  |         DispatcherServlet         |  |
|  API calls via backendApi.ts  -----+--------->|  +-----------------------------------+  |
|  Falls back to localStorage when   |          |                   |                     |
|  Docker is not running             |          |  +-----------------------------------+  |
+------------------------------------+          |  |    PostController (REST API)      |  |
                                                |  |    @Valid Request DTO Validation  |  |
                                                |  +-----------------------------------+  |
                                                |         |                     |         |
                                                |         v                     v         |
                                                |  +---------------+    +--------------+  |
                                                |  |  PostService  |    | GlobalError  |  |
                                                |  | Business Rule |    | Handler      |  |
                                                |  +---------------+    | @Advice      |  |
                                                |         |             +--------------+  |
                                                |         v                               |
                                                |  +----------------+                     |
                                                |  | PostRepository |                     |
                                                |  | JPA Data Access|                     |
                                                |  +----------------+                     |
                                                |         |                               |
                                                |         v                               |
                                                |  +----------------+                     |
                                                |  | H2 In-Memory DB|                     |
                                                |  +----------------+                     |
                                                |                                         |
                                                |  +-----------------------------------+  |
                                                |  | Logback RollingFileAppender       |  |
                                                |  | logs/application.log (10MB cap)   |  |
                                                |  +-----------------------------------+  |
+---------------------------------------------------------------------------------------+
```

---

## Directory Structure and Organization

```
post-composer/
|-- index.html
|-- package.json
|-- tsconfig.json
|-- vite.config.ts
|-- README.md                               <- Root full-stack documentation (this file)
|
|-- public/
|   |-- _redirects                          <- Netlify SPA client routing rules
|   +-- assets/
|
|-- src/                                    <- React application root
|   |-- App.tsx                             <- Route definitions, ToastProvider wrapper
|   |-- main.tsx
|   |-- api/
|   |   |-- mockApi.ts                      <- localStorage CRUD + JWT auth layer
|   |   +-- backendApi.ts                   <- HTTP client for Spring Boot backend
|   |-- components/
|   |   |-- Button.tsx
|   |   |-- CharacterCounter.tsx
|   |   |-- DateTimePicker.tsx              <- Custom calendar grid + 24h time picker
|   |   |-- DeadbeatCursor.tsx              <- Magnetic custom cursor
|   |   |-- DraftCard.tsx
|   |   |-- ImageUploader.tsx
|   |   |-- Navbar.tsx
|   |   |-- PlatformCard.tsx
|   |   |-- SocialPreview.tsx               <- Live platform-styled post preview
|   |   +-- ValidationMessage.tsx
|   |-- context/
|   |   |-- AuthContext.tsx                 <- JWT-based role auth context
|   |   +-- ToastContext.tsx                <- Global animated toast notification system
|   |-- features/posts/
|   |   |-- postsSlice.ts                   <- Redux thunks routing to backend or localStorage
|   |   +-- selectors.ts
|   |-- pages/
|   |   |-- Composer.tsx                    <- Multi-platform post composer
|   |   |-- Drafts.tsx                      <- Draft management and filtering
|   |   |-- CalendarPage.tsx                <- Monthly scheduling grid
|   |   +-- Login.tsx
|   |-- styles/
|   |   +-- index.css
|   +-- utils/
|       +-- validation.ts                   <- Per-platform character limit validation
|
|-- backend/                                <- Auxiliary Spring Boot template
|   |-- pom.xml
|   +-- src/
|
+-- spring-boot-lab-main/                   <- Lab repository root folder
    +-- spring-boot-lab-main/               <- Active backend workspace (Docker + Source)
        |-- Dockerfile                      <- Multi-stage Maven build + JRE Alpine runtime
        |-- pom.xml                         <- Spring Boot 3.2.5, Java 17
        |-- logs/                           <- File-based log output (mounted via Docker volume)
        |   +-- application.log
        +-- src/main/
            |-- java/com/example/demo/
            |   |-- Application.java        <- Entry point + /api/health + /api/profile endpoints
            |   |-- config/CorsConfig.java
            |   |-- controller/PostController.java
            |   |-- dto/
            |   |   |-- ApiResponse.java
            |   |   |-- PostRequestDto.java
            |   |   +-- PostResponseDto.java
            |   |-- exception/
            |   |   |-- GlobalExceptionHandler.java
            |   |   +-- ResourceNotFoundException.java
            |   |-- filter/
            |   |   +-- CorrelationIdFilter.java
            |   |-- model/Post.java
            |   |-- repository/PostRepository.java
            |   +-- service/PostService.java
            +-- resources/
                |-- application.properties          <- Base config, active profile declaration
                |-- application-dev.properties      <- Development profile settings
                |-- application-prod.properties     <- Production profile settings
                +-- logback-spring.xml              <- File-only Logback appender configuration
```

### Explanation of Nested Directories

The workspace contains `spring-boot-lab-main/spring-boot-lab-main/`. This nesting occurs due to the extraction process of GitHub release zip archives:

1. GitHub packages repositories into a root-level folder named after the repository branch (e.g., `spring-boot-lab-main.zip` contains an internal folder `spring-boot-lab-main/`).
2. When extracted into an existing folder also named `spring-boot-lab-main`, a two-tier nested path is produced.
3. All Docker commands, Maven builds, and source code reside inside `spring-boot-lab-main/spring-boot-lab-main/`. All Docker commands must be run from that inner directory.

---

## Frontend Architecture

### Core Features

- **Multi-Platform Cross-Posting**: Supports simultaneous selection of Twitter, Instagram, LinkedIn, and Facebook. Each platform generates an independent draft with its own character limit validation and platform-specific formatting rules.
- **Per-Platform Validation**: Twitter enforces 280 characters. Instagram requires an image attachment and allows up to 2200 characters. LinkedIn and Facebook support longer content. Validation is evaluated against the most restrictive selected platform.
- **Redux Toolkit State Management**: All editor state (content, selected platforms, images, scheduled time) persists in Redux. Draft operations are dispatched via async thunks that route to the Spring Boot backend when available, or fall back to `localStorage` automatically.
- **Backend Integration via `backendApi.ts`**: Checks backend reachability once per save operation. When Docker is running, posts are persisted to the H2 database with prefixed IDs (`api-{id}`). When offline, posts are saved locally using `nanoid`.
- **Real-Time Social Preview**: Live rendering engine in `SocialPreview.tsx` that mimics platform UI elements including avatar placeholders, hashtag and mention token highlighting, and image displays.
- **Custom DateTime Scheduling**: Full calendar grid and 24-hour time selector built without third-party date libraries, fully integrated with the Redux editor state.
- **Role-Based Access Control (JWT)**: Authentication context enforces role-based routing. Admin and Editor roles may compose and edit drafts. Viewer role has read-only access to drafts and calendar.
- **Dark and Light Theme**: Persisted via `localStorage` and toggled from the navbar.

### UX Enhancements

- **Animated Toast Notification System**: Global `ToastContext` mounted in `App.tsx` provides animated slide-in toasts from the bottom-right corner with a draining progress bar. Fires on draft saved, updated, deleted, content copied, and error states. Auto-dismisses after 3.2 seconds. Click to dismiss early.
- **SVG Progress Rings on Platform Tabs**: Each platform tab in the Live Preview header displays a circular SVG ring that fills as content is typed. Colour transitions from the platform brand colour to amber at 90% capacity and red at 100%.
- **Quick Action Toolbar**: Compact toolbar above the textarea with:
  - Copy to clipboard with a visual "Copied!" state confirmation.
  - Two-step Clear confirmation to prevent accidental deletion.
  - One-click hashtag pills (`#tech`, `#design`, `#marketing`, `#social`, `#creative`, `#updates`) that append directly to content.
- **Keyboard Shortcuts**: `Ctrl + Enter` (or `Cmd + Enter` on Mac) saves the current draft from anywhere on the Composer page. A visible `kbd` hint is displayed below the Save button.
- **Magnetic Custom Cursor**: Smooth animated cursor with a dot and trailing ring using `mix-blend-mode: difference`. Sits at `z-index: 999999` to stay visible above all modals and dropdowns.

### Execution Instructions

1. Install dependencies:
   ```bash
   npm install
   ```

2. Launch development server:
   ```bash
   npm run dev
   ```
   Frontend runs at: `http://localhost:5173`

3. Production build:
   ```bash
   npm run build
   ```

---

## Backend Architecture

The backend implements the academic requirements of Experiments 2.1.1 and 2.1.2, aligned with the `CalendarPage` event data model used in the frontend.

### Experiment 2.1.1: RESTful APIs with Spring Boot

- **Layered Architecture**: Strict boundary between Controller (`PostController`), Service (`PostService`), and Repository (`PostRepository`) layers. Each layer communicates only with its adjacent layer.
- **Data Model Alignment**: Entity fields (`platform`, `content`, `scheduledAt`, `status`, `createdAt`) map directly to the frontend `CalendarPage` event shape.
- **Bean Validation on DTOs**:
  - `platform`: `@NotBlank` with `@Pattern(regexp = "Twitter|Instagram|LinkedIn|Facebook")`
  - `content`: `@NotBlank` with `@Size(max = 2200)`
  - `scheduledAt`: `@NotNull`
- **Standardized Response Envelope**: All API interactions return `ApiResponse<T>` containing `success`, `message`, `data`, and `timestamp`.
- **Business Rule Enforcement**: `PostService` rejects any post with a `scheduledAt` value in the past.
- **CORS Configuration**: Global `CorsConfig` permits `localhost:5173` and `localhost:3000`, exposes `X-Correlation-ID` header.
- **Platform Filter Query**: `PostRepository.findByPlatformIgnoreCase(String platform)` enables filtered calendar feed per social platform.

### Experiment 2.1.2: Global Exception Handling and Structured Logging

- **Centralized Error Dispatching (`GlobalExceptionHandler`)**: `@RestControllerAdvice` intercepts three exception types:
  - `ResourceNotFoundException` → `404 Not Found` with descriptive message
  - `MethodArgumentNotValidException` → `400 Bad Request` with field-level violation map
  - `Exception` → `500 Internal Server Error` without leaking stack traces

- **MDC-Based Request Tracing (`CorrelationIdFilter`)**:
  - Runs at `@Order(1)` before all controllers.
  - Reads `X-Correlation-ID` from request headers. Generates a `UUID` if none is provided.
  - Injects ID into SLF4J MDC so every log statement in that thread is tagged with it.
  - Echoes the ID back via the `X-Correlation-ID` response header.
  - Clears MDC in a `finally` block to prevent thread-pool context leakage.

### Spring Profiles

Environment-specific configuration is managed via Spring Profiles, eliminating the need to modify source code between environments:

| Setting | `dev` Profile | `prod` Profile |
|---|---|---|
| `spring.jpa.hibernate.ddl-auto` | `create-drop` | `update` |
| `spring.jpa.show-sql` | `true` | `false` |
| `spring.h2.console.enabled` | `true` | `false` |
| Logging Level (`com.example.demo`) | `DEBUG` | `INFO` |

The active profile defaults to `dev`. To switch to `prod`:
```bash
docker run -d -p 8080:8080 -e "SPRING_PROFILES_ACTIVE=prod" --name postapi spring-boot-lab
```

Verify the active profile at runtime:
```
GET http://localhost:8080/api/profile
```

### File-Based Logging

Logging is configured via `logback-spring.xml`. Terminal console output is suppressed entirely. All log lines are written to `logs/application.log` in the format:

```
2026-09-21 14:48:00 [X-Correlation-ID] INFO  c.e.d.controller.PostController - Fetching all posts
```

Rolling policy:
- Files rotate when they reach **10MB** or at midnight daily.
- Archive file naming: `logs/application-%d{yyyy-MM-dd}.%i.log`
- Retains up to **30 days** of history with a total cap of **1GB**.

To mount the log file directly on the host machine:
```bash
docker run -d -p 8080:8080 -v "${PWD}/logs:/app/logs" --name postapi spring-boot-lab
```

Log file location on host:
```
spring-boot-lab-main/spring-boot-lab-main/logs/application.log
```

### Execution Instructions via Docker

All commands must be run from within `spring-boot-lab-main/spring-boot-lab-main/`:

```bash
cd "spring-boot-lab-main/spring-boot-lab-main"
```

1. **Remove existing container** (if any):
   ```bash
   docker rm -f postapi
   ```

2. **Build Docker image**:
   ```bash
   docker build -t spring-boot-lab .
   ```

3. **Launch container** (with log volume mount):
   ```bash
   docker run -d -p 8080:8080 -v "${PWD}/logs:/app/logs" --name postapi spring-boot-lab
   ```

4. **Verify container is running**:
   ```bash
   docker ps
   ```

5. **View log file on host**:
   ```bash
   Get-Content .\logs\application.log -Tail 20     # PowerShell
   tail -f logs/application.log                     # Unix/Mac
   ```

6. **Stop and remove container**:
   ```bash
   docker rm -f postapi
   ```

---

## API Specification and Endpoints

Base URL: `http://localhost:8080`

| HTTP Method | Endpoint | Description | Request Body | Response Status |
|---|---|---|---|---|
| `GET` | `/api/health` | Container health probe | None | `200 OK` |
| `GET` | `/api/profile` | Active Spring profile inspection | None | `200 OK` |
| `GET` | `/api/posts` | Retrieve all scheduled posts | None | `200 OK` |
| `GET` | `/api/posts/{id}` | Retrieve individual post by ID | None | `200 OK` / `404 Not Found` |
| `GET` | `/api/posts/platform/{platform}` | Filter posts by social platform | None | `200 OK` |
| `POST` | `/api/posts` | Schedule a new post | `PostRequestDto` | `201 Created` / `400 Bad Request` |
| `PUT` | `/api/posts/{id}` | Update a post (reschedule) | `PostRequestDto` | `200 OK` / `404 Not Found` |
| `DELETE` | `/api/posts/{id}` | Delete a scheduled post | None | `200 OK` / `404 Not Found` |

### Request Body: `PostRequestDto`

```json
{
  "platform": "Twitter",
  "content": "Deploying with Spring Boot and Docker.",
  "scheduledAt": "2026-12-01T10:00:00",
  "status": "scheduled"
}
```

Platform must be one of: `Twitter`, `Instagram`, `LinkedIn`, `Facebook` (exact casing). `scheduledAt` must be a future ISO datetime without timezone suffix. `status` is optional and defaults to `scheduled`.

### Response Envelope: `ApiResponse<T>`

All endpoints return a consistent envelope:

```json
{
  "success": true,
  "message": "Post scheduled successfully",
  "data": {
    "id": 1,
    "platform": "Twitter",
    "content": "Deploying with Spring Boot and Docker.",
    "scheduledAt": "2026-12-01T10:00:00",
    "status": "scheduled",
    "createdAt": "2026-09-21T14:30:00"
  },
  "timestamp": "2026-09-21T14:30:00"
}
```

### Validation Failure Response (`400 Bad Request`)

```json
{
  "success": true,
  "message": "Validation failed",
  "data": {
    "platform": "Platform must be one of: Twitter, Instagram, LinkedIn, Facebook",
    "content": "Content cannot be empty"
  }
}
```

---

## End-to-End Request and Response Lifecycle

```
[Client: POST /api/posts  +  Header: X-Correlation-ID: MY-TRACE-001]
               |
               v
  [CorrelationIdFilter  @Order(1)]
     |-- Reads: "MY-TRACE-001" from request header
     |-- Injects into SLF4J MDC: MDC.put("correlationId", "MY-TRACE-001")
     |-- Sets response header: X-Correlation-ID: MY-TRACE-001
               |
               v
  [DispatcherServlet]
     |-- Routes to PostController.createPost()
               |
               v
  [Bean Validation Engine  (@Valid)]
     |-- Validates platform, content, scheduledAt constraints
     |-- Passes  --> Hands DTO to PostService
     |-- Fails   --> Throws MethodArgumentNotValidException
                         --> GlobalExceptionHandler returns 400
               |
               v
  [PostService]
     |-- Checks scheduledAt is not in the past
     |-- Fails  --> throws ResourceNotFoundException
                       --> GlobalExceptionHandler returns 404
     |-- Maps PostRequestDto to Post entity
               |
               v
  [PostRepository  (JPA)]
     |-- Executes INSERT into H2
     |-- Returns persisted Post entity
               |
               v
  [ApiResponse.success("Post scheduled successfully", postResponseDto)]
               |
               v
  [CorrelationIdFilter  finally block]
     |-- MDC.remove("correlationId")   (thread-pool safety)
               |
               v
[Client receives: 201 Created
 Body:   { success: true, message: "Post scheduled successfully", data: {...} }
 Header: X-Correlation-ID: MY-TRACE-001
 Logs:   2026-09-21 14:30:00 [MY-TRACE-001] INFO PostController - Creating post: platform=Twitter]
```

---

## Verification and Testing Guide

### Frontend Verification

| Test | Steps | Expected |
|---|---|---|
| Multi-platform save | Select Twitter + LinkedIn, type content, click Save | Two separate cards appear on Drafts page |
| Progress rings | Select Twitter, type 260 characters | Ring turns amber; at 280 turns red |
| Quick toolbar | Click a hashtag pill | Tag appended to textarea content |
| Copy to clipboard | Type content, click Copy | Browser clipboard matches textarea |
| Clear with confirm | Click Clear, then Confirm | Content cleared, toast fires |
| Keyboard shortcut | Type content, press Ctrl+Enter | Draft saved, navigates to Drafts |
| Toast notification | Save any draft | Green slide-in toast appears bottom-right |
| Dark/light theme | Click sun/moon icon in navbar | Theme persists on page reload |

### Backend Verification

| Test | Method + URL | Expected |
|---|---|---|
| Health probe | `GET /api/health` | `Spring Boot environment is running inside Docker!` |
| Profile inspection | `GET /api/profile` | JSON with `activeProfiles: ["dev"]` |
| Create post | `POST /api/posts` with valid body | `201 Created` with `ApiResponse<PostResponseDto>` |
| Get all posts | `GET /api/posts` | Array of all persisted posts |
| Platform filter | `GET /api/posts/platform/Twitter` | Only Twitter posts returned |
| Validation failure | `POST /api/posts` with `"platform": "TikTok"` | `400` with field violation map |
| Not found | `GET /api/posts/99999` | `404` with `ResourceNotFoundException` message |
| Past date rejection | `POST /api/posts` with `scheduledAt` in 2020 | `404` from past-date guard in PostService |
| Custom trace header | Any request with `X-Correlation-ID: MY-TRACE` | Response echoes `MY-TRACE` in `X-Correlation-ID` |
| Log file | Send request, then read `logs/application.log` | Log line contains `[MY-TRACE]` prefix |

---

## Technology Stack Summary

| Domain | Layer / Tool | Specification |
|---|---|---|
| Frontend | UI Library | React 18 |
| Frontend | Language | TypeScript 5 |
| Frontend | Bundler | Vite 6 |
| Frontend | State Management | Redux Toolkit |
| Frontend | Navigation | React Router DOM |
| Frontend | Notifications | Custom ToastContext (React Context API) |
| Frontend | Animations | CSS Keyframes (`toast-slide-in`, `toast-progress`) |
| Backend | Runtime | Java Virtual Machine (JDK 17) |
| Backend | Framework | Spring Boot 3.2.5 |
| Backend | Persistence | Spring Data JPA, Hibernate |
| Backend | Database | H2 In-Memory Engine |
| Backend | Validation | Jakarta Bean Validation |
| Backend | Logging | SLF4J, Logback, MDC, Rolling File Appender |
| Backend | Profiling | Spring Profiles (`dev`, `prod`) |
| Backend | Request Tracing | Servlet Filter + MDC Correlation ID |
| Container | Virtualization | Docker Multi-Stage Build (Maven 3.9.6 + JRE 17 Alpine) |
