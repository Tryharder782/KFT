import { observer } from 'mobx-react-lite';
import { Component, useContext, useEffect, useState } from 'react';
import {BrowserRouter, Navigate, Route, Routes, useNavigate} from 'react-router-dom'
import { Context } from './index';
import Header from './Components/Header';
import Chats from './Pages/Chats/Chats';
import Friends from './Pages/Friends/Friends';
import Home from './Pages/Home/Home';
import Posts from './Pages/Posts/Posts';
import Profile from './Pages/Profile/Profile';
import Registration from './Pages/Registration/Registration';
import './styles/Common.scss'
import { io } from "socket.io-client";
import Settings from './Pages/Settings/Settings';
import { auth, changeOnlineStatus, checkPassword } from './http/usersApi';
import jwt_decode from 'jwt-decode';
import { toJS } from 'mobx';
import PasswordRecovery from './Pages/PasswordRecovery/PasswordRecovery';
import PasswordRecoveryAction from './Pages/PasswordRecovery/PasswordRecoveryAction';
let socket;

const App = observer(() => {
  const [socketConnect, setSocketConnect] = useState(false);
  const [redirectData, setRedirectData] = useState(null);

  const goToChat = (userId) => {
    setRedirectData({type: 'chat', userId: userId})
  }

  const socketUserStatusChange = () => {
    if (socketConnect){
      socket.emit('userStatusChange', {userId: user.user.id, status: 'online'})
    }
  }
  
  
  useEffect(() => {
    socket = io.connect();
    setSocketConnect(true)
    
    console.log("socket connect")
    socket.on('connect_error', (error) => {
      setSocketConnect(false);
      console.error('Ошибка подключения сокета:', error.message);
    });
    return (() => {
      socket.off('connect_error')
      io.disconnect(socket)
    })
  },[]);
  const { user } = useContext(Context)
  window.islogin = user.islogin === undefined

  useEffect(() => {

      auth(localStorage.getItem('token')).then(response => {
        if (response.status !== 200) {
          localStorage.clear()
          user.setIsAuth(false)
        }
      })
  }, [user]);
  
  useEffect(() => {
    if (socket.connected){
      if (user.user.length !== 0) {
        console.log('if')
        socket.emit('write_user_data_to_socket', toJS(user.user))
        changeOnlineStatus(user.user.id, true).then( data => {console.log(data)}).catch(error => alert(error));
      }
    }
  }, [user.user, socket]);
  
  return (
    <BrowserRouter>
    {user.isAuth === true ? <Header/> : <div></div> 
      }
    
      <Routes>
        <Route path='/registration' element={<Registration />} />
        <Route path='/login' element={<Registration />} />
        <Route path='/chats' element={<Chats socket={socket} redirectData={redirectData} setRedirectData={setRedirectData} socketConnect={socketConnect} setSocketConnect={setSocketConnect} />} />
        <Route path='/posts' element={<Posts socket={socket} socketConnect={socketConnect}/>} />
        <Route path='/friends' element={<Friends goToChat={goToChat} socket={socket}/>} />
        <Route path='/home' element={<Home socket={socket} socketConnect={socketConnect} />} />
        <Route path='/profile/:id' element={<Profile socket={socket} socketConnect={socketConnect} />} />
        <Route path='/settings' element={<Settings />} />
        <Route path='/recovery' element={<PasswordRecovery />} />
        <Route path='/recovery/api_key/:key' element={<PasswordRecoveryAction />} />

        <Route path='*' element={<Navigate to='/home' replace />} />
      </Routes>
    </BrowserRouter>
  );
})

export default App;
