 #!/bin/bash

source ./.env.sh
 
export Job4UWeb_CLONE_URL=$(aws codecommit get-repository --repository-name ${Job4UWebRepo} --output json | jq '.repositoryMetadata.cloneUrlHttp' | sed "s/\"/ /g" ) 
# export Job4UCrawl_CLONE_URL=$(aws codecommit get-repository --repository-name ${Job4UCrawlRepo} --output json | jq '.repositoryMetadata.cloneUrlHttp' | sed "s/\"/ /g" ) 
# export Job4USync_CLONE_URL=$(aws codecommit get-repository --repository-name ${Job4USyncRepo} --output json | jq '.repositoryMetadata.cloneUrlHttp' | sed "s/\"/ /g" ) 
# export Nextjs_CLONE_URL=$(aws codecommit get-repository --repository-name ${NextJsRepo} --output json | jq '.repositoryMetadata.cloneUrlHttp' | sed "s/\"/ /g" )  
 
echo $Job4UWeb_CLONE_URL
# echo $Job4UCrawl_CLONE_URL
# echo $Job4USync_CLONE_URL
# echo $Nextjs_CLONE_URL


echo $Job4UWebRepo/
# echo $Job4UCrawlRepo/
# echo $Job4USyncRepo/
# echo $NextJsRepo/

cd docker 

rm -rf $Job4UWebRepo/
# rm -rf $Job4UCrawlRepo/
# rm -rf $Job4USyncRepo/
# rm -rf $NextJsRepo/


git clone $Job4UWeb_CLONE_URL
cp -a job4u-web/. $Job4UWebRepo/
cd $Job4UWebRepo
git add . && git commit -m "🚀 CI/CD Pipeline >> First Commit" && git push
