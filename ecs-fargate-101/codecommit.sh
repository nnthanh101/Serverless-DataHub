 #!/bin/bash

export DIR=${WORKING_DIR}/"dist"
if [ -d "$DIR" ]; then
    echo Already running! $DIR
else

    export CodeCommit_URL=$(aws codecommit get-repository --region ${AWS_REGION} --repository-name ${SpringbootRepo} --output json | jq '.repositoryMetadata.cloneUrlHttp' | sed "s/\"/ /g" ) 
    echo $CodeCommit_URL

    mkdir -p $DIR
    git clone $CodeCommit_URL $DIR
    cp -a ${WORKING_DIR}/projects/* $DIR/ ; rm -rf $DIR/springboot/target ; rm -rf $DIR/springboot/.git

#    yes | cp -i ${WORKING_DIR}/source/welcome.html $DIR/springboot/src/main/resources/templates/
    # yes | cp -i ${WORKING_DIR}/projects/application.properties $DIR/springboot/src/main/resources/
    
    cd $DIR &&           \
    git add . &&           \
    git commit -m "🚀 CI/CD Pipeline >> First Commit" &&           \
    git push
    cd ../..
fi
