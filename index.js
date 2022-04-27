const express = require('express')
const app = express()
const port = 3000
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const { User } = require("./models/Users")
const { auth } = require("./middleware/auth")

const config = require('./config/key')

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(cookieParser());

const mongoose = require('mongoose')
mongoose.connect(config.mongoURI).then(() => console.log('MongoDB Connected'))
.catch(err => console.log(err))

app.get('/', (req, res) => {
  res.send('Hello World! Welcome')
})

app.post('/api/users/register', (req, res) => {
 
        const user = new User(req.body)

        user.save((err, userInfo) => {
            if(err) return res.json({sucess: false, err })
            return res.status(200).json({
                success: true
            })
        })

})

app.post('/api/users/login', (req, res) => {
  console.log('test', req.body)
  User.findOne({email: req.body.email}, (err, user) => {
    if(!user){
      return res.json({
        loginSuccess: false,
        message: "There is no user registered"
      })
    } 
    user.comparePassword(req.body.password,(err, isMatch) => {
      if(!isMatch){
        console.log('test7')
        return res.json({loginSuccess: false, message: "Password is wrong"})
      }

      user.generateToken((err, user) => {
        if(err) return res.status(400).send(err);
        res.cookie("x_auth", user.token).status(200).json({loginSuccess: true, userId: user._id})
      })

    })
  })
})

app.get('/api/users/auth', auth , (res, req) => {
  res.status(200).json({
    _id: req.user._id,
    isAdmin: req.user.role === 0 ? true: false,
    isAuth: true,
    email: req.user.email,
    name: req.user.name,
    lastname: req.user.lastname,
    role: req.user.role,
    image: req.user.image,
  })
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
