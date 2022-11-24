# Introduction
A simple website to show marking information of students.
## Start
### Running backend
Turn on the terminal in Visual Code Studio and type the following command to go to `api` folder:

```cd api```

Install dependencies by:

```yarn install```

### Config database connection
In `/api/index.js` file, find database config, put your `username` and `password` of phpmyadmin, save.
![Image](./frontend/introduction.png)

Start backend by this command:

```yarn start```

App will run in [http://localhost:3000](http://localhost:3000)

### Running frontend
Go to `frontend` folder, choose file `index.html` and turn on Live Server.
If success, there will be my website
![Image](./frontend/intro2.png)
`Submit` button will collect data from table (like score, test results, etc) and call api to update database.