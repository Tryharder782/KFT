import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import Sidebar from './Components/Sidebar';
import { Col } from 'react-bootstrap';
import { observer } from 'mobx-react-lite';
import '../../styles/Chats.scss';
import Content from './Components/Content';
import { Context } from '../..';
import { useNavigate } from 'react-router-dom';
import { check, getMultipleUsers } from '../../http/usersApi';
import { createMessage, deleteMessage, getChatMessages, getUserChats } from '../../http/chatsApi';
import jwt_decode from 'jwt-decode';  
import LoadingScreen from '../../Components/LoadingScreen';


const Chats = observer(({ socketConnect, socket, writeMessage, redirectData, setRedirectData }) => {
  const navigate = useNavigate();
  const { user } = useContext(Context);
  const [selectedChat, setSelectedChat] = useState(null);
  const [friendList, setFriendList] = useState([]);
  const [currentChatMessages, setCurrentChatMessages] = useState([]);
  const [currentChat, setCurrentChat] = useState();
  const [messagesOffset, setMessagesOffset] = useState(0);
  const [isChatSelected, setIsChatSelected] = useState(false);
  const [groups, setGroups] = useState([]);
  const [chatsData, setChatsData] = useState([]);
  const [chatList, setChatList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
	const [loadedStages, setLoadedStages] = useState(0)
	const loadingStages = 2
  
  const textareaRef = useRef(null)
  const chatContainerRef = useRef(null);
  const chatsRef = useRef(null)
  
  socketConnect && socket.on('new_message', message => {
    // console.log('lol socket', message);
    setChatsData(prevChatsData => {
      return prevChatsData.map(chat => {
        if (chat.id === message.chatId) {
          const isMessageExists = chat.messages.some((m) => m.id === message.id)
          if (isMessageExists) {
            return chat
          } else {
            return {
              ...chat,
              messages: [message, ...chat.messages]
            }
          }
        }
        return chat
      })
    })
  })
  socketConnect &&
    socket.on('updateUser', (userToken) => {
      localStorage.setItem('token', userToken);
      user.setUser(jwt_decode(userToken));
      // console.log('updateUser')
      getMultipleUsers(user.user.friendList).then((data) => setFriendList(data));
    });

  const finishLoading = () => {
    setIsLoading(false)
  }
  const handleChatScroll = useCallback(() => {
    const chatContainer = chatContainerRef.current;
    if (
      chatContainer.scrollTop * (-1) === chatContainer.scrollHeight + chatContainer.clientHeight * (-1)
    ) {
      setMessagesOffset(messagesOffset => {
        const newOffset = messagesOffset + 30;
        if (newOffset - 30 <= currentChatMessages.length) {
          getChatMessages(selectedChat, user.user.id, 30, newOffset).then(
            data => {
              // console.log(data)
              const sortedMessages = data.messages.sort((a, b) => {
                const dateA = new Date(a.createdAt);
                const dateB = new Date(b.createdAt);
                return dateB - dateA;
              });
              setCurrentChatMessages(prevMessages => prevMessages.concat(sortedMessages));
            }
          )
        };
        return newOffset;
      });
    }
  }, [selectedChat, currentChatMessages]);
  const getUserData = (id) => {
    if (id === user.user.id) {
      return {...user.user}
    }
    return friendList.find(f => f.id === id)
  }
  const sendMessagePlain = useCallback(async (text) => {
    let chatId = selectedChat;

    const formData = new FormData();
    formData.append('text', text);
    formData.append('sender', user.user.id);
    formData.append('chatId', Number(chatId));
    formData.append('respondTo', currentChat.inputRespondingTo ? currentChat.inputRespondingTo.id : null)

    if (currentChat.selectedFiles.length > 0) {
      currentChat.selectedFiles.forEach((file, index) => {
        formData.append(`media_${index}`, file);
      });
    }
    createMessage(formData)

    setInputText(chatId, ``);
    setRespond(null)
    setSelectedFiles(selectedChat, [])
  });
  const selectChat = (chat) => {
    // console.log('selectChat')
    setIsChatSelected(true);
    setSelectedChat(prevChat => chat);
  };
  const messageDelete = (id) => {
    deleteMessage(id, user.user.id).then(data => {
      setChatsData(prevChats => {
        return prevChats.map(chat => {
          if (chat.id === selectedChat) {
            return {
              ...chat,
              messages: chat.messages.filter(msg => msg.id !== id)
            };
          }
          return chat;
        });
      })
    }).catch(error => {
      alert(error.response.data.message)
    })
  }
  const messageCopy = (text) => {
    navigator.clipboard.writeText(text)
  }
  const setRespond = (respondingMessageData) => {
    setChatsData(prevChats => {
      return prevChats.map(chat => {
        if (chat.id === selectedChat) {
          return {
            ...chat,
            inputRespondingTo: respondingMessageData
          }
        }
        return chat
      })
    })
  }
  const messageRespond = (id, cancel) => {
    if (!cancel) {
      let message = { ...currentChatMessages.find(msg => msg.id === id)}
      let respondingMessageData = { ...message, sender: getUserData(message.sender) }
      setRespond(respondingMessageData)
    }
    else if (cancel) {
      // console.log('cancel')
      setRespond(null)
    }
  }
  const setInputText = (chatId, text) => {
    setChatsData(prevChatsData => {
      return prevChatsData.map(chat => {
        if (chat.id === chatId) {
          return {
            ...chat,
            inputText: text
          };
        }
        return chat;
      });
    });
  };
  const setSelectedFiles = (chatId, files) => {
    setChatsData(prevChats => {
      // console.log(setSelectedFiles)
      return prevChats.map(chat => {
        if (chat.id === chatId) {
          return {
            ...chat,
            selectedFiles: files
          }
        }
        return chat
      })
    })
  }
  const addSelectedFiles = (chatId, files) => {
    setChatsData(prevChats => {
      return prevChats.map(chat => {
        if (chat.id === chatId) {
          let prevFiles = chat.selectedFiles
          return {
            ...chat,
            selectedFiles: [...prevFiles, ...files]
          }
        }
        return chat
      })
    })
  }
  const removeFileFromSelection = (chatId, file) => {
    setChatsData(prevChats => {
      return prevChats.map(chat => {
        if (chat.id === chatId) {
          let prevFiles = chat.selectedFiles
          return {
            ...chat,
            selectedFiles: prevFiles.filter(prevFile => prevFile !== file)
          }
        }
        return chat
      })
    })
  }
  const setChatMessages = (chatId, messages) => {
    setChatsData(prev => {
      return prev.map(chat => {
        if (chat.id === chatId){
          return {
            ...chat,
            messages: messages
          }
        }
        return chat
      })
    })
  }

  const onLoadSmoothAppearence = (chatsRef, isLoading) => {
    if (chatsRef.current && !isLoading){
			setTimeout(() => {
				chatsRef.current.style.opacity = 1;
			},100)
		}
  }
  const chatRedirect = (redirectData,textareaRef,setRedirectData) => {
    if (redirectData){
      // console.log(redirectData)
      selectChat(redirectData.userId)
      if( textareaRef.current) {
        textareaRef.current.focus()
        let timeout = setTimeout(() => {
          setRedirectData(null)
        }, 3000)
        return () => {
          // console.log(' you left chat page')
          clearTimeout(timeout)
          setRedirectData(null)
        }
      }
    }
  }
  
  //smooth appearance
  useEffect(() => {
		onLoadSmoothAppearence(chatsRef, isLoading)
	}, [chatsRef,isLoading])
  
  // handle redirect to chat with specified user
  useEffect(() => {
    chatRedirect(redirectData, textareaRef, setRedirectData)
  }, [redirectData, textareaRef]);

  //clear content page on chat change ( bound with useEffect )
  useEffect(() => {
    setCurrentChatMessages(currentChat ? currentChat.messages : [])
  }, [currentChat]);

  const loadChatMedia = (chatMessages) => {
    for (let j = 0; j < chatMessages.length; j++) {
      if (chatMessages[j].media.length > 0) {
        for (let b = 0; b < chatMessages[j].media.length; b++) {
          if (chatMessages[j].media[b].split('.')[1] === ('jpg' || 'png' || 'gif')){
            const img = new Image();
            img.src = `/${chatMessages[j].media[b]}`;
            img.onload = () => {};
          }
          else if (chatMessages[j].media[b].split('.')[1] === ('mp4' || 'mkv' || 'avi')){
            const img = new Image();
            img.src = `/${chatMessages[j].media[b]}`;
            img.onload = () => {};
          }
        }
      }
    }
  }
  const loadUserChats = (user) => {
    let friends = []
    getMultipleUsers(user.friendList).then((data) => {
      setFriendList(friendList => data)
      friends = (data)
    });
    getUserChats(user.id).then(data => {
      setChatList(prev => data)
      for (let i = 0; i < data.length; i++) {
        getChatMessages(data[i].id, user.id,30, 0).then(result => setChatsData(prev => {
          loadChatMedia(result)
          let newChat = {
            userList : data[i].userList,
            friendData : data[i].userList.length === 2 ? friends.find(f => f.id === data[i].userList.find(u => u !== user.id)) : null,
            messages: result,
            id: data[i].id,
            inputText: '',
            selectedFiles: [],
            inputRespondingTo: null,
            messagesOffset: 30,
          }
          return [...prev, newChat]
        }))
      }
    })
  }
  // gets  UserChats  FriendList -> UserData,  if user is logged in, 
  useEffect(() => {
    check().then(data => {
			user.setUser(data)
			user.setIsAuth(true)
      return data
		}, reason => {
			if (!user.isAuth) { navigate('/login') }
		}).then(data => {
      loadUserChats(data)
    }).then(() => {
      setLoadedStages(prev => prev + 1)
    })
  }, [user]);

  //sets EVENT LISTENER to chat container scroll event
  useEffect(() => {
    if (isChatSelected) {
      const chatContainer = chatContainerRef.current;
      chatContainer.addEventListener('scroll', handleChatScroll);
      return () => {
        console.log('remove listener')
        chatContainer.removeEventListener('scroll', handleChatScroll);
      };
    }
  }, [isChatSelected, selectedChat]);

  //sets CURRENT CHAT
  useEffect(() => {
    setCurrentChat(chatsData.find(chat => chat.id === selectedChat))
  }, [selectedChat, chatsData]);
  
  // console logs
  useEffect(() => {
    console.log('chatsData', chatsData)
  }, [chatsData]);
  useEffect(() => {
    console.log(chatList)
  }, [chatList]);
  useEffect(() => {
    console.log('currentChat', currentChat)
  }, [currentChat, setCurrentChat]);
  useEffect(() => {
    // console.log('selectedChat', selectedChat)
  }, [selectedChat]);
  useEffect(() => {
    
  }, [chatsData]);
  useEffect(() => {
    // console.log(chatList)
  }, [chatList]);
  useEffect(() => {
  }, [friendList]);

  // const chatFriend = selectedChat.friendId ? friendList.find((f) => f.id === selectedChat.friendId) : null;


  window.currChat = currentChat


  return (
    <div className='chatsRow' style={{ display: 'flex' }} ref={chatsRef}>
        <Col style={{ width: 340, opacity: !isLoading ? 1 : 0 }}>
          <Sidebar
            groups={groups}
            friendList={friendList}
            user={user}
            selectChat={selectChat}
            chatList={chatList}
            chatsData={chatsData}
            setLoadedStages={setLoadedStages}
          />
        </Col>

      { !isLoading && isChatSelected && (
        <Col className="right">
          <Content
            chatContainerRef={chatContainerRef}

            socketConnect={socketConnect}
            socket={socket}

            currentChat={currentChat}
            chatId={selectedChat}
            userName={user.userName}
            friendList={friendList}
            messages={currentChatMessages}
            respondingMessage={currentChat && currentChat.inputRespondingTo}
            sendMessagePlain={sendMessagePlain}
            selectedChat={selectedChat}
            getUserData={getUserData}

            messageDelete={messageDelete}
            messageCopy={messageCopy}
            messageRespond={messageRespond}

            inputText={currentChat ? currentChat.inputText : ''}
            setInputText={text => setInputText(selectedChat, text)}
            addSelectedFiles={files => addSelectedFiles(selectedChat, files)}
            removeFileFromSelection={file => removeFileFromSelection(selectedChat, file)}
            setSelectedFiles={files => setSelectedFiles(selectedChat, files)}
            textareaRef={textareaRef}

            navigate={navigate}
          />
        </Col>
      )}

      {!isLoading && !isChatSelected  && (
        <Col className="right">
          <div className="text">
            <h1>Start Chatting!</h1>
            <h3>
              Start chatting by selecting your friend or group chat or if you don't have one, send a request!
            </h3>
          </div>
        </Col>
      )}
      {isLoading &&
				<LoadingScreen finishLoading={finishLoading} loadingStages={loadingStages} loadedStages={loadedStages} />
			}
    </div>
  );
});

export default Chats;