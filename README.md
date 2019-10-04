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
Mentionables are bcrypt for a level of security by only interacting with hashed values of our users paswords. We are using express-session for handling sessions for each user.
  
In addition, we are using the Alpha Vantage API for calling and receive stock information. 
#### Note that since we are using the free version of the API we can make at most: 5 API calls a minute and 500 calls a day.
#### Due to the fact we are unable to check multiple stocks in one call, timeouts will occur at the dashboard when there are more than 5 different stocks purchased.


# Database structure 
We are using three tables and keep a simply approach to the database. Email will be unique and utilized as foreign keys for 'Userstocks' and 'Usertransactions'. This will keep searching simple while still keeping track of each users actions.
![Database Structure](https://github.com/atsui4688/TTP_Stock_Portfolio/blob/master/public/img/dbstructure.png)


> Below is the Portfolio page for buying and viewing stocks, this includes color stocks green or red based on their performance for that day. 
![Portfolio](https://github.com/atsui4688/TTP_Stock_Portfolio/blob/master/public/img/portfolio.png)

> The Transactions page for viewing all past transactions that belong to a particular user
![Transactions](https://github.com/atsui4688/TTP_Stock_Portfolio/blob/master/public/img/transactions.png)


