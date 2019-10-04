# Stock Portfolio

>Building a web-based stock portfolio app for the TTP stage 2 challenge. Which requires us to build a fullstack app and deploy it.


# Dependencies and Libraries
This app uses the following dependencies: 
```javascript
 "dependencies": {
    "bcrypt": "^3.0.6",
    "dotenv": "^8.1.0",
    "ejs": "^2.7.1",
    "express": "^4.17.1",
    "express-session": "^1.16.2",
    "path": "^0.12.7",
    "pg": "^7.12.1",
    "pg-hstore": "^2.3.3",
    "request": "^2.88.0",
    "sequelize": "^5.19.1",
    "sequelize-cli": "^5.5.1"
  },
  ```
In addition, we are using the Alpha Vantage API for calling and receive stock information. 
#### Note that since we are using the free version of the API we can make at most: 5 API calls a minute and 500 calls a day.
#### Due to the fact we are unable to check multiple stocks in one call, timeouts will occur at the dashboard when there are more than 5 different stocks purchased.
