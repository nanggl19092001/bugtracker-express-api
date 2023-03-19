import { Socket } from "socket.io"

require('dotenv').config()

const express = require('express')
const path = require('path')
const app = express()
const cors = require('cors')
const { engine } = require('express-handlebars')
const { Server } = require('socket.io')
const DBConnection = require('../database')

const http = require('http').createServer(app)
const io = require('socket.io')(http, {
    cors: '*'
})

const routes = require('./routes/index.route')

const PORT = process.env.PORT || 3000

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({extended: false}))

app.engine('handlebars', engine())
app.set('socketio', io)
app.set('view engine', 'handlebars')
app.set('views', path.join(__dirname, '../views'))

app.use('/public', express.static(path.join(__dirname, '../public')))

io.on("connection", (socket: Socket) => {
    socket.on('join-room', (id)=>{
        socket.join(id)
    })
})

routes(app)

http.listen(PORT, () => {
    console.warn("SERVER UP PORT " + PORT)
})
