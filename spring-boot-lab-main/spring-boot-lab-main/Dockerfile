# ─────────────────────────────────────────────
# Stage 1: Build
# Maven + JDK 17 image compiles the project
# and packages it into a fat JAR
# ─────────────────────────────────────────────
FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /app

# Copy Maven descriptor first (cached layer — only re-downloads deps when pom changes)
COPY pom.xml .
RUN mvn dependency:go-offline -q

# Copy source and build
COPY src ./src
RUN mvn clean package -DskipTests -q

# ─────────────────────────────────────────────
# Stage 2: Runtime
# Lightweight Alpine JRE — no compiler needed
# Final image is ~100MB instead of ~500MB
# ─────────────────────────────────────────────
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

COPY --from=build /app/target/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]