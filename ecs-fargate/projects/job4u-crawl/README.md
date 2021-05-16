# aws_deploy

## Connect DocumentDB Nodejs

* [x] https://docs.aws.amazon.com/documentdb/latest/developerguide/connect_programmatically.html#connect_programmatically-tls_enabled

## 1. Installing & Running Node.js Application

* [x] Option 1. using docker-compose (**Docker Desktop**)
  ```
    sh setup-env.sh
    docker-compose up --build
  ```

* [ ] Option 2. without Docker (**Nodejs** **MongoDB**, **Redis**, **Elasticsearch**)
  ```
    npm install
    npm start
    
    Ex: PORT=3000 SRV=srv_account MONGO_URI='mongodb://root:12345678@db.cluster-cdu63jdbwun4.us-east-2.docdb.amazonaws.com:27017/dev_account?ssl=true&ssl_ca_certs=rds-combined-ca-bundle.pem&replicaSet=rs0&readPreference=secondaryPreferred&retryWrites=false' REDIS_URI=redis://elc.selavc.clustercfg.use2.cache.amazonaws.com:6379 ELASTIC_URI=https://vpc-els-sajs54bdd6ldafhi77c4etl6bu.us-east-2.es.amazonaws.com node src/index.js
  ```

## 2. Calling api

* [x] #1. Create account **POST**
  ```
  http://localhost:3000/srv-account/account
  BODY: 
  {
      "phone": "0123456789",
      "firstName": "firstName",
      "lastName": "lastName"
  }
  RESPONSE
  {
      "code": 200,
      "message": "SUCCESS"
  }
  ````
* [x] #2. Update account **PUT**
  ```
  http://localhost:3000/srv-account/account/:id
  BODY: 
  {
      "phone": "0123456789",
      "firstName": "firstName",
      "lastName": "lastName"
  }
  RESPONSE
  {
      "code": 200,
      "message": "SUCCESS"
  }
  ````
* [x] #3. Account Detail **GET**
  ```
  http://localhost:3000/srv-account/account/:id
  RESPONSE
  {
    "code": 200,
    "message": "SUCCESS",
    "source": "Mongo | Redis",
    "data": {
        "isDeleted": false,
        "_id": "5f5da9d80032fe2624894de4",
        "phone": "0123456789",
        "firstName": "firstName",
        "lastName": "lastName",
        "createdAt": "2020-09-13T05:10:48.590Z",
        "updatedAt": "2020-09-13T05:10:48.590Z",
        "__v": 0
    }
  }
  ````
* [x] #4. Account Listing **POST**
  ```
  http://localhost:3000/srv-account/account/paging
  RESPONSE
  {
    "code": 200,
    "message": "SUCCESS",
    "total": 1,
    "data": [
        {
            "isDeleted": false,
            "_id": "5f5da9d80032fe2624894de4",
            "phone": "0123456789",
            "firstName": "firstName",
            "lastName": "lastName",
            "createdAt": "2020-09-13T05:10:48.590Z",
            "updatedAt": "2020-09-13T05:10:48.590Z",
            "__v": 0
        }
    ]
  }
  ````

* [x] #5. Delete Account **DELETE**
  ```
  http://localhost:3000/srv-account/account/:id 
  RESPONSE
  {
      "code": 200,
      "message": "SUCCESS"
  }
  ````
* [x] #6. Verify Elasticsearch
  ```
  http://localhost:9200/_search
  ```

## 3. Deploy production