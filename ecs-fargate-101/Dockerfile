FROM maven:3.5.2-jdk-8-alpine AS MAVEN_BUILD

COPY springboot-aws/pom.xml /build/ 
COPY springboot-aws/src /build/src/
WORKDIR /build/
RUN mvn package
FROM openjdk:8-jre-alpine
WORKDIR /app 
COPY --from=MAVEN_BUILD /build/target/TravelBuddy-0.0.1-SNAPSHOT.jar /app/
EXPOSE 8000:8000
ENTRYPOINT ["java", "-jar", "TravelBuddy-0.0.1-SNAPSHOT.jar"]

# FROM openjdk:8-jdk-alpine
# COPY target/TravelBuddy-0.0.1-SNAPSHOT.jar app.jar
# ENTRYPOINT ["java","-jar","/app.jar"]