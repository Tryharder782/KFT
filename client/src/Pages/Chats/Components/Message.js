import React, { useContext, useEffect, useRef, useState } from 'react';
import { Image } from 'react-bootstrap';
import othersMessageCorner from '../../../static/othersMessageCorner.svg'
import myMessageCorner from '../../../static/myMessageCorner.svg'
import nopfp from '../../../static/nopfp.webp'
import { ReactComponent as PlusIco } from '../../../static/plus.svg'
import { observer } from 'mobx-react-lite';
import { ReactComponent as ExpandIco } from '../../../static/expandList.svg'
import MessageOptionList from './MessageOptionList';
import { Context } from '../../..';
import { useMediaZoom } from '../../../Context/MediaZoomContext';


const Message = observer(({ noCornerAndPfp, message, classname, updatedAt, index, messageDelete, messageCopy, messageRespond, respondingMessage, getUserData, focusMessage, setLoadedStages}) => {
	if (respondingMessage) {
		// console.log(getUserData(respondingMessage.sender))
	}

	const {zoomMedia} = useMediaZoom()
	
	const texxt = message.text.replace(/\r\n/g, '\n ')
	const rows = texxt.split('\n')
	// rows = rows.map((row, index, rows) => {
	// 	if (row.length>50){
	// 		return rows.append
	// 	}
	// })
	const [respondedMessage, setRespondedMessage] = useState(null);
	const [sender, setSender] = useState(getUserData(message.sender));
	const sentTime = new Date(message.createdAt)
	const sentTimeStr = sentTime.toLocaleTimeString([], { hour: 'numeric', minute: 'numeric' })
	const [shownMedia, setShownMedia] = useState([]);
	const [isOptionsShown, setIsOptionsShown] = useState(false);
	const [fadingAnimation, setFadingAnimation] = useState(false);
	const { user } = useContext(Context)

	const expandButtonRef = useRef(null)

	const renderParagraphs = () => {
		return rows.map((row, index) => {
			// Обработка длинных слов в строке
			const words = row.split(' ');
			const processedWords = words.map((word) => {
				if (word.length > 25) { // Здесь можно задать максимальную длину слова для разделения
					return word.match(/.{1,25}/g).join(''); // Разделяем длинное слово на части с помощью дефисов
				}
				return word;
			});

			const processedRow = processedWords.join(' ');
			if (processedRow === ' ') {
				return <br key={index}></br>
			}
			return <p key={index}>{processedRow}</p>;
		});
	};
	const toggleFadingAnimation = () => {
		if (isOptionsShown) {
			setFadingAnimation(true)
			const timeout = setTimeout(() => {
				toggleIsOptionsShow()
				setFadingAnimation(false)
			}, 300)
		}
		else {
			toggleIsOptionsShow()
		}
	}
	const toggleIsOptionsShow = () => {
		setIsOptionsShown(prev => { return !prev })
	}
	const copyMesssage = () => {
		toggleFadingAnimation()
		messageCopy(message.text)
	}
	const deleteMessage = () => {
		toggleFadingAnimation()
		messageDelete(message.id)
	}
	const respondToMessage = () => {
		toggleFadingAnimation()
		messageRespond(message.id, false)
	}
	useEffect(() => {
		setShownMedia(message.media.slice(0, 3))
		
	}, [message.media]);
	useEffect(() => {
		if (respondingMessage) {
			setRespondedMessage({...respondingMessage, sender : getUserData(respondingMessage.sender)})
		}
	}, [respondingMessage]);
	return (
		<div className={`message ${classname}`}>
			{/* user profile picture (of the first of user messages before the reply) */}
			{!noCornerAndPfp && sender && <Image className='senderPfp' src={`/${sender.profilePicture}`} alt='pfp' />}
			{!noCornerAndPfp && <span className='messageCorner'><Image src={classname === 'othersMessage' ? othersMessageCorner : myMessageCorner}></Image></span>}

			{/* margin of missing user pfp (see above) */}
			{noCornerAndPfp && <div className="margin" style={{ width: 47 }}></div>}
			
			{/* message content */}
			<div style={{
				borderRadius: !noCornerAndPfp ? classname === 'othersMessage' ? '0 8px 8px 8px' : '8px 0 8px 8px' : '8px 8px 8px 8px'
			}}
				className="messageContent">
				{/* Responding message content. If message is responding to some, its content is displayed here */}
				{ 
					message.respondTo && respondedMessage && <div className="respondingMessage" onClick={() => { focusMessage(respondingMessage) }}>
						<div className="respondingMessageSender">
							{respondedMessage.sender.id !== user.user.id ? respondedMessage.sender.userName : 'You'}:
						</div>
						<div className="respondingMessageText">
							{respondedMessage.text}
							{respondedMessage.media.length > 0 ? <span style={{ fontStyle: 'italic', fontSize: 'inherit', transform: 'none' }}>, вложения({respondedMessage.media.length})</span> : ''}
						</div>
					</div>
				}
				{/* message container. It consists of text, media and creation date */}
				<div className="row">
					{/* message Text */}
					<div className={`messageText ${message.media.length > 0 ? 'withMedia' : ''}`}>
						{renderParagraphs()}

					{/* message attached media */}
						{shownMedia.length > 0 &&
							<div className={`media ${message.media.length > 3 ? 'manyMedia' : message.media.length > 0 ? 'severalMedia' : ''}`}>
								{shownMedia.map((m, i) =>
									/* Many media case. If there is more than 3 media files it is displayed in a square shape, with the button indicating how much more media files are there in message besides the displayed ones */
									<div key={i} className={`item ${message.media.length > 3 ? 'manyMedia' : message.media.length > 0 ? 'severalMedia' : ''}`}>
										{
											// video display
											(m.split('.').pop() === 'mp4' || m.split('.').pop() === 'avi') &&
											<video className='video' src={`/${m}`} controls>
											</video>
										}
										{
											//images or gifs display
											(m.split('.').pop() === 'png' || m.split('.').pop() === 'jpg' || m.split('.').pop() === 'gif') && <Image key={i}
												onClick={() => zoomMedia(message.media, i)}
												className='image'
												src={`/${m}`}
											/>
										}
									</div>
								)}
								{/* See more slider button In many media case this button opens a slider, which opens a fourth media file */}
								{message.media.length > 3 &&
									<div className='seeMoreButton' onClick={() => zoomMedia(message.media, 3)} >
										<PlusIco />
										<span className='mediaLeft'>{message.media.length - 3}</span>

									</div>
								}
							</div>
						}
						{ /* sent time display wtih media. If there is media attached to message, sent time will be displayed over a media file */}
						{(message.media.length > 0) &&

							<div className={`sentTime withMedia ${message.media.length > 3 ? 'withManyMedia' : ''}`}>
								{sentTime.getHours()}:{sentTime.getMinutes()}am
							</div>
						}

					</div>
						{ /* Message option list expand button. This button expands/collapses the message option list (see below) */}
					<div ref={expandButtonRef} className="expandButton" onClick={toggleFadingAnimation}>
						<ExpandIco />
					</div>

					{shownMedia.length < 1 && <div className="sentTime">{sentTimeStr}</div>}
				</div>
			</div>

			{ /* Message option list. Options such as message deletion, response to this message and copy in clipboard */}
			{isOptionsShown &&
				<MessageOptionList
					id={message.id}
					expandButtonRef={expandButtonRef}
					messageDelete={deleteMessage}
					messageCopy={copyMesssage}
					messageRespond={respondToMessage}
					fadingAnimation={fadingAnimation}
					toggleFadingAnimation={toggleFadingAnimation}
					appearSide={message.sender !== user.user.id ? 'left' : 'right'}
				/>
			}
		</div>
	);
});

export default Message;