
const express = require('express')
const mongoose = require('mongoose')

const userauthRoutes = require('./routes/userauthRoutes')
const creatorauthRoutes = require('./routes/creatorauthRoutes')
const userRoutes = require('./routes/userRoutes')
const { getUsername } = require('./middleware/userauthMiddleware')
const { getCreatorChannelName } = require('./middleware/creatorauthMiddleware') // Import getCreatorChannelName middleware
const cookieParser = require('cookie-parser')


const app = express();

//app.use(express.static('views'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser())

app.set('view engine', 'ejs')

const port = 3000;

mongoose.connect('mongodb+srv://innovationx:innovationx@cluster0.mdiegzg.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0')
.then(
  app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  }))
.catch((err) => console.log(err))

app.use(getUsername); 
app.use(userRoutes);
app.use(userauthRoutes);
app.use(getCreatorChannelName); 
app.use(creatorauthRoutes); 
