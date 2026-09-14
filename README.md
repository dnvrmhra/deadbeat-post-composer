# Deadbeat Post Composer

Full-stack social media scheduling and post management application comprising a modern React TypeScript frontend and a containerized Spring Boot REST backend.

---

## Table of Contents

- [System Overview](#system-overview)
- [System Architecture and Interaction Flow](#system-architecture-and-interaction-flow)
- [Directory Structure and Organization](#directory-structure-and-organization)
  - [Explanation of Nested Directories](#explanation-of-nested-directories)
- [Frontend Architecture](#frontend-architecture)
  - [Core Features](#core-features)
  - [Execution Instructions](#execution-instructions)
- [Backend Architecture](#backend-architecture)
  - [Experiment 2.1.1: RESTful APIs with Spring Boot](#experiment-211-restful-apis-with-spring-boot)
  - [Experiment 2.1.2: Global Exception Handling and Structured Logging](#experiment-212-global-exception-handling-and-structured-logging)
  - [Execution Instructions via Docker](#execution-instructions-via-docker)
- [API Specification and Endpoints](#api-specification-and-endpoints)
- [End-to-End Request and Response Lifecycle](#end-to-end-request-and-response-lifecycle)
- [Verification and Testing Guide](#verification-and-testing-guide)
- [Technology Stack Summary](#technology-stack-summary)

---

## System Overview

The system provides a decoupled, scalable architecture designed to support content composition across multiple social networks:

1. **Client Layer (Frontend)**: React 18 single-page application built with TypeScript, Redux Toolkit, and Vite. Handles cross-platform content drafting, validation limits, date/time scheduling, and real-time live preview.
2. **Server Layer (Backend)**: Spring Boot 3 application executing inside a Docker container. Provides a layered REST API (Controller, Service, Repository) backed by an in-memory H2 database, Bean Validation, centralized exception handling via `@RestControllerAdvice`, and distributed request tracing via Mapped Diagnostic Context (MDC) correlation IDs.

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
|  - Role-based routing & auth       |          |  +-----------------------------------+  |
|                                    |          |                   |                     |
|  Direct API calls via fetch() /    |          |  +-----------------------------------+  |
|  Axios with CORS compatibility ----+--------> |  |         DispatcherServlet         |  |
+------------------------------------+          |  +-----------------------------------+  |
                                                |                   |                     |
                                                |  +-----------------------------------+  |
                                                |  |    PostController (REST API)      |  |
                                                |  |    @Valid Request DTO validation  |  |
                                                |  +-----------------------------------+  |
                                                |         |                     |         |
                                                |         v                     v         |
                                                |  +---------------+    +--------------+  |
                                                |  |  PostService  |    | GlobalError  |  |
                                                |  | Business Rule |    | Handler      |  |
                                                |  +---------------+    | Advice       |  |
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
+-----------------------------------------------------------------------------------------+
```

---

## Directory Structure and Organization

```
post-composer/
|-- index.html
|-- package.json
|-- tsconfig.json
|-- vite.config.ts
|-- README.md                               <-- Root full-stack documentation
|
|-- public/
|   |-- _redirects                          <-- Netlify SPA client routing rules
|   +-- assets/
|
|-- src/                                    <-- React application root
|   |-- App.tsx
|   |-- main.tsx
|   |-- components/                         <-- UI components (Preview, DateTimePicker, etc.)
|   |-- features/posts/                     <-- Redux state slices and selectors
|   |-- pages/                              <-- Route pages (Composer, Drafts, Calendar)
|   +-- styles/
|
|-- backend/                                <-- Primary Spring Boot application template
|   |-- pom.xml
|   |-- README.md
|   +-- src/
|
+-- spring-boot-lab-main/                   <-- Lab repository root folder
    +-- spring-boot-lab-main/               <-- Target backend workspace (Docker + Source)
        |-- Dockerfile                      <-- Multi-stage build script
        |-- pom.xml                         <-- Maven configuration for Exp 2.1.1 & 2.1.2
        |-- README.md                       <-- Specialized backend technical manual
        +-- src/
            |-- main/java/com/example/demo/
            |   |-- Application.java
            |   |-- config/CorsConfig.java
            |   |-- controller/PostController.java
            |   |-- dto/
            |   |-- exception/GlobalExceptionHandler.java
            |   |-- filter/CorrelationIdFilter.java
            |   |-- model/Post.java
            |   |-- repository/PostRepository.java
            |   +-- service/PostService.java
            +-- main/resources/application.properties
```

### Explanation of Nested Directories

The workspace contains `spring-boot-lab-main/spring-boot-lab-main/`. This nesting occurs due to the extraction process of standard GitHub release zip archives:
1. GitHub packages repositories into a root-level folder named after the repository and branch name (e.g., `spring-boot-lab-main.zip` contains an internal folder `spring-boot-lab-main/`).
2. When extracted into an existing folder also named `spring-boot-lab-main`, a two-tier nested path is produced (`spring-boot-lab-main/spring-boot-lab-main/`).
3. The active backend configuration, `Dockerfile`, Maven definitions, and Java source files reside inside `spring-boot-lab-main/spring-boot-lab-main/`. Docker commands must be run from within that inner directory.

---

## Frontend Architecture

### Core Features

- **Multi-Platform Cross-Posting**: Allows selection of one or multiple target platforms (Twitter, Instagram, LinkedIn, Facebook). When saved, a distinct draft is generated for each selected platform with individual validation bounds.
- **Dynamic Platform Preview Tabs**: Interactive preview pane mirroring the user interface of the chosen platform, with live toggle buttons to view layout variations.
- **Hashtags and Mentions Highlighting**: Regex parsing engine that detects `#hashtag` and `@mention` tokens and styles them in branded blue.
- **Custom DateTime Scheduling**: Custom calendar grid and 24-hour time selector replacing standard HTML inputs, fully synced with the drafts engine and calendar view.
- **Client Routing Redirection**: Production-ready `public/_redirects` to prevent 404 errors during client page reloads on static hosts such as Netlify.

### Execution Instructions

1. Install dependencies:
   ```bash
   npm install
   ```

2. Launch development server:
   ```bash
   npm run dev
   ```
   Server defaults to: `http://localhost:5173`

3. Production compilation:
   ```bash
   npm run build
   ```

---

## Backend Architecture

The backend implements the academic requirements of Experiments 2.1.1 and 2.1.2.

### Experiment 2.1.1: RESTful APIs with Spring Boot

- **Separation of Concerns**: Strict boundary division between Controller, Service, and Repository layers.
- **Bean Validation**: Enforces integrity constraints (`@NotBlank`, `@Size`, `@NotNull`) on inbound Data Transfer Objects (DTOs) prior to method execution.
- **Standardized Response Envelope**: All API interactions return an `ApiResponse<T>` envelope containing `success`, `message`, `data`, and `timestamp`.
- **CORS Management**: Global configuration exposing endpoints to frontend origins while granting access to the `X-Correlation-ID` header.

### Experiment 2.1.2: Global Exception Handling and Structured Logging

- **Centralized Error Dispatching**: `@RestControllerAdvice` intercepts domain and validation errors, precluding redundant `try-catch` implementations in controllers.
- **Request Tracing via Correlation IDs**: Custom servlet filter intercepts incoming traffic, resolves or constructs a unique UUID, attaches it to the Logback Mapped Diagnostic Context (MDC), and injects it into outgoing response headers.
- **Structured Log Formatting**: Console output configuration that prefixes every log line with `[correlationId]`, establishing clear request lifecycle visibility.

### Execution Instructions via Docker

All commands must be executed within `spring-boot-lab-main/spring-boot-lab-main`:

```bash
cd "spring-boot-lab-main/spring-boot-lab-main"
```

1. **Build the Docker Image**:
   ```bash
   docker build -t spring-boot-lab .
   ```

2. **Launch the Container**:
   ```bash
   docker run -d -p 8080:8080 --name postapi spring-boot-lab
   ```

3. **Inspect Application Logs**:
   ```bash
   docker logs -f postapi
   ```

4. **Stop and Remove Container**:
   ```bash
   docker rm -f postapi
   ```

---

## API Specification and Endpoints

Base URL: `http://localhost:8080`

| HTTP Method | Endpoint | Description | Request Body | Success Status |
|---|---|---|---|---|
| `GET` | `/api/health` | Container health probe | None | `200 OK` |
| `GET` | `/api/posts` | Retrieve collection of all posts | None | `200 OK` |
| `GET` | `/api/posts/{id}` | Retrieve individual post by ID | None | `200 OK` / `404 Not Found` |
| `POST` | `/api/posts` | Persist a new post resource | `PostRequestDto` | `201 Created` / `400 Bad Request` |
| `DELETE` | `/api/posts/{id}` | Remove post resource by ID | None | `200 OK` / `404 Not Found` |

### Sample Payloads

#### Post Creation (`POST /api/posts`)

Request:
```json
{
  "title": "System Architecture Update",
  "content": "Deploying Spring Boot microservices with Docker containerization.",
  "author": "SystemAdmin"
}
```

Response (`201 Created`):
```json
{
  "success": true,
  "message": "Post created successfully",
  "data": {
    "id": 1,
    "title": "System Architecture Update",
    "content": "Deploying Spring Boot microservices with Docker containerization.",
    "author": "SystemAdmin",
    "createdAt": "2026-09-14T14:30:00"
  },
  "timestamp": "2026-09-14T14:30:00"
}
```

#### Validation Failure (`POST /api/posts` with blank fields)

Response (`400 Bad Request`):
```json
{
  "success": true,
  "message": "Validation failed",
  "data": {
    "title": "Title is required",
    "content": "Content cannot be empty",
    "author": "Author is required"
  },
  "timestamp": "2026-09-14T14:30:00"
}
```

---

## End-to-End Request and Response Lifecycle

```
[Client Request: POST /api/posts]
               |
               v
  [CorrelationIdFilter]
     |-- Generates: "a7e2b1c9-84f3-4d2a"
     |-- Injects into MDC
     |-- Injects into HTTP Response Header "X-Correlation-ID"
               |
               v
  [DispatcherServlet]
     |-- Maps route to PostController.createPost()
               |
               v
  [Validation Engine (@Valid)]
     |-- Verifies title, content, author constraints
     |-- Passes: Hands off DTO to PostService
     |-- Fails:  Throws MethodArgumentNotValidException
               |
               v
  [PostService & PostRepository]
     |-- Maps DTO to JPA Entity
     |-- Commits transaction to H2 database
               |
               v
  [ApiResponse Envelope Builder]
     |-- Builds standard payload: { success: true, message: ..., data: ... }
               |
               v
  [CorrelationIdFilter cleanup]
     |-- Executes MDC.remove() to avoid thread pool context pollution
               |
               v
[Client receives 201 Created + Header: X-Correlation-ID: a7e2b1c9-84f3-4d2a]
```

---

## Verification and Testing Guide

### Experiment 2.1.1 Verification

1. **Verify CRUD Operability**: Execute `POST /api/posts` followed by `GET /api/posts`. Confirm that persisted records reflect supplied request parameters.
2. **Verify Bean Validation Constraints**: Submit an invalid payload (`{ "title": "" }`). Confirm reception of HTTP `400 Bad Request` containing explicit property violation maps.
3. **Verify Standard Envelope**: Validate that all operational outputs adhere strictly to the `ApiResponse<T>` contract.

### Experiment 2.1.2 Verification

1. **Verify Distributed Trace Header**: Inspect the HTTP response headers using Postman or browser developer tools. Ensure `X-Correlation-ID` is present with a valid UUID.
2. **Verify Context Propagation in Logs**: Run `docker logs postapi`. Confirm that log rows display matching correlation IDs inside square brackets (e.g., `[a7e2b1c9-84f3-4d2a] INFO ...`).
3. **Verify Centralized 404 Dispatching**: Execute `GET /api/posts/9999`. Ensure a uniform JSON error payload is produced rather than an unformatted HTML error page.

---

## Technology Stack Summary

| Domain | Layer / Tool | Specification |
|---|---|---|
| Frontend | UI Library | React 18 |
| Frontend | Programming Language | TypeScript 5 |
| Frontend | Bundler and Tooling | Vite 6 |
| Frontend | State Management | Redux Toolkit |
| Frontend | Navigation | React Router DOM |
| Backend | Runtime Platform | Java Virtual Machine (JDK 17) |
| Backend | Framework | Spring Boot 3.2.5 |
| Backend | Persistence | Spring Data JPA, Hibernate |
| Backend | Database | H2 In-Memory Engine |
| Backend | Input Validation | Jakarta Bean Validation |
| Backend | Diagnostics | SLF4J, Logback, MDC |
| Container | Virtualization | Docker Multi-Stage Engine (Maven 3.9.6 + JRE 17 Alpine) |
