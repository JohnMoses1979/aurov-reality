# Build Spring Boot application
FROM maven:3.9.9-eclipse-temurin-17 AS build

WORKDIR /app

COPY pom.xml ./

COPY src ./src

RUN mvn -B -DskipTests clean package


# Run Spring Boot application
FROM eclipse-temurin:17-jre-jammy

WORKDIR /app

COPY --from=build /app/target/*.jar app.jar

RUN mkdir -p /app/uploads/employee-documents

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "/app/app.jar"]
