import { observer } from 'mobx-react-lite';
import React, { useContext, useDeferredValue, useEffect, useRef, useState } from 'react';
import { Image } from 'react-bootstrap';
import Message from './Message';
import Input from '../../../Components/Input';
import { Context } from '../../..';
import inputBlockHeight from '../../../functions/InputBlockHeight';
import MediaZoomPopup from './MediaZoomPopup';
import { useMediaZoom } from './../../../Context/MediaZoomContext';

const Content = observer(({
	chatContainerRef,
	socketConnect,
	socket,
	newChat,
	friendList,
	messages,
	sendMessagePlain,
	messageDelete,
	messageCopy,
	messageRespond,
	inputText,
	setInputText,
	addSelectedFiles,
	removeFileFromSelection,
	respondingMessage,
	setSelectedFiles,
	currentChat,
	selectedChat,
	getUserData,
	focusShift,
	textareaRef,
	navigate
}) => {
	const [cpntMntd, setCpntMntd] = useState(false)

	const messagesRefs = useRef([])
	const bottom = useRef(null)
	const fileAttachRef = useRef(null);
	const fileAddRef = useRef(null);

	const { user } = useContext(Context)
	const [inputKey, setAttachKey] = useState(Date.now()); // Используем текущую дату в качестве ключа
	const [addKey, setAddKey] = useState(Date.now()); // Используем текущую дату в качестве ключа
	const [chatFriend, setChatFriend] = useState(null);
	
	const chatsContainerRef = useRef(null)
	
	const focusMessage = (message) => {
		let index = messages.indexOf(message);
		console.log('index:', index, 'message', message);
		messagesRefs.current[index].scrollIntoView({
			behavior: 'smooth',
			block: 'center',
			inline: 'nearest'
		});
		messagesRefs.current[index].style.transition = '0.3s ease';
		messagesRefs.current[index].style.backgroundColor = '#1D1D1D';

		setTimeout(() => {
			messagesRefs.current[index].style.backgroundColor = 'transparent';
		}, 1000);
	};
	const handleAttachClick = () => {
		fileAttachRef.current.click();
		textareaRef.current.focus()
	};
	const handleAddClick = () => {
		fileAddRef.current.click();
		textareaRef.current.focus()
	};
	const handleFileChange = (event) => {
		const files = Array.from(event.target.files);
		setSelectedFiles(files);
		setAttachKey(Date.now()); // Изменяем ключ для создания нового элемента input
	};
	const handleFileAdd = (event) => {
		const files = Array.from(event.target.files);
		addSelectedFiles(files);
		setAddKey(Date.now()); // Изменяем ключ для создания нового элемента input
	};
	const handleFileRemove = (file) => {
		removeFileFromSelection(file)
	}
	const socketSendMessageHandler = () => {
		socket.emit('send_message', inputText)
	}
	const sendMessageHandler = (e, send) => {

		if (e.key === 'Enter' && inputText.trim() === '') {
			e.preventDefault();
		}
		if (e.key === 'Enter' && (inputText.trim() !== '' || currentChat.selectedFiles.length > 0) && !e.shiftKey) {
			e.preventDefault();
			sendMessagePlain(messageTextEndCutter(inputText))
		}
		if (e.key === 'Enter' && inputText.trim() !== '' && e.shiftKey) {
			setInputText(`${inputText}\n`)
		}
	}
	const sendMessageClick = () => {
		if (inputText.trim() !== '' || currentChat.selectedFiles.length > 0) {
			sendMessagePlain(messageTextEndCutter(inputText))
			// console.log(selectedFiles, selectedFiles instanceof FileList)
		}
	}
	const messageTextEndCutter = (messageText) => {
		let msgRowsArr = messageText.split('\n')
		let lastLetterRow = 0
		for (let i = 0; i < msgRowsArr.length; i++) {
			if (msgRowsArr[i] != '') lastLetterRow = i
		}
		msgRowsArr.splice(lastLetterRow + 1, msgRowsArr.length - 1 - lastLetterRow)
		let finalMsg = msgRowsArr.join('\n')
		// console.log('rows:',msgRowsArr.length,'\nlast letter row:', lastLetterRow, 'final msg:', finalMsg)
		return finalMsg
	}
	
	useEffect(() => {
		if (chatsContainerRef.current){
			chatsContainerRef.current.style.opacity = 1
		}
	}, [chatsContainerRef]);
	useEffect(() => {
		if (cpntMntd) bottom.current.scrollIntoView({ behavior: 'auto' })
		if (!cpntMntd) { bottom.current.scrollIntoView({ behavior: 'auto' }); setTimeout(() => { setCpntMntd(true) }, 2000) }
	}, []);
	useEffect(() => {
		inputBlockHeight(inputText, textareaRef)
		console.log(inputText)
	}, [inputText, textareaRef]);
	useEffect(() => {
		console.log(currentChat)
	}, [currentChat]);
	useEffect(() => {
		if (currentChat){
			setChatFriend(currentChat.friendData)
			console.log(chatFriend)
		}
	}, [currentChat]);
	useEffect(() => {
		console.log(friendList)

	}, [friendList]);
	return (
		<div className='chatsContent' ref={chatsContainerRef}>
			<MediaZoomPopup/>
			<div className="chat">
				<div className="container" >
					{
						chatFriend &&
						<div className='chatHeader' onClick={() => {navigate(`/profile/${chatFriend.id}`)}}>
							<Image src={`/${chatFriend.profilePicture}`} width={40} height={40} />
							<div className="chatName">{chatFriend.userName}</div>
						</div>
					}
					<div className="messages" ref={chatContainerRef}>
						<div ref={bottom}></div>
						{
							messages && messages.map((m, index) =>
								<div key={m.id} ref={el => messagesRefs.current[index] = el} >
								
									<Message
										focusMessage={focusMessage}
										getUserData={getUserData}
										respondingMessage={m.respondTo !== null ? messages.find(msg => msg.id === m.respondTo) : null}
										messageDelete={messageDelete}
										messageCopy={messageCopy}
										messageRespond={messageRespond}
										classname={m.sender === user.user.id ? 'myMessage' : 'othersMessage'}
										message={m}
										index={index}
										noCornerAndPfp={messages[index + 1] && messages[index + 1].sender === m.sender}
									/>
								</div>
							)
						}
						<div style={{ marginTop: 'auto' }}></div>
					</div>
					<Input
						isResponding={respondingMessage !== null}
						respondingMessage={respondingMessage}

						messageText={inputText}
						setMessageText={setInputText}

						sendMessageHandler={sendMessageHandler}
						sendMessageClick={sendMessageClick}

						showEmojiPicker={true}
						showSendButton={true}
						showRecorderButton={true}
						showAttachFilesButton={true}

						textareaRef={textareaRef}

						inputKey={inputKey}
						addKey={addKey}
						fileAttachRef={fileAttachRef}
						fileAddRef={fileAddRef}
						handleAttachClick={handleAttachClick}
						handleAddClick={handleAddClick}
						handleFileChange={handleFileChange}
						handleFileAdd={handleFileAdd}
						handleFileRemove={handleFileRemove}

						messageRespond={() => messageRespond(null, true)}
						page='chats'
						setSelectedFiles={setSelectedFiles}
						selectedFiles={currentChat ? currentChat.selectedFiles : null}
					/>
				</div>
			</div>
		</div>
	);
});

export default Content;

