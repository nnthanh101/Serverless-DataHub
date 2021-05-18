#!/bin/bash
source ./env.sh

## FIXME
# if [ $(uname -s) == 'Darwin' ] ; then
#     export BSD_SED=''
# else
#     export BSD_SED=
# fi

if [ $(uname -s) == 'Darwin' ] ; then
    sed -i '' "s/ENV_PORT_PLACEHOLDER_/${ENV_PORT}/g" docker-compose.yml
    sed -i '' "s/ENV_SRV_PLACEHOLDER_/${ENV_SRV}/g" docker-compose.yml
    sed -i '' "s/ENV_MONGO_HOST_PLACEHOLDER_/${ENV_MONGO_HOST}/g" docker-compose.yml
    sed -i '' "s/ENV_MONGO_PORT_PLACEHOLDER_/${ENV_MONGO_PORT}/g" docker-compose.yml
    sed -i '' "s/ENV_MONGO_DATABASE_PLACEHOLDER_/${ENV_MONGO_DATABASE}/g" docker-compose.yml
    sed -i '' "s/ENV_REDIS_HOST_PLACEHOLDER_/${ENV_REDIS_HOST}/g" docker-compose.yml
    sed -i '' "s/ENV_REDIS_PORT_PLACEHOLDER_/${ENV_REDIS_PORT}/g" docker-compose.yml
    sed -i '' "s/ENV_ELASTIC_HOST_PLACEHOLDER_/${ENV_ELASTIC_HOST}/g" docker-compose.yml
    sed -i '' "s/ENV_ELASTIC_PORT_PLACEHOLDER_/${ENV_ELASTIC_PORT}/g" docker-compose.yml
else
    sed -i "s/ENV_PORT_PLACEHOLDER_/${ENV_PORT}/g" docker-compose.yml
    sed -i "s/ENV_SRV_PLACEHOLDER_/${ENV_SRV}/g" docker-compose.yml
    sed -i "s/ENV_MONGO_HOST_PLACEHOLDER_/${ENV_MONGO_HOST}/g" docker-compose.yml
    sed -i "s/ENV_MONGO_PORT_PLACEHOLDER_/${ENV_MONGO_PORT}/g" docker-compose.yml
    sed -i "s/ENV_MONGO_DATABASE_PLACEHOLDER_/${ENV_MONGO_DATABASE}/g" docker-compose.yml
    sed -i "s/ENV_REDIS_HOST_PLACEHOLDER_/${ENV_REDIS_HOST}/g" docker-compose.yml
    sed -i "s/ENV_REDIS_PORT_PLACEHOLDER_/${ENV_REDIS_PORT}/g" docker-compose.yml
    sed -i "s/ENV_ELASTIC_HOST_PLACEHOLDER_/${ENV_ELASTIC_HOST}/g" docker-compose.yml
    sed -i "s/ENV_ELASTIC_PORT_PLACEHOLDER_/${ENV_ELASTIC_PORT}/g" docker-compose.ymlfi
fi