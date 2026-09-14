# Post Composer — Spring Boot Backend

Covers **Experiment 2.1.1** and **Experiment 2.1.2**.

---

## How to Run

**Prerequisites:** Java 17+, Maven 3.8+

```bash
cd backend
mvn spring-boot:run
```

Server starts at `http://localhost:8080`.  
H2 console at `http://localhost:8080/h2-console` (JDBC URL: `jdbc:h2:mem:postdb`).

---

## Project Structure

```
backend/
├── pom.xml
└── src/main/java/com/deadbeat/postapi/
    ├── PostApiApplication.java          ← Entry point
    ├── config/
    │   └── CorsConfig.java              ← Exp 2.1.1 — CORS
    ├── controller/
    │   └── PostController.java          ← Exp 2.1.1 — REST endpoints
    ├── service/
    │   ├── PostService.java             ← Exp 2.1.1 — Interface
    │   └── PostServiceImpl.java         ← Exp 2.1.1 — Business logic
    ├── repository/
    │   └── PostRepository.java          ← Exp 2.1.1 — Data access
    ├── model/
    │   └── Post.java                    ← Exp 2.1.1 — Entity + Bean Validation
    ├── dto/
    │   ├── PostRequestDto.java          ← Exp 2.1.1 — Request DTO
    │   ├── ApiResponse.java             ← Exp 2.1.1 — Standardized response
    │   └── ErrorResponse.java           ← Exp 2.1.2 — Structured error response
    ├── exception/
    │   ├── PostNotFoundException.java   ← Exp 2.1.2 — Custom exception
    │   ├── BusinessRuleException.java   ← Exp 2.1.2 — Custom exception
    │   └── GlobalExceptionHandler.java  ← Exp 2.1.2 — @RestControllerAdvice
    └── filter/
        └── CorrelationIdFilter.java     ← Exp 2.1.2 — MDC + request logging
```

---

## API Endpoints

| Method | URL | Description |
|--------|-----|-------------|
| GET | `/api/posts` | Get all posts |
| GET | `/api/posts?platform=Twitter` | Filter by platform |
| GET | `/api/posts/{id}` | Get post by ID |
| POST | `/api/posts` | Create post |
| PUT | `/api/posts/{id}` | Update post |
| DELETE | `/api/posts/{id}` | Delete post |

---

## Sample Requests (Postman)

### Create Post
```http
POST http://localhost:8080/api/posts
Content-Type: application/json

{
  "platform": "Twitter",
  "content": "Hello World! #spring #java",
  "scheduledAt": "2026-10-01T10:00:00",
  "status": "DRAFT"
}
```

### Success Response
```json
{
  "success": true,
  "message": "Post created successfully",
  "data": {
    "id": 1,
    "platform": "Twitter",
    "content": "Hello World! #spring #java",
    "scheduledAt": "2026-10-01T10:00:00",
    "status": "DRAFT",
    "createdAt": "2026-09-13T19:00:00"
  },
  "timestamp": "2026-09-13T19:00:00"
}
```

### Validation Error (missing content)
```json
{
  "success": false,
  "status": 400,
  "error": "Validation Failed",
  "message": "One or more fields failed validation. See 'fieldErrors' for details.",
  "path": "/api/posts",
  "correlationId": "a3f7c19b2d4e8f01",
  "fieldErrors": {
    "content": "Content must not be blank"
  },
  "timestamp": "2026-09-13T19:00:00"
}
```

### Not Found Error
```json
{
  "success": false,
  "status": 404,
  "error": "Not Found",
  "message": "Post with id 99 not found",
  "path": "/api/posts/99",
  "correlationId": "a3f7c19b2d4e8f01",
  "timestamp": "2026-09-13T19:00:00"
}
```

---

## Experiment 2.1.1 Coverage

| Requirement | Implementation |
|---|---|
| REST API design principles | Stateless HTTP, resource URIs, standard methods |
| Spring Boot layered architecture | Controller → Service → Repository |
| CRUD operations | GET, POST, PUT, DELETE in `PostController` |
| Bean Validation | `@NotBlank`, `@NotNull`, `@Size` on `Post` and `PostRequestDto` |
| Standardized response format | `ApiResponse<T>` wraps every response |
| CORS configuration | `CorsConfig` — allows React frontend origins |

## Experiment 2.1.2 Coverage

| Requirement | Implementation |
|---|---|
| Global exception handling | `GlobalExceptionHandler` with `@RestControllerAdvice` |
| Custom exceptions | `PostNotFoundException`, `BusinessRuleException` |
| Structured error responses | `ErrorResponse` with status, message, fieldErrors |
| Logging filter/interceptor | `CorrelationIdFilter` implements `javax.servlet.Filter` |
| Correlation ID via MDC | UUID generated per request, stored in `MDC`, returned in `X-Correlation-ID` header |
| Structured log output | SLF4J + Logback with `[correlationId]` in every log line |
