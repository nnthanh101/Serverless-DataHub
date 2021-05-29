FROM openjdk:8-jre-slim
VOLUME /tmp
ADD ./springboot/target/spring-petclinic-2.4.5.jar app.jar
RUN sh -c 'touch /app.jar'
ENV JAVA_OPTS=""
ENTRYPOINT [ "sh", "-c", "java $JAVA_OPTS -Djava.security.egd=file:/dev/./urandom -jar /app.jar --spring.datasource.initialization-mode=always" ]