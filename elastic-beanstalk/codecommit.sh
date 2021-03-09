 #!/bin/bash
DIR="dist/ebproject"
if [ -d "$DIR" ]; then
    echo Already running!
else
    source ./.env.sh

    export ElasticBeanstalk_URL=$(aws codecommit get-repository --repository-name ${ElasticBeanstalk_Repo} --output json | jq '.repositoryMetadata.cloneUrlHttp' | sed "s/\"/ /g" ) 
    echo $ElasticBeanstalk_URL

    mkdir -p dist/ebproject
    git clone $ElasticBeanstalk_URL dist/ebproject
    cp -a Tomcat/ebproject/* dist/ebproject

    cd dist/ebproject

    git add .
    git commit -m "🚀 CI/CD Pipeline >> First Commit"
    git push
fi