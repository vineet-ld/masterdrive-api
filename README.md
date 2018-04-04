# masterdrive-api

This is a REST API for the MasterDrive App developed using NodeJS

## Initial Setup

### Install Node.js and NPM

* Download NodeJS and NPM from the following link: https://nodejs.org/en/
* Double click the installer file and follow the instructions to complete the setup
* Check if Node.js and NPM has been installed successfully. Type the following command in your terminal window:
```
    node -v
```

### Update NPM
```
    npm install npm@latest -g
```

### Install and setup MongoDB

* Download the setup from the following link: https://docs.mongodb.com/manual/installation/
* Follow instructions to install MongoDB
* Go to `mongo/bin` and then initialize the database by typing the following:
```
    ./mongod --dbpath [path_to_save_the_database]
```


### Clone the repository
```
    git clone https://github.com/vineet-ld/masterdrive-api.git
```
*You can also download the repo instead

## Setup the project

From your terminal, go to the project folder and type the following command
```
    npm install
```
This will download all the dependencies to your project.

Create a file named *.env* in the root of your project folder. This file holds the environment variables
in your development and test environments

Following environment values need to be initialized:
* `PORT`
* `LOG_LEVEL`  [ `all | trace | debug | info | warn | error | fatal | off` ]
* `MONGODB_URL` 
* `MONGODB_URL_TEST` [ URL for the database to be used for running tests ]
* `JWT_SECRET` [ Any long random string ]

*Please note that the variables set in the `.env` file are only used as environment variables while running the project on `localhost`. If you are hosting this project on a remote server, you need to setup these environment variables on that machine.


## Run the project

```
    npm start
```
Your project should start and be ready to accept any HTTP requests. 

To test that your application is up and running, go to the browser and type the following:
http://localhost:3000/test

or make a `GET` request to `/test`

You should get a response with Status 200 OK and text *Server is online*

*The domain name and the port number of the url depends on how and where you have hosted your service.

## Run tests
```
    npm test
```

## API Documentation

Detailed documention is available [here]

[here]: https://github.com/vineet-ld/masterdrive-api/wiki/API-Documentation

## Latest Release

This project is still under development. There is no release version available yet.
