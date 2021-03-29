 #!/bin/bash
export DIR="dist/ebproject"
if [ -d "$DIR" ]; then
    echo Already running! $DIR
else
    source ./.env.sh

    export ElasticBeanstalk_URL=$(aws codecommit get-repository --region ${AWS_REGION} --repository-name ${Tomcat_Repo} --output json | jq '.repositoryMetadata.cloneUrlHttp' | sed "s/\"/ /g" ) 
    echo $ElasticBeanstalk_URL

    mkdir -p dist/ebproject
    git clone $ElasticBeanstalk_URL dist/ebproject
    cp -a Tomcat/ebproject/* dist/ebproject

    cd dist/ebproject

    git add .
    git commit -m "🚀 CI/CD Pipeline >> First Commit"
    git push
    
    cd ../..
fi

export DIR="dist/springboot"
if [ -d "$DIR" ]; then
    echo Already running! $DIR
else
    source ./.env.sh

    export ElasticBeanstalk_URL=$(aws codecommit get-repository --region ${AWS_REGION} --repository-name ${Springboot_Repo} --output json | jq '.repositoryMetadata.cloneUrlHttp' | sed "s/\"/ /g" ) 
    echo $ElasticBeanstalk_URL

    mkdir -p dist/springboot
    git clone $ElasticBeanstalk_URL dist/springboot
    cp -a Springboot/* dist/springboot

    cd dist/springboot

    git add .
    git commit -m "🚀 CI/CD Pipeline >> First Commit"
    git push
    
    cd ../..
fi