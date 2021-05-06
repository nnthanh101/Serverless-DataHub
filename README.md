# [Pattern - E301 PaaS] Deploy, Scale and Modernize Web Applications ElasticBeanstalk PaaS 🌥🎯🚀

This pattern provides guidance for **Enterprise Customers migrating on-premises `Tomcat`/`SpringBoot`/`.NET` applications to AWS Cloud using AWS Elastic Beanstalk**.  Elastic Beanstalk makes it  easier for developers to quickly deploy and manage applications on AWS. Developers simply upload their application, and Elastic Beanstalk automatically handles the deployment details of capacity provisioning, load balancing, auto-scaling, and application health monitoring. 

> **E301**: great customer experience: **3 seconds** to reach any feature; **zero** downtime; and **one hour** to deploy code changes into production.

* [x] https://devsecops.job4u.io/en/prerequisites/bootstrap/

```
git clone https://github.com/nnthanh101/DevAx -b ElasticBeanstalkPaaS

cd DevAx
# git submodule add https://github.com/spring-projects/spring-petclinic.git elastic-beanstalk/projects/spring-petclinic
git submodule init && git submodule update --checkout --recursive

cd elastic-beanstalk/projects/spring-petclinic
# ls
./mvnw package

java -jar target/*.jar

# ./mvnw spring-boot:run
```

```
mkdir elastic-beanstalk
cd elastic-beanstalk

cdk init --language typescript
```

```
# git submodule add https://github.com/spring-projects/spring-petclinic.git elastic-beanstalk/projects/spring-petclinic

git submodule init && git submodule update --checkout --recursive
```
