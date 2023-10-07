const express = require('express')
const sequelize = require('./db')
const app = module.exports = express();
const cors = require('cors')
const path = require('path')
const fileUpload = require('express-fileupload')
const filePathMiddleware = require('./middlewares/filePathMiddleware')
const errorHandler = require('./middlewares/ErrorHandlingMiddleware')
const router = require('./routes')
const server = require("http").createServer(app)
const http = require('http')
const { Server } = require('socket.io');
const { strict } = require('assert');
const userController = require('./controllers/userController');
const PORT = process.env.PORT
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;


app.use(cors())
const io = new Server(server, {
	cors: {
		origin: 'http://localhost:3000',
		methods: ['GET', 'POST'],
	},
})

let counter = 0





global.io = io

io.on('connect', socket => {
	console.log(`\n user ${socket.id} connected \n`);
	global.socket = socket
	counter++;
	console.log(counter);
	socket.on('write_user_data_to_socket', (user) => {
		socket.user = user
		console.log('write_user_data_to_socket')
	})
	socket.on('online', () => {
		userController.update({})
	})
	socket.on('join_room', ({roomName}) => {
		socket.join(roomName)
		console.log('user joined room', roomName);
	})
	socket.on('leave_room', ({roomName}) => {
		socket.leave(roomName)
		console.log('user left room', roomName);
	})
	socket.on('disconnect', reason => {
		if (socket.user){
			console.log(socket.user)
			userController.changeOnlineStatus({params:{userId : socket.user.id, isOnline: false}},null, null)
		}
		console.log(`user ${socket.id} disconnected due to ${reason}`);
		counter--;
		console.log(counter);
	})

})
console.log(counter);
app.set('io', io)
app.use(express.json())
app.use(filePathMiddleware(path.resolve(__dirname, './temp')))
app.use(express.static(path.resolve(__dirname, 'static')))
app.use(fileUpload({
	useTempFiles: true,
	tempFileDir: path.resolve(__dirname, './temp')
}))
app.use('/api', router)
app.use (express.static(path.join(__dirname, 'client/build')))
app.get("*", (req, res) => {
	res.sendFile(path.join(__dirname, 'client/build/index.html'))
})
app.use(errorHandler)



const start = async () => {
	try {
		await sequelize.authenticate()
		await sequelize.sync()
		server.listen(PORT, () => console.log(`Server started at PORT ${PORT}`))
	} catch (e) {
		console.log(e)
	}
}
start()
