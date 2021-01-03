const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const socket_io = require('socket.io')
var indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const { all } = require('./routes/index');
const { join } = require('path');

const app = express();

//socket.io config 
var io = socket_io();
app.io = io;

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// socket connection 
var allusers={};
var onlinelist ={};

io.on( "connection",function( socket ){
    console.log( "A user connected" );

    socket.on('username',(userdata)=>{
      allusers[socket.id]=userdata
      io.emit('usernamesent',allusers)
      console.log(socket.id)
    })

    socket.on('msg',(data)=>{
      
      io.emit('msgsent',data)
    })
    //for privatechat_____________
    socket.on('istypingprv',(data)=>{
      let userlist ={
        users: onlinelist,
        singleuser:data.username,
        roomname:data.roomname
      }
      io.emit('istypingprv',userlist)
    })
    //for group
    socket.on('istypinggrp',(username)=>{
      // console.log(username)
      let userlist ={
        users: allusers,
        singleuser:username
      }
      io.emit('istyping',userlist)
    })
   
    //private chat connection
    socket.on('create-room',(data)=>{
      socket.join(data.roomname)
      // console.log(data)
    })
    socket.on('massage',(data)=>{
      
      // console.log(data.message)
      io.sockets.in(data.roomname).emit(data.roomname, data)
    })
    //online userslist update
    socket.on('username',(userdata)=>{
      onlinelist[socket.id]=userdata
      io.emit('usernamesent',onlinelist)
      // console.log(socket.id)
    })
   //----------------------------------
   socket.on('usernamegrp',(userdata)=>{
    allusers[socket.id]=userdata
    io.emit('usernamesent',allusers)
    // console.log(socket.id)
  })
    socket.on('disconnect',()=>{

      //group disconnection userlist update
      delete allusers[socket.id]
      io.emit('usernamesent',allusers)
       console.log('User disconnected')
      //--------
     delete onlinelist[socket.id]
     io.emit('usernamesent',onlinelist)
      console.log('User disconnected')
    })
});

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
