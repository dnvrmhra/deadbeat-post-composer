# Spring Boot Lab

**Experiments 2.1.1 and 2.1.2**
Backend REST API implementation using Spring Boot, deployed via Docker.

---

## Table of Contents

- [Overview](#overview)
- [Experiments](#experiments)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Technology Stack](#technology-stack)
- [Getting Started](#getting-started)
- [API Reference](#api-reference)
- [Request and Response Format](#request-and-response-format)
- [Exception Handling](#exception-handling)
- [Correlation ID and Logging](#correlation-id-and-logging)
- [Docker](#docker)
- [Verification Guide](#verification-guide)
- [Core Concepts](#core-concepts)

---

## Overview

This project implements a RESTful backend system for managing posts using Spring Boot.
It demonstrates two fundamental backend engineering experiments:

- **Experiment 2.1.1** — REST API design, layered architecture, Bean Validation, standardized responses, and CORS
- **Experiment 2.1.2** — Global exception handling using `@ControllerAdvice`, request tracing using Correlation IDs with MDC, and structured logging via filters

The application uses an embedded H2 in-memory database and is containerized using Docker for portable, environment-independent deployment.

---

## Experiments

### Experiment 2.1.1 — RESTful APIs with Spring Boot

| Field | Details |
|---|---|
| **Aim** | Design and implement RESTful APIs using Spring Boot with proper validation, standardized responses, and scalable architecture |
| **COs Mapped** | CO1 - BT1, CO3 - BT3 |

**Objectives:**
- Understand REST API design principles
- Implement CRUD APIs using Spring Boot
- Enforce consistent request-response structures
- Apply validation using Bean Validation annotations
- Enable secure cross-origin communication via CORS

**Conceptual Focus:**
- REST API design principles
- Spring Boot layered architecture (Controller, Service, Repository)
- Bean Validation (`@NotBlank`, `@Size`)
- Standardized API response structure
- CORS configuration

---

### Experiment 2.1.2 — Global Exception Handling and Structured Logging

| Field | Details |
|---|---|
| **Aim** | Implement global exception handling and structured logging for building robust and observable backend systems |
| **COs Mapped** | CO3 - BT3 |

**Objectives:**
- Handle exceptions centrally using `@ControllerAdvice`
- Implement logging mechanisms for request tracking
- Use correlation IDs for tracing requests across the system
- Improve system observability and debugging capability

**Conceptual Focus:**
- Global exception handling with `@RestControllerAdvice`
- Servlet Filters as middleware interceptors
- Structured logging via SLF4J and Logback
- Mapped Diagnostic Context (MDC) for per-request correlation IDs
- Consistent error response format

---

## Architecture

### Layered Architecture

```
+----------------------------------------------------------+
|                        CLIENT                            |
|              Postman / Browser / React App               |
+----------------------------------------------------------+
                           |
                    HTTP Request
                           |
+----------------------------------------------------------+
|                     DOCKER CONTAINER                     |
|                                                          |
|  +----------------------------------------------------+  |
|  |              CorrelationIdFilter                   |  |
|  |  Assigns UUID to every request via MDC            |  |
|  |  Writes X-Correlation-ID to response header       |  |
|  +----------------------------------------------------+  |
|                           |                              |
|  +----------------------------------------------------+  |
|  |             DispatcherServlet                      |  |
|  |  Spring MVC front controller — routes requests    |  |
|  +----------------------------------------------------+  |
|                           |                              |
|  +----------------------------------------------------+  |
|  |          CONTROLLER LAYER (@RestController)        |  |
|  |  PostController — handles HTTP, returns responses  |  |
|  +----------------------------------------------------+  |
|                           |                              |
|  +----------------------------------------------------+  |
|  |           SERVICE LAYER (@Service)                 |  |
|  |  PostService — contains all business logic        |  |
|  +----------------------------------------------------+  |
|                           |                              |
|  +----------------------------------------------------+  |
|  |         REPOSITORY LAYER (@Repository)             |  |
|  |  PostRepository — data access via JpaRepository   |  |
|  +----------------------------------------------------+  |
|                           |                              |
|  +----------------------------------------------------+  |
|  |          H2 IN-MEMORY DATABASE                     |  |
|  |  Embedded, auto-configured, resets on restart     |  |
|  +----------------------------------------------------+  |
|                                                          |
|  +----------------------------------------------------+  |
|  |       GlobalExceptionHandler (@RestControllerAdvice)|  |
|  |  Catches all exceptions — returns structured JSON  |  |
|  +----------------------------------------------------+  |
+----------------------------------------------------------+
```

---

### Request Flow

```
Client sends HTTP request
          |
          v
Embedded Tomcat receives request on port 8080
          |
          v
CorrelationIdFilter (Order 1)
  - Reads X-Correlation-ID from request header
  - Generates UUID if not present
  - Stores ID in MDC (Mapped Diagnostic Context)
  - Writes ID to response header
          |
          v
DispatcherServlet
  - Routes request to correct controller method
          |
          v
PostController
  - @Valid triggers Bean Validation on @RequestBody
  - If validation fails, MethodArgumentNotValidException is thrown
  - If valid, delegates to PostService
          |
          v
PostService
  - Executes business logic
  - Throws ResourceNotFoundException if resource not found
          |
          v
PostRepository
  - Performs CRUD operation on H2 database
          |
          v
ApiResponse wrapper applied to result
          |
          v
JSON response returned to client
          |
          v
GlobalExceptionHandler (if any exception was thrown)
  - Catches ResourceNotFoundException   -> 404 Not Found
  - Catches MethodArgumentNotValidException -> 400 Bad Request
  - Catches Exception (catch-all)       -> 500 Internal Server Error
```

---

### Exception Handling Flow

```
Request arrives at Controller
          |
          v
Does @Valid pass?
  |               |
  YES             NO
  |               |
  v               v
Service     MethodArgumentNotValidException
  |               |
  v               v
Does resource  GlobalExceptionHandler
exist?         returns 400 Bad Request
  |               with field-level errors
  YES   NO
  |      |
  v      v
Result  ResourceNotFoundException
  |      |
  v      v
200 OK  GlobalExceptionHandler
        returns 404 Not Found

Any unhandled exception at any layer
          |
          v
GlobalExceptionHandler catch-all
returns 500 Internal Server Error
```

---

### Docker Build Flow

```
Source Code + Dockerfile
          |
          v
Stage 1 — Build (maven:3.9.6-eclipse-temurin-17)
  - COPY pom.xml
  - RUN mvn dependency:go-offline   <- cached layer, only re-runs if pom.xml changes
  - COPY src/
  - RUN mvn clean package -DskipTests
  - Output: target/demo-0.0.1-SNAPSHOT.jar
          |
          v
Stage 2 — Runtime (eclipse-temurin:17-jre-alpine)
  - COPY --from=build target/*.jar app.jar
  - EXPOSE 8080
  - ENTRYPOINT ["java", "-jar", "app.jar"]
  - Output: lightweight image (~100MB vs ~500MB with full JDK)
          |
          v
docker build -t spring-boot-lab .
          |
          v
docker run -d -p 8080:8080 --name postapi spring-boot-lab
          |
          v
Application running at localhost:8080
```

---

## Project Structure

```
spring-boot-lab-main/
|
|-- Dockerfile                                      Docker multi-stage build
|-- pom.xml                                         Maven build configuration
|-- mvnw                                            Maven wrapper (Unix)
|-- mvnw.cmd                                        Maven wrapper (Windows)
|-- README.md
|
+-- src/
    +-- main/
    |   +-- java/com/example/demo/
    |   |   |
    |   |   |-- Application.java                   Entry point
    |   |   |
    |   |   +-- config/
    |   |   |   +-- CorsConfig.java                Exp 2.1.1 - CORS
    |   |   |
    |   |   +-- controller/
    |   |   |   +-- PostController.java            Exp 2.1.1 - REST endpoints
    |   |   |
    |   |   +-- dto/
    |   |   |   |-- ApiResponse.java               Exp 2.1.1 - Standardized response
    |   |   |   |-- PostRequestDto.java            Exp 2.1.1 - Request body + validation
    |   |   |   +-- PostResponseDto.java           Exp 2.1.1 - Response body shape
    |   |   |
    |   |   +-- exception/
    |   |   |   |-- GlobalExceptionHandler.java    Exp 2.1.2 - @RestControllerAdvice
    |   |   |   +-- ResourceNotFoundException.java Exp 2.1.2 - Custom 404 exception
    |   |   |
    |   |   +-- filter/
    |   |   |   +-- CorrelationIdFilter.java       Exp 2.1.2 - MDC + request tracing
    |   |   |
    |   |   +-- model/
    |   |   |   +-- Post.java                      Exp 2.1.1 - JPA entity
    |   |   |
    |   |   +-- repository/
    |   |   |   +-- PostRepository.java            Exp 2.1.1 - JpaRepository
    |   |   |
    |   |   +-- service/
    |   |       +-- PostService.java               Exp 2.1.1 - Business logic
    |   |
    |   +-- resources/
    |       +-- application.properties             Server config, H2, logging
    |
    +-- test/
        +-- java/com/example/demo/
            +-- DemoApplicationTests.java          Context load smoke test
```

---

## Technology Stack

| Component | Technology | Version |
|---|---|---|
| Language | Java | 17 |
| Framework | Spring Boot | 3.2.5 |
| Web | Spring MVC (`spring-boot-starter-web`) | 3.2.5 |
| Data Access | Spring Data JPA | 3.2.5 |
| Database | H2 In-Memory | Runtime |
| Validation | Jakarta Bean Validation | via `spring-boot-starter-validation` |
| Logging | SLF4J + Logback | Bundled with Spring Boot |
| Build Tool | Maven | 3.9.6 |
| Containerization | Docker | Multi-stage build |
| Base Image (build) | `maven:3.9.6-eclipse-temurin-17` | - |
| Base Image (runtime) | `eclipse-temurin:17-jre-alpine` | - |

---

## Getting Started

### Prerequisites

- Docker Desktop installed and running
- OR: Java 17+ and IntelliJ IDEA (for local run without Docker)

---

### Option 1 — Docker (Recommended)

**1. Build the Docker image**

Navigate to the project root (where `Dockerfile` is located):

```powershell
cd "C:\Users\danme\OneDrive\Desktop\Full Stack\post-composer\spring-boot-lab-main\spring-boot-lab-main"
```

Build the image:

```
docker build -t spring-boot-lab .
```

This compiles the Java source using Maven inside a container and produces a lightweight runtime image.
First build takes 3 to 5 minutes as Maven downloads all dependencies.

**2. Run the container**

```
docker run -d -p 8080:8080 --name postapi spring-boot-lab
```

**3. Verify startup**

```
docker logs postapi
```

Look for:
```
Started Application in X.XXX seconds (process running for X.XXX)
```

**4. Test the health endpoint**

```
http://localhost:8080/api/health
```

Expected response:
```
Spring Boot environment is running inside Docker!
```

---

**If the container name already exists:**

```
docker rm -f postapi
docker run -d -p 8080:8080 --name postapi spring-boot-lab
```

---

### Option 2 — IntelliJ IDEA

1. Open IntelliJ IDEA
2. Select `File` then `Open` and navigate to this folder
3. IntelliJ detects `pom.xml` and begins downloading Maven dependencies automatically
4. If prompted for SDK, go to `File` then `Project Structure` then `SDK` and select or download JDK 17
5. Open `Application.java` and click the green Run button next to `main()`
6. Server starts at `http://localhost:8080`

---

### Docker Command Reference

| Command | Purpose |
|---|---|
| `docker build -t spring-boot-lab .` | Build image from Dockerfile |
| `docker run -d -p 8080:8080 --name postapi spring-boot-lab` | Create and start container |
| `docker ps` | List running containers |
| `docker logs postapi` | View application logs |
| `docker logs -f postapi` | Stream live logs |
| `docker stop postapi` | Stop the container |
| `docker start postapi` | Restart a stopped container |
| `docker rm -f postapi` | Force stop and remove container |
| `docker rmi spring-boot-lab` | Delete the image |
| `docker rm -f postapi && docker build -t spring-boot-lab . && docker run -d -p 8080:8080 --name postapi spring-boot-lab` | Full rebuild and restart |

---

## API Reference

**Base URL:** `http://localhost:8080`

| Method | Endpoint | Description | Success Status |
|---|---|---|---|
| `GET` | `/api/health` | Health check — confirms app is running | `200 OK` |
| `GET` | `/api/posts` | Retrieve all posts | `200 OK` |
| `GET` | `/api/posts/{id}` | Retrieve a single post by ID | `200 OK` |
| `POST` | `/api/posts` | Create a new post | `201 Created` |
| `DELETE` | `/api/posts/{id}` | Delete a post by ID | `200 OK` |

---

## Request and Response Format

### Standard Request Body (POST /api/posts)

```json
{
    "title": "My First Post",
    "content": "Spring Boot is running inside Docker.",
    "author": "Deadbeat"
}
```

**Validation Rules (Bean Validation — Experiment 2.1.1):**

| Field | Constraint | Rule |
|---|---|---|
| `title` | `@NotBlank` | Must not be blank |
| `title` | `@Size(min=3, max=100)` | Must be between 3 and 100 characters |
| `content` | `@NotBlank` | Must not be blank |
| `author` | `@NotBlank` | Must not be blank |

---

### Standard Success Response

All successful responses follow this structure (ApiResponse wrapper — Experiment 2.1.1):

```json
{
    "success": true,
    "message": "Post created successfully",
    "data": {
        "id": 1,
        "title": "My First Post",
        "content": "Spring Boot is running inside Docker.",
        "author": "Deadbeat",
        "createdAt": "2026-09-14T14:00:00"
    },
    "timestamp": "2026-09-14T14:00:00"
}
```

---

### GET All Posts

**Request:**
```
GET http://localhost:8080/api/posts
```

**Response (200 OK):**
```json
{
    "success": true,
    "message": "Posts retrieved successfully",
    "data": [
        {
            "id": 1,
            "title": "My First Post",
            "content": "Spring Boot is running inside Docker.",
            "author": "Deadbeat",
            "createdAt": "2026-09-14T14:00:00"
        }
    ],
    "timestamp": "2026-09-14T14:00:00"
}
```

---

### GET Post by ID

**Request:**
```
GET http://localhost:8080/api/posts/1
```

**Response (200 OK):**
```json
{
    "success": true,
    "message": "Post retrieved successfully",
    "data": {
        "id": 1,
        "title": "My First Post",
        "content": "Spring Boot is running inside Docker.",
        "author": "Deadbeat",
        "createdAt": "2026-09-14T14:00:00"
    },
    "timestamp": "2026-09-14T14:00:00"
}
```

---

### DELETE Post

**Request:**
```
DELETE http://localhost:8080/api/posts/1
```

**Response (200 OK):**
```json
{
    "success": true,
    "message": "Post deleted successfully",
    "data": null,
    "timestamp": "2026-09-14T14:00:00"
}
```

---

## Exception Handling

All errors are handled centrally by `GlobalExceptionHandler.java` using `@RestControllerAdvice` (Experiment 2.1.2). No try-catch blocks exist in the controller.

---

### 404 Not Found — ResourceNotFoundException

**Request:**
```
GET http://localhost:8080/api/posts/999
```

**Response (404 Not Found):**
```json
{
    "success": false,
    "message": "Post not found with ID: 999",
    "data": null,
    "timestamp": "2026-09-14T14:00:00"
}
```

---

### 400 Bad Request — Bean Validation Failure

**Request:**
```
POST http://localhost:8080/api/posts
Content-Type: application/json

{
    "title": "",
    "content": "",
    "author": ""
}
```

**Response (400 Bad Request):**
```json
{
    "success": true,
    "message": "Validation failed",
    "data": {
        "title": "Title is required",
        "content": "Content cannot be empty",
        "author": "Author is required"
    },
    "timestamp": "2026-09-14T14:00:00"
}
```

The `data` field contains a map of field names to their specific validation error messages.

---

### 500 Internal Server Error — Catch-All

Any unhandled exception returns:

```json
{
    "success": false,
    "message": "An unexpected error occurred: <exception message>",
    "data": null,
    "timestamp": "2026-09-14T14:00:00"
}
```

---

### Exception Handler Mapping

```
Exception Type                         HTTP Status    Handler Method
---------------------------------------------------------------------
ResourceNotFoundException          ->  404            handleNotFound()
MethodArgumentNotValidException    ->  400            handleValidationErrors()
Exception (catch-all)              ->  500            handleGenericException()
```

---

## Correlation ID and Logging

Implemented in `CorrelationIdFilter.java` (Experiment 2.1.2).

### How It Works

```
Incoming request
      |
      v
Read X-Correlation-ID header
      |
      +-- Header present? -- YES --> use provided ID
      |
      +-- Header absent?  -- YES --> generate UUID
      |
      v
Store ID in MDC (Mapped Diagnostic Context)
      |
      v
Write ID to X-Correlation-ID response header
      |
      v
Process request (all log lines for this request include the ID)
      |
      v
Request complete
      |
      v
MDC.remove() -- clears ID to prevent thread-pool leakage
```

---

### Log Output Format

Configured in `application.properties`:

```
logging.pattern.console=%d{yyyy-MM-dd HH:mm:ss} [%X{correlationId}] %-5level %logger{36} - %msg%n
```

Sample log output for a single request:

```
2026-09-14 14:00:01 [a3f7c19b-2d4e-8f01-c2d3-e4f5a6b7c8d9] INFO  c.e.d.controller.PostController - Creating new post with title: My First Post
2026-09-14 14:00:01 [a3f7c19b-2d4e-8f01-c2d3-e4f5a6b7c8d9] INFO  c.e.d.service.PostService - Saving post to database
2026-09-14 14:00:01 [a3f7c19b-2d4e-8f01-c2d3-e4f5a6b7c8d9] INFO  c.e.d.controller.PostController - Post created with ID: 1
```

Every log line for the same request carries the same correlation ID, enabling full lifecycle tracing.

---

### Verifying the Correlation ID in Postman

After sending any request:

1. Click the **Headers** tab in the Postman response panel
2. Locate the following header:

```
X-Correlation-ID    a3f7c19b-2d4e-8f01-c2d3-e4f5a6b7c8d9
```

3. Send the same request again — a new unique ID is generated for each request

---

## Docker

### Dockerfile Explained

```dockerfile
# Stage 1: Build
# Uses Maven with JDK 17 to compile and package the application
FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /app

# Copy pom.xml first — allows Docker to cache the dependency download layer
# This layer only re-runs when pom.xml changes, not on every source code change
COPY pom.xml .
RUN mvn dependency:go-offline -q

# Copy source and build the JAR, skipping tests
COPY src ./src
RUN mvn clean package -DskipTests -q

# Stage 2: Runtime
# Uses a lightweight Alpine JRE — no compiler needed
# Final image is approximately 100MB instead of 500MB with full JDK
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

COPY --from=build /app/target/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
```

### Why Multi-Stage Build

| Aspect | Single Stage | Multi-Stage |
|---|---|---|
| Image size | ~500MB (full JDK + Maven) | ~100MB (JRE only) |
| Security surface | Large | Minimal |
| Build artifacts in image | Yes (source, .class files) | No |
| Production suitability | No | Yes |

---

## Verification Guide

### Verifying Experiment 2.1.1

| Test | Request | Expected Result |
|---|---|---|
| CRUD — Create | `POST /api/posts` with valid body | `201 Created`, post in `data` field |
| CRUD — Read All | `GET /api/posts` | `200 OK`, array in `data` field |
| CRUD — Read One | `GET /api/posts/1` | `200 OK`, single post in `data` field |
| CRUD — Delete | `DELETE /api/posts/1` | `200 OK`, `data: null` |
| Validation | `POST /api/posts` with blank fields | `400`, field errors in `data` map |
| Standardized response | Any request | All responses have `success`, `message`, `data`, `timestamp` |
| CORS | Request from `localhost:5173` | No CORS error, `X-Correlation-ID` header exposed |

---

### Verifying Experiment 2.1.2

| Test | How to Test | Expected Result |
|---|---|---|
| Correlation ID generated | Send any request, check response Headers tab in Postman | `X-Correlation-ID` header present with UUID value |
| Unique ID per request | Send same request twice | Different UUID in each response |
| MDC in logs | `docker logs postapi` after making requests | Correlation ID appears in square brackets in every log line |
| 404 handling | `GET /api/posts/999` | Structured JSON error, not HTML stack trace |
| 400 validation handling | `POST /api/posts` with empty fields | `400` response with per-field error messages in `data` |
| 500 catch-all | Handled internally | Any unhandled exception returns structured JSON |

---

## Core Concepts

### Spring Boot Layered Architecture

| Layer | Annotation | Responsibility |
|---|---|---|
| Controller | `@RestController` | Receives HTTP requests, returns HTTP responses |
| Service | `@Service` | Contains business logic, orchestrates operations |
| Repository | `@Repository` | Interacts with the database |
| Model | `@Entity` | Represents a database table as a Java class |

---

### Key Annotations

| Annotation | Purpose |
|---|---|
| `@SpringBootApplication` | Entry point — enables auto-configuration, component scanning, and configuration |
| `@RestController` | Marks a class as a REST controller — all methods return JSON by default |
| `@RequestMapping` | Maps a URL prefix to a controller class |
| `@GetMapping` | Maps HTTP GET requests to a method |
| `@PostMapping` | Maps HTTP POST requests to a method |
| `@DeleteMapping` | Maps HTTP DELETE requests to a method |
| `@PathVariable` | Binds a URI template variable to a method parameter |
| `@RequestBody` | Deserializes the HTTP request body JSON into a Java object |
| `@Valid` | Triggers Bean Validation on the annotated parameter |
| `@NotBlank` | Field must not be null, empty, or whitespace-only |
| `@Size` | Field length must be within the specified min and max |
| `@RestControllerAdvice` | Marks a class as a global exception handler for all REST controllers |
| `@ExceptionHandler` | Maps a specific exception type to a handler method |
| `@Component` | Registers a class as a Spring-managed bean |
| `@Order` | Specifies the execution order of filters or beans |

---

### Dependency Injection

Spring Boot uses constructor injection to wire dependencies automatically:

```java
@Service
public class PostService {

    private final PostRepository postRepository;

    // Spring provides PostRepository automatically — no manual instantiation
    public PostService(PostRepository postRepository) {
        this.postRepository = postRepository;
    }
}
```

The developer defines what is needed. The Spring IoC container creates and provides the objects.

---

### Inversion of Control (IoC) vs Dependency Injection (DI)

| Concept | Definition |
|---|---|
| IoC | The framework controls the creation and lifecycle of objects, not the developer |
| DI | Objects receive their dependencies from outside rather than creating them internally |
| Relationship | IoC is the principle. DI is the implementation pattern used to achieve it. |

---

### Spring Boot vs Node.js

| Topic | Node.js (Express) | Spring Boot |
|---|---|---|
| Runtime | Node.js | JVM |
| Package manager | npm / package.json | Maven / pom.xml |
| Server startup | `app.listen(3000)` | `SpringApplication.run(...)` |
| Request handling | Route handlers and middleware | Controllers and DispatcherServlet |
| Dependency management | `require()` and manual wiring | Spring IoC container and DI |
| Object creation | Manual `new` calls | Container-managed beans |
| Configuration | `.env` or JSON config files | `application.properties` or `application.yml` |
| Routing | Express Router | `@GetMapping`, `@PostMapping` |
| Business layer | Service functions | `@Service` classes |
| Data access | Prisma, Sequelize, custom queries | Spring Data JPA with `@Repository` |
| Auto-configuration | Not built-in | Built into Spring Boot |
| Exception handling | `app.use((err, req, res, next) => ...)` | `@RestControllerAdvice` |

---

### Maven Build Lifecycle

| Phase | What It Does |
|---|---|
| `clean` | Deletes the `target/` build output directory |
| `compile` | Compiles `.java` source files into `.class` bytecode |
| `test` | Executes unit tests |
| `package` | Bundles compiled code into a `.jar` file |
| `install` | Installs the JAR into the local Maven repository |
| `deploy` | Publishes the JAR to a remote repository |

The Docker build uses:
```
mvn clean package -DskipTests
```

This cleans previous output, compiles, and packages the JAR while skipping tests for faster container builds.

---

### application.properties Reference

```properties
spring.application.name=demo

# Server
server.port=8080

# H2 In-Memory Database
spring.datasource.url=jdbc:h2:mem:testdb;DB_CLOSE_DELAY=-1
spring.datasource.driver-class-name=org.h2.Driver
spring.datasource.username=sa
spring.datasource.password=

# JPA and Hibernate
spring.jpa.database-platform=org.hibernate.dialect.H2Dialect
spring.jpa.hibernate.ddl-auto=create-drop
spring.jpa.show-sql=true

# H2 Console (available at /h2-console when running in IntelliJ)
spring.h2.console.enabled=true
spring.h2.console.path=/h2-console

# Structured logging with MDC correlationId placeholder
logging.level.com.example.demo=DEBUG
logging.level.org.springframework.web=INFO
logging.pattern.console=%d{yyyy-MM-dd HH:mm:ss} [%X{correlationId}] %-5level %logger{36} - %msg%n
```

---

## Video References

- NodeJS: https://youtube.com/playlist?list=PL1BztTYDF-QPdTvgsjf8HOwO4ZVl_LhxS
- Spring Boot 1: https://youtube.com/playlist?list=PLA3GkZPtsafacdBLdd3p1DyRd5FGfr3Ue
- Spring Boot 2: https://youtube.com/playlist?list=PL-bgVzzRdaPhNeXyQBtp8hMlUc14J2kRK
- Microservices in Spring Boot: https://youtube.com/playlist?list=PL-bgVzzRdaPgSkWO70qrskTKZCHA5SCai