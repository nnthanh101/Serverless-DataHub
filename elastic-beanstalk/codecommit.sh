 #!/bin/bash

source ./.env.sh

export ElasticBeanstalk_URL=$(aws codecommit get-repository --repository-name ${ElasticBeanstalk_Repo} --output json | jq '.repositoryMetadata.cloneUrlHttp' | sed "s/\"/ /g" ) 
echo $ElasticBeanstalk_URL

mkdir -p dist/ebproject
cp -a Tomcat/ebproject/ dist/
cd dist/ebproject
git clone $ElasticBeanstalk_URL

git add .
git commit -m "🚀 CI/CD Pipeline >> First Commit"
git push
