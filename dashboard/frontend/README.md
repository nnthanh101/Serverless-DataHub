# This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

> This is a React application that serves as the **frontend** for the **FullStack Serverless ⚡**.

## Run locally

Create the file public/env.js and add the following content to it to run the frontend locally against your deployed instance on AWS. Replace the value of each variable with the appropriate value for your environment, as determined by the outputs of the CloudFormation stacks when you deployed FullStack Serverless ⚡.

```js
const env = {
  region: "ap-southeast-2",
  backendApi: "https://XXX.execute-api.ap-southeast-2.amazonaws.com/prod/",
  // backendApi: "http://localhost:8080/",
};

window.EnvironmentConfig = env;
```

Then run the following command to run the app in the development mode:

```bash
npm start
```

> Open [http://localhost:3000](http://localhost:3000) to view it in the browser. The page will reload if you make edits. You will also see any lint errors in the console.

## Run unit tests

```bash
npm test
```
