#!/bin/bash

export ENV_PORT=3000
export ENV_SRV=srv_account

# export ENV_MONGO_URI=mongodb://${ENV_MONGO_HOST}:${ENV_MONGO_PORT}/${ENV_MONGO_DATABASE}
export ENV_MONGO_HOST=mongo
export ENV_MONGO_PORT=27017
export ENV_MONGO_DATABASE=dev_account

#export ENV_REDIS_URI=redis://${ENV_REDIS_HOST}:${ENV_REDIS_PORT}/0
export ENV_REDIS_HOST=redis
export ENV_REDIS_PORT=6379

# export ENV_ELASTIC_URI=http://${ENV_ELASTIC_HOST}:${ENV_ELASTIC_PORT}
export ENV_ELASTIC_HOST=elasticsearch
export ENV_ELASTIC_PORT=9200