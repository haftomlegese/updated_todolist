const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const compression = require('compression');
// const createError = require('http-errors');
require('dotenv').config();
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const cron = require('node-cron');
const bodyParser = require('body-parser');



// import files 
const userRouter = require('./routes/userroute');
const taskRouter = require('./routes/taskroute');
const subtaskRouter = require('./routes/subtaskroute');
const auth = require('./middleware/authentication');
const notifyRouter = require('./routes/notifyroute');
const { statusChange } = require('./controller/scheduleController');
const { notify } = require('./controller/notificationController');

//swagger
const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "TODO LIST API",
            version: "1.0",
            description: "A simple express TODO LIST API"
        },
        servers: [
            {
                url: "https://mytoodoapilist.herokuapp.com/"
            }
        ]
    },
    apis:['./routes/*.js']
};

const specs = swaggerJsdoc(options);

// call express function
const app = express()

app.use("/api-docs",swaggerUi.serve,swaggerUi.setup(specs));

// middleware to use request from body or url
app.use(express.json());
app.use(cors());
app.use(bodyParser.json());
app.use(compression());

//db connection and listen in specific port
mongoose.connect(process.env.DB_CONNECT, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log('database connected');
        app.listen(process.env.PORT, () => console.log(`server connected to server: ${process.env.PORT}`));
    })
    .catch((err) => console.log(err.message))

// shedule the reminder and status change
// cron.schedule('*/1 * * * *', statusChange);
cron.schedule('*/1 * * * *', notify);

// Routes
app.use('/profilePic', express.static('uploads'))
app.use('/api/todolist/account', userRouter);
app.use('/api/todolist/task', auth, taskRouter);
app.use('/api/todolist/subtask', auth, subtaskRouter);
app.use('/api/todolist/notification', auth , notifyRouter);

