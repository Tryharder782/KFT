import React, { useState, useEffect, useRef } from 'react';
import emojiPicker from '../static/emojiPicker.svg'
import sendMessage from '../static/sendMessage.svg'
import audioMessage from '../static/audioMessage.svg'
import fileAttach from '../static/fileAttach.svg'
import { Image } from 'react-bootstrap';
import { observer } from 'mobx-react-lite';
import data from '@emoji-mart/data'
import Picker from '@emoji-mart/react'
import { ReactComponent as UnvalidatedIco } from '../static/unvalidatedIco.svg'
import { ReactComponent as ValidatedIco } from '../static/validatedIco.svg'
import { ReactComponent as XMarkThin } from '../static/XMarkThin.svg'
import FilesAttach from './FilesAttach';

const Input = observer(({
	isResponding,
	respondingMessage,
	
	messageText,
	setMessageText,
	
	sendMessageHandler,
	sendMessageClick,

	showEmojiPicker,
	showSendButton,
	showRecorderButton,
	showAttachFilesButton,

	textareaRef,
	
	inputKey,
	multiple,
	addKey,
	fileAttachRef,
	fileAddRef,
	handleAttachClick,
	handleAddClick,
	handleFileChange,
	handleFileAdd,
	handleFileRemove,

	messageRespond,
	page,
	parentComponent,
	setSelectedFiles,
	selectedFiles,
	type,
	placeHolder,
	validationState
}) => {
	const [showPicker, setShowPicker] = useState(false);
	const handleEmojiSelect = (emoji) => {
		setMessageText(messageText + emoji.native);
	};
	const togglePicker = () => {
		setShowPicker(!showPicker);
	};
	const clearSelectedFiles = () => {
		setSelectedFiles([])
		
	}
	useEffect(() => {
	}, [selectedFiles]);
	return (
		<div className={`inputContainer ${ page === 'chats' ? 'chatsInputContainer' : ''}`}>
			{page ==='chats' && selectedFiles && selectedFiles.length>0 &&
				<FilesAttach addKey={addKey} 
					fileAddRef={fileAddRef}
					handleFileAdd={handleFileAdd}
					handleAddClick={handleAddClick}
					clearSelectedFiles={clearSelectedFiles} 
					files={selectedFiles}
					handleFileRemove={handleFileRemove}
				/>}
			{respondingMessage &&
				<div className="respondingMessageBlock">
					<span className='respondingTo'>responding to:</span>
					<div className="row">
						<div className="row responseMessage">
							<div className="sender">
								{respondingMessage.sender.userName}:
							</div>
							<div className="respondingText">
								{respondingMessage.text}
								{respondingMessage.media.length > 0 ? ` attachments (${respondingMessage.media.length})` : ''}
							</div>
						</div>

						<div className="cancelResponseButton">
							<button onClick={messageRespond} className="cancelResponse"><XMarkThin /></button>
						</div>
					</div>
				</div>
			}


			<div className="input">
				{showEmojiPicker &&
					<span className='emojiPickerBtn'
						onClick={togglePicker}>
						{showPicker &&
							<div className='emojiPicker'>
								<Picker data={data} onEmojiSelect={handleEmojiSelect} />
							</div>
						}
						<Image src={emojiPicker} fluid={true} height={25} />
					</span>}
				{type !== 'password' &&
					<div className='textareaContainer'>
						
						<textarea ref={textareaRef}
							className={`textarea ${isResponding ? 'responding' : ''}`}
							value={messageText} placeholder={placeHolder ? placeHolder : 'Start typing here...'}
							onChange={e => { setMessageText(e.target.value) }}
							onKeyDown={e => {
								if (e.key === 'Enter') {
									e.preventDefault()
								}
								sendMessageHandler && sendMessageHandler(e)
							}}
						/>
					</div>
				}
				{type === 'password' &&
					<input type={type}
						ref={textareaRef}
						className='textarea'
						autoComplete='new-password'
						value={messageText}
						placeholder={placeHolder ? placeHolder : 'Start typing here...'}
						onChange={e => { setMessageText(prev => e.target.value) }}
						onKeyDown={e => {
							if (e.key === 'Enter') {
								e.preventDefault()
							}
							sendMessageHandler && sendMessageHandler(e)
						}}
					/>}
				{messageText !== '' && validationState !== undefined && (
					<div className='validationIcoBox'>
						<UnvalidatedIco className={`unvalidatedIco validationIco ${validationState ? 'hidden' : 'shown'}`} />
						<ValidatedIco className={`validatedIco validationIco ${!validationState ? 'hidden' : 'shown'}`} />
					</div>
				)}

				{showSendButton && <button className='sendMessage' onClick={sendMessageClick}>
					<Image src={sendMessage} fluid={true} height={23} />
				</button>}
				{showRecorderButton && <span className='audioMessage'>
					<Image src={audioMessage} fluid={true} height={23} />
				</span>}
				{showAttachFilesButton && (!(selectedFiles && selectedFiles.length>0) || (parentComponent === 'post' && selectedFiles[0] === null)) && <span onClick={handleAttachClick} className='fileAttach'>
					<input type="file" key={inputKey} multiple={multiple} hidden={true} onChange={handleFileChange} ref={fileAttachRef} />
					<Image src={fileAttach}  fluid={true} height={23} />
				</span>}
			</div>
		</div>
	);
});

export default Input;
