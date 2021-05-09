 #!/bin/bash

export DIR="dist/springboot"
if [ -d "$DIR" ]; then
    echo Already running! $DIR
else
    source ./.env.sh

    export ElasticBeanstalk_URL=$(aws codecommit get-repository --region ${AWS_REGION} --repository-name ${Springboot_Repo} --output json | jq '.repositoryMetadata.cloneUrlHttp' | sed "s/\"/ /g" ) 
    echo $ElasticBeanstalk_URL

    mkdir -p dist/petclinic
    git clone $ElasticBeanstalk_URL dist/petclinic
    cp -a petclinic/* dist/petclinic

    cd dist/petclinic

    git add .
    git commit -m "🚀 CI/CD Pipeline >> First Commit"
    git push
    
    cd ../..
fi