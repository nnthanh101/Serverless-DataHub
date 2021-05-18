# pull official base image
FROM node:alpine
# FROM public.ecr.aws/bitnami/node:14-prod

# set working directory
WORKDIR /app

# add `/app/node_modules/.bin` to $PATH
ENV PATH /app/node_modules/.bin:$PATH

# install app dependencies
COPY package.json ./
COPY package-lock.json ./
RUN npm install

# add app
COPY . ./

# RUN npm run build
RUN npm install -g serve
 

# start app
CMD ["npm","start"]    