# Spring Boot Lab — Experiments 2.1.1 & 2.1.2

---

## Experiment 2.1.1 — RESTful APIs with Spring Boot

**Aim:** To design and implement RESTful APIs using Spring Boot with proper validation, standardized responses, and scalable architecture.

**Objectives:**
- Understand REST API design principles
- Implement CRUD APIs using Spring Boot
- Enforce consistent request-response structures
- Apply validation using Bean Validation (`@NotBlank`, `@Size`, `@NotNull`)
- Enable secure cross-origin communication via CORS

**COs Mapped:** CO1 - BT1, CO3 - BT3

---

## Experiment 2.1.2 — Global Exception Handling & Structured Logging

**Aim:** To implement global exception handling and structured logging for building robust and observable backend systems.

**Objectives:**
- Handle exceptions centrally using `@ControllerAdvice`
- Implement logging mechanisms for request tracking
- Use correlation IDs for tracing requests via MDC
- Improve system observability and debugging

**COs Mapped:** CO3 - BT3

---

## Prerequisites

| Requirement | Details |
|---|---|
| Java | JDK 17+ |
| Docker | Docker Desktop (for container-based run) |
| IDE | IntelliJ IDEA / Eclipse / VSCode |
| API Testing | Postman |

---

## Project Structure

```
spring-boot-lab-main/
├── Dockerfile
├── pom.xml
├── mvnw
├── mvnw.cmd
└── src/
    └── main/
        ├── java/com/example/demo/
        │   ├── Application.java                        ← Entry point (@SpringBootApplication)
        │   ├── config/
        │   │   └── CorsConfig.java                     ← Exp 2.1.1 — CORS configuration
        │   ├── controller/
        │   │   └── PostController.java                 ← Exp 2.1.1 — REST API endpoints
        │   ├── dto/
        │   │   ├── ApiResponse.java                    ← Exp 2.1.1 — Standardized response wrapper
        │   │   ├── PostRequestDto.java                 ← Exp 2.1.1 — Request body + Bean Validation
        │   │   └── PostResponseDto.java                ← Exp 2.1.1 — Response body shape
        │   ├── exception/
        │   │   ├── GlobalExceptionHandler.java         ← Exp 2.1.2 — @RestControllerAdvice
        │   │   └── ResourceNotFoundException.java      ← Exp 2.1.2 — Custom 404 exception
        │   ├── filter/
        │   │   └── CorrelationIdFilter.java            ← Exp 2.1.2 — MDC + request logging
        │   ├── model/
        │   │   └── Post.java                           ← Exp 2.1.1 — JPA entity
        │   ├── repository/
        │   │   └── PostRepository.java                 ← Exp 2.1.1 — JpaRepository (data access)
        │   └── service/
        │       └── PostService.java                    ← Exp 2.1.1 — Business logic
        └── resources/
            └── application.properties                  ← Server config, H2 DB, logging pattern
```

---

## How to Run

### Option 1 — Docker (Recommended)

**Step 1 — Build the image:**
```bash
docker build -t spring-boot-lab .
```

**Step 2 — Run the container:**
```bash
docker run -d -p 8080:8080 --name postapi spring-boot-lab
```

**Step 3 — Verify it's running:**
```bash
docker logs postapi
```

You should see: `Started Application in X seconds`

**If container name already exists:**
```bash
docker rm -f postapi
docker run -d -p 8080:8080 --name postapi spring-boot-lab
```

---

### Option 2 — IntelliJ IDEA

1. Open IntelliJ → `File → Open` → select this folder
2. Wait for Maven to sync dependencies
3. Open `Application.java` → click the green ▶ Run button
4. Server starts at `http://localhost:8080`

---

## API Endpoints (Experiment 2.1.1)

| Method | URL | Description | Status |
|---|---|---|---|
| `GET` | `/api/health` | Health check | `200 OK` |
| `GET` | `/api/posts` | Get all posts | `200 OK` |
| `GET` | `/api/posts/{id}` | Get post by ID | `200 OK` / `404` |
| `POST` | `/api/posts` | Create new post | `201 Created` |
| `DELETE` | `/api/posts/{id}` | Delete post | `200 OK` / `404` |

---

## Postman Examples

### Health Check
```
GET http://localhost:8080/api/health
```
Response:
```
Spring Boot environment is running inside Docker!
```

---

### Create a Post
```
POST http://localhost:8080/api/posts
Content-Type: application/json

{
    "title": "My First Post",
    "content": "Spring Boot is running in Docker!",
    "author": "Deadbeat"
}
```
Response (`201 Created`):
```json
{
    "success": true,
    "message": "Post created successfully",
    "data": {
        "id": 1,
        "title": "My First Post",
        "content": "Spring Boot is running in Docker!",
        "author": "Deadbeat",
        "createdAt": "2026-09-14T14:00:00"
    },
    "timestamp": "2026-09-14T14:00:00"
}
```

---

### Get All Posts
```
GET http://localhost:8080/api/posts
```
Response (`200 OK`):
```json
{
    "success": true,
    "message": "Posts retrieved successfully",
    "data": [...],
    "timestamp": "2026-09-14T14:00:00"
}
```

---

### Get Post by ID (404 Demo — Experiment 2.1.2)
```
GET http://localhost:8080/api/posts/999
```
Response (`404 Not Found`):
```json
{
    "success": false,
    "message": "Post not found with ID: 999",
    "data": null,
    "timestamp": "2026-09-14T14:00:00"
}
```

---

### Validation Error Demo (Experiment 2.1.2)
```
POST http://localhost:8080/api/posts
Content-Type: application/json

{
    "title": "",
    "content": "",
    "author": ""
}
```
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
    "timestamp": "2026-09-14T14:00:00"
}
```

---

### Delete a Post
```
DELETE http://localhost:8080/api/posts/1
```
Response (`200 OK`):
```json
{
    "success": true,
    "message": "Post deleted successfully",
    "data": null,
    "timestamp": "2026-09-14T14:00:00"
}
```

---

## H2 Database Console

While the app is running (IntelliJ only — not Docker):

- URL: `http://localhost:8080/h2-console`
- JDBC URL: `jdbc:h2:mem:testdb`
- Username: `sa`
- Password: *(leave blank)*

---

## Verifying Experiment 2.1.2

### 1. Correlation ID (CorrelationIdFilter + MDC)
Send any request in Postman → click **Headers** tab in the response.

You will see:
```
X-Correlation-ID  →  550e8400-e29b-41d4-a716-446655440000
```

Every request gets a **unique UUID**. This same ID appears in the application logs.

### 2. Global Exception Handler — 404
```
GET http://localhost:8080/api/posts/999
```
Returns structured JSON error instead of a raw Java stack trace.

### 3. Global Exception Handler — Validation (400)
Send a POST with blank fields — returns per-field error messages in `data`.

### 4. Logs (Docker)
```bash
docker logs postapi
```
Every log line includes the correlation ID in brackets:
```
[a3f7c19b-2d4e] INFO  PostController - Fetching all posts
[a3f7c19b-2d4e] INFO  PostService - Returning 3 posts from DB
```

---

## Experiment Coverage

### 2.1.1 — RESTful APIs

| Requirement | File | Implementation |
|---|---|---|
| REST API design | `PostController.java` | Stateless HTTP, resource URIs, standard methods |
| Controller layer | `PostController.java` | `@RestController`, handles HTTP, delegates to service |
| Service layer | `PostService.java` | `@Service`, contains all business logic |
| Repository layer | `PostRepository.java` | `@Repository`, extends `JpaRepository` |
| CRUD operations | `PostController.java` | `GET`, `POST`, `DELETE` endpoints |
| Bean Validation | `PostRequestDto.java` | `@NotBlank`, `@Size` on all fields |
| Standardized response | `ApiResponse.java` | Generic wrapper with `success`, `message`, `data`, `timestamp` |
| CORS configuration | `CorsConfig.java` | Allows frontend origins, exposes correlation header |

### 2.1.2 — Exception Handling & Logging

| Requirement | File | Implementation |
|---|---|---|
| `@ControllerAdvice` | `GlobalExceptionHandler.java` | `@RestControllerAdvice` handles all exceptions centrally |
| Custom exception | `ResourceNotFoundException.java` | Thrown when post ID not found → mapped to `404` |
| Validation exception | `GlobalExceptionHandler.java` | `MethodArgumentNotValidException` → mapped to `400` with field errors |
| Generic safety net | `GlobalExceptionHandler.java` | Catch-all `Exception` handler → mapped to `500` |
| Filter / Interceptor | `CorrelationIdFilter.java` | Implements `Filter`, intercepts every request |
| Correlation ID | `CorrelationIdFilter.java` | UUID generated per request, stored in MDC |
| Structured logging | `application.properties` | `[%X{correlationId}]` in every log line via Logback |
| Response header | `CorrelationIdFilter.java` | `X-Correlation-ID` written to every response |

---

## Request Flow

```
Client (Postman / Browser / React Frontend)
        ↓
Docker Container (port 8080)
        ↓
CorrelationIdFilter     → assigns unique trace ID (Exp 2.1.2)
        ↓
PostController          → receives the HTTP request (Exp 2.1.1)
        ↓
PostRequestDto + @Valid → validates request body (Exp 2.1.1)
        ↓
PostService             → executes business logic (Exp 2.1.1)
        ↓
PostRepository          → reads/writes H2 database (Exp 2.1.1)
        ↓
ApiResponse wrapper     → wraps result in standard format (Exp 2.1.1)
        ↓
GlobalExceptionHandler  → catches any error, returns structured JSON (Exp 2.1.2)
        ↓
JSON Response to Client
```

---

## Docker Commands Reference

| Command | Purpose |
|---|---|
| `docker build -t spring-boot-lab .` | Build the image from Dockerfile |
| `docker run -d -p 8080:8080 --name postapi spring-boot-lab` | Create and start a container |
| `docker ps` | List running containers |
| `docker logs postapi` | View application logs |
| `docker logs -f postapi` | Stream live logs |
| `docker stop postapi` | Stop the container |
| `docker start postapi` | Start a stopped container |
| `docker rm -f postapi` | Force remove the container |
| `docker rmi spring-boot-lab` | Delete the image |

---

## Dockerfile — How It Works

```dockerfile
# Stage 1: Build
# Maven + JDK 17 compiles and packages the app into a JAR
FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline -q     # Cache dependencies as a separate layer
COPY src ./src
RUN mvn clean package -DskipTests -q # Compile and package

# Stage 2: Runtime
# Lightweight Alpine JRE — no compiler, smaller image (~100MB vs ~500MB)
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
```

The 2-stage build means:
- Stage 1 has Maven + full JDK (heavy) — used only during build
- Stage 2 has only the JRE (lightweight) — what actually runs in production

---

## Video References

- [NodeJS](https://youtube.com/playlist?list=PL1BztTYDF-QPdTvgsjf8HOwO4ZVl_LhxS)
- [Spring Boot - 1](https://youtube.com/playlist?list=PLA3GkZPtsafacdBLdd3p1DyRd5FGfr3Ue)
- [Spring Boot - 2](https://youtube.com/playlist?list=PL-bgVzzRdaPhNeXyQBtp8hMlUc14J2kRK)
- [Microservices in Spring Boot](https://youtube.com/playlist?list=PL-bgVzzRdaPgSkWO70qrskTKZCHA5SCai)

---

## Spring Boot Core Concepts

### What is Spring Boot?

Spring Boot is a framework built on top of the Spring Framework. It helps developers create production-ready Java applications quickly with minimal configuration.

Think of it like this in Node.js terms:
- Express is a web framework for Node.js
- Spring Boot is the Java equivalent of Express + dependency injection + config system + application lifecycle management — all bundled together

---

### Key Terminologies

#### Bean
A bean is any object managed by Spring. Examples: service class, repository class, controller class.

```java
@Service
public class PostService {
    // Spring creates and manages this object automatically
}
```

Node.js analogy — in Node.js you `require()` and instantiate modules yourself. In Spring, the framework creates and injects them for you.

---

#### Dependency Injection (DI)
Giving an object its dependencies from outside rather than creating them internally.

```java
@Service
public class PostService {
    private final PostRepository postRepository;

    // Spring automatically provides PostRepository here
    public PostService(PostRepository postRepository) {
        this.postRepository = postRepository;
    }
}
```

Node.js equivalent:
```js
const postRepository = require('./postRepository');
const postService = new PostService(postRepository);
```

---

#### Inversion of Control (IoC)
The framework controls object creation instead of the developer writing manual `new` logic.

Instead of:
```java
PostService service = new PostService(new PostRepository());
```

Spring does this automatically when the application starts.

---

#### Component Scanning
Spring scans packages to find classes marked with annotations and registers them as beans:
- `@Component` — generic bean
- `@Service` — business logic
- `@Repository` — data access
- `@RestController` — REST API handler
- `@Configuration` — configuration class

---

#### Key Annotations

| Annotation | Purpose |
|---|---|
| `@SpringBootApplication` | Entry point — combines `@Configuration`, `@EnableAutoConfiguration`, `@ComponentScan` |
| `@RestController` | Marks class as REST API controller |
| `@RequestMapping` | Maps URL prefix to a controller class |
| `@GetMapping` / `@PostMapping` / `@DeleteMapping` | Maps specific HTTP methods to methods |
| `@Service` | Marks business logic class as a Spring bean |
| `@Repository` | Marks data access class as a Spring bean |
| `@Valid` | Triggers Bean Validation on the request body |
| `@RequestBody` | Reads JSON body from HTTP request |
| `@PathVariable` | Reads `{id}` from the URL path |
| `@RestControllerAdvice` | Global exception handler for all controllers |
| `@ExceptionHandler` | Maps an exception type to a handler method |
| `@Component` | Generic Spring-managed bean |
| `@Order(1)` | Ensures filter runs first in the chain |

---

### Spring Boot Request Flow

```text
HTTP Request
    ↓
Embedded Tomcat
    ↓
Filter Chain (CorrelationIdFilter)
    ↓
DispatcherServlet
    ↓
Controller (@RestController)
    ↓
Service (@Service)
    ↓
Repository (@Repository)
    ↓
Database (H2)
    ↓
Response
```

`DispatcherServlet` is Spring's front controller — it receives all HTTP requests and routes them to the correct controller method.

---

### Spring Boot vs Node.js Comparison

| Topic | Node.js (Express) | Spring Boot |
|---|---|---|
| Runtime | Node.js | JVM (Java Virtual Machine) |
| Package manager | npm / package.json | Maven / pom.xml |
| Server startup | `app.listen(3000)` | `SpringApplication.run(...)` |
| Request handling | route handlers | `@RestController` methods |
| Dependency management | `require()` | Spring IoC container + DI |
| Object creation | manual `new` | container-managed beans |
| Configuration | `.env`, JSON | `application.properties` |
| Routing | Express router | `@GetMapping`, `@PostMapping` |
| Business layer | service functions | `@Service` classes |
| Data access | Prisma / Sequelize | `@Repository` + JPA |
| Auto-configuration | not built-in | built-in Spring Boot auto-config |

---

### Maven Lifecycle

| Phase | What it does |
|---|---|
| `compile` | Compiles `.java` → `.class` bytecode |
| `test` | Runs unit tests |
| `package` | Creates the `.jar` file |
| `install` | Installs jar to local Maven repository |
| `clean` | Deletes the `target/` folder |

Common commands:
```bash
mvn clean package -DskipTests   # Build JAR, skip tests
mvn spring-boot:run             # Run directly without building JAR
mvn test                        # Run all tests
```

---

### application.properties Explained

```properties
spring.application.name=demo          # App name shown in logs
server.port=8080                      # Port the server listens on

spring.datasource.url=jdbc:h2:mem:testdb    # H2 in-memory database
spring.datasource.username=sa               # DB username
spring.datasource.password=                 # DB password (blank for H2)

spring.jpa.hibernate.ddl-auto=create-drop   # Auto-create tables on start
spring.jpa.show-sql=true                    # Print SQL queries in logs

spring.h2.console.enabled=true              # Enable H2 web console
spring.h2.console.path=/h2-console          # URL path for H2 console

# Logging pattern — includes correlationId from MDC (Exp 2.1.2)
logging.pattern.console=%d{yyyy-MM-dd HH:mm:ss} [%X{correlationId}] %-5level %logger{36} - %msg%n
```