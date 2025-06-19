import { observer } from 'mobx-react-lite';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { Context } from '..';
import Input from './Input';
import likesIco from '../static/likesIco.svg'
import sharesIco from '../static/sharesIco.svg'
import likeClickedIco from '../static/likeClicked.svg'
import { Image } from 'react-bootstrap';
import Comment from './Comment';
import { createComment, getComments, likePost, unlikePost } from '../http/postsApi'
import { ReactComponent as PlusIco } from '../static/plus.svg'
import { toJS } from 'mobx';
import loadMore from '../static/loadMore.svg'
import inputBlockHeight from '../functions/InputBlockHeight';
import { format, formatDistanceToNow, parseISO } from 'date-fns';
import LoadingScreen from './LoadingScreen';
import { useMediaZoom } from '../Context/MediaZoomContext';
import { useNavigate } from 'react-router-dom';
import FileDisplay from './FileDisplay';

const Post = observer(({ parentRef, handleLike, postProp, author, getMultipleUsers, socket, socketConnect }) => {
	
	const navigate = useNavigate()
        const { user } = useContext(Context)
        const isGuest = user.user.role === 'GUEST'
	const [isLoading, setIsLoading] = useState(true);
	const [loadedStages, setLoadedStages] = useState(0);
	const [messageText, setMessageText] = useState('');
	const [actualDateShown, setActualDateShown] = useState(false)
	const [comments, setComments] = useState([]);
	const [likeState, setLikeState] = useState(postProp.likedUsers.includes(user.user.id));
	const [likesCounter, setlikesCounter] = useState(postProp.likedUsers.length);
	const [displayedComments, setDisplayedComments] = useState([]);
	const [commentLimit, setCommentLimit] = useState(3);
	const [commentOffset, setCommentOffset] = useState(0);
	const [shownCommentsNumber, setShownCommentsNumber] = useState(0)
	const [isVisible, setIsVisible] = useState(false);
	const [shownMedia, setShownMedia] = useState([]);
	const fileAttachRef = useRef(null);
	const [selectedFile, setSelectedFile] = useState(null);
	const [messageFile, setMessageFile] = useState([]);
	// useEffect(() => {
	// 	console.log('post', postProp.id ,'\n displayedComments', displayedComments, '\n commentOffset', commentOffset, '\n shownCommentsNumber', shownCommentsNumber, 'comments', comments)
	// }, [displayedComments, commentLimit, commentOffset, shownCommentsNumber, comments]);

	const {
		zoomMedia
	} = useMediaZoom()

	const videoRefs = Array.from({ length: 100 }, () => useRef(null));
	const textareaRef = useRef(null)
	const loadCommentsButtonRef = useRef(null)

	let timeAgo = formatDistanceToNow(new Date(postProp.createdAt), { addSuffix: true});
	let formattedDate = format(parseISO(postProp.createdAt), 'HH:mm dd MMM yyyy');
	// if (timeAgo.includes("день") || timeAgo.includes("дня") || timeAgo.includes("дней")) {
	// 	timeAgo = format(parseISO(postProp.createdAt), 'dd MMM', { locale: ru });
	// }
	
	const createTimeRef = useRef(null)
	const showFormattedDate = (bool) => {
		setActualDateShown(bool)
		if (bool) {
			createTimeRef.current.style.transform = 'translateY(-50%)'
		}
		else {
			createTimeRef.current.style.transform = 'translateY(0)'

		}
	}
	const loadingStages = 3
	const finishLoading = () => {
		// console.log('loadedStages:', loadedStages)
		setIsLoading(false)
	}
	const play = (target) => {
		if (target.current) {
			target.current.play()
		}
	}
        const handleLikeClick = () => {
                if (isGuest) {
                        alert('Only registered users can like posts');
                        return;
                }
                // Вызовите колбэк-функцию handleLike и передайте идентификатор поста
                if (!likeState) {
                        likePost(postProp.id, user.user.id).then(data => {
                                setlikesCounter(data)
                                setLikeState(true)
                        })
		}
		else if (likeState) {
			unlikePost(postProp.id, user.user.id).then(data => {
				setlikesCounter(data)
				setLikeState(false)
			})
		}
	};
	const showMoreComments = () => {
		// console.log('getComments','comments.length', comments.length, 'commentOffset', commentOffset, 'commentLimit', commentLimit)
		if (shownCommentsNumber === comments.length - 2) {
			console.log('getComments', 'post', postProp.id)
			getComments(postProp.id, commentLimit, commentOffset).then(data => {
				setComments(prev => {
					return [...prev, ...data]
				})
			}).catch(err => { console.log(err) })
			setCommentOffset(prevCommentOffset => prevCommentOffset + 3)
		}
		else {
			// console.log('elseShowMoreComments')
		}
		setShownCommentsNumber(prev => prev + 3)
	};
        const sendPostComment = (postId, replyingToCommentId) => {
                if (isGuest) {
                        alert('Only registered users can comment');
                        return;
                }
                const text = messageFormatter(messageText)
                const userId = user.user.id
                createComment(postProp.id, text, userId, null, selectedFile)
	}
	const sendMessageHandler = e => {
		if (e.key === 'Enter') {
			e.preventDefault();
			if (messageText.trim() === '') {
				// console.log('empty message')
			}
			else {
				if (!(e.shiftKey || e.ctrlKey || e.metaKey)) {
					sendPostComment()
					setMessageText('')
				}
				else {
					// console.log('shiftKey')
				}
			}

		}

	}
        const sendMessageClick = () => {
                if (messageText !== '') {
                        sendPostComment()
                        setMessageText('')

                }
        }
	const messageFormatter = (messageText) => {
		let msgRowsArr = messageText.split('\n')
		let lastLetterRow = 0
		for (let i = 0; i < msgRowsArr.length; i++) {
			if (msgRowsArr[i] != '') lastLetterRow = i
		}
		msgRowsArr.splice(lastLetterRow + 1, msgRowsArr.length - 1 - lastLetterRow)
		let finalMsg = msgRowsArr.join('\n')
		return finalMsg
	}
	const checkVisibility = () => {
		const element = loadCommentsButtonRef.current;
		const parent = parentRef.current;

		if (!element || !parent) return;

		const elementRect = element.getBoundingClientRect();
		const parentRect = parent.getBoundingClientRect();
		const isVisiblee =
			elementRect.bottom >= parentRect.top &&
			elementRect.top <= parentRect.bottom &&
			elementRect.right >= parentRect.left &&
			elementRect.left <= parentRect.right;
		setIsVisible(isVisiblee);
	};
	const collapseCommentsHandler = (isVisible) => {
		// console.log(isVisible);
		if (!isVisible) {
			setDisplayedComments(comments.slice(0, 3))
			setShownCommentsNumber(3)
		}
	}
	const redirect = (destination) => {
		navigate(destination)
	}

	//file related functions
	const handleAttachClick = () => {
		fileAttachRef.current.click();
		textareaRef.current.focus()
	};
	const handleFileChange = (event) => {
		const file = event.target.files[0];
		setSelectedFile(file);
	};
	const handleFileRemove = (file) => {
		setSelectedFile(null)
	}

	useEffect(() => {
		console.log(postProp.media)
	}, []);

	useEffect(() => {
		postProp.mediaList.map((media, index) => {
			if (
					media.split('.')[1] !== 'mp4'
					&& media.split('.')[1] !== 'avi'
					&& media.split('.')[1] !== 'gif'
					&& media.split('.')[1] !== 'png'
					&& media.split('.')[1] !== 'jpg'
				) {
				setMessageFile(prev => [...prev, media])
			}
			else {
				setShownMedia(prev => 
					postProp.mediaList.filter(media => media.split('.')[media.split('.').length - 1] !== 'mp3').slice(0,3)
				)
			}
		})
	}, [postProp.mediaList]);

	// useEffect(() => {
	// 	console.log(shownMedia)
	// }, [shownMedia]);
	

	useEffect(() => {

		if (!isLoading) {
			const handleScroll = () => {
				if (!parentRef.current) return;

				checkVisibility();
			};

			const handleResize = () => {
				if (!parentRef.current) return;

				checkVisibility();
			};

			// Проверить видимость при загрузке компонента
			checkVisibility();

			// Добавить слушатели событий для родительского элемента
			if (!parentRef.current) return;

			parentRef.current.addEventListener('scroll', handleScroll);
			window.addEventListener('resize', handleResize);
			// Убрать слушатели событий при размонтировании компонента
			return () => {
				if (!parentRef.current) return;
				parentRef.current.removeEventListener('scroll', handleScroll);
				window.removeEventListener('resize', handleResize);
			};
		}
	}, [isLoading, loadCommentsButtonRef]);
	useEffect(() => {
		setDisplayedComments(comments.slice(0, shownCommentsNumber))
		setLoadedStages(prev => prev + 1)
	}, [comments, shownCommentsNumber]);

	useEffect(() => {
		setLoadedStages(prev => prev + 1)
	}, [user]);

	useEffect(() => {
		getComments(postProp.id, 5, 0).then(data => {
			if (data.length > 0) {
				// console.log('load comments post',postProp.id, data)
				setComments(data)
				setCommentOffset(prev => 5)
				setShownCommentsNumber(prev => prev + 3)
			}

		}).then(setLoadedStages(prev => prev + 1))
	}, []);
	useEffect(() => {
		if (!isLoading) {
			inputBlockHeight(messageText, textareaRef)
		}
	}, [messageText, isLoading]);
	useEffect(() => {
		if (socketConnect) {
			socket.on(`new_comment_post${postProp.id}`, comment => {
				// console.log('newComment', comment)
				setComments(prev => [comment, ...prev])
				setCommentOffset(prev => prev + 1)
			})
		}
		socket.on(`post_${postProp.id}_liked`, data => {
			console.log(data)
			setlikesCounter(prev => data.postLikedUsers.length)
		})
		// console.log('reload')
		if (!isLoading) {
			socketConnect && socket.emit('join_room', { roomName: `post_${postProp.id}` })
		}
		return () => {
			if (socketConnect) {
				socket.off(`new_comment_post${postProp.id}`)
				socket.off(`post_${postProp.id}_liked`)
			}
		}
	}, [isLoading]);

	useEffect(() => {
		return () => {
			socket.emit('leave_room', { roomName: `post_${postProp.id}` })
		}
	}, []);
	useEffect(() => {
		// console.log('commentOffset', commentOffset)
	}, [commentOffset]);
	useEffect(() => {
		// console.log('comments', comments)
	}, [comments]);
	useEffect(() => {
		if (!isLoading) {
			collapseCommentsHandler(isVisible)
		}
	}, [isVisible]);
	useEffect(() => {
		console.log('messageFile', messageFile.length)
		// console.log('postProp', postProp)
		if (messageFile.length > 0){
			console.log(messageFile)
			let messageFile1 = messageFile[0]
			console.log(messageFile1.split('.')[1] === 'mp3' || messageFile1.split('.')[1] === 'wav')
		}
	}, [messageFile]);

	
	return (
		<div className='post' ref={loadCommentsButtonRef}>
			{!isLoading &&
				<div className="asdf">
					<div className="postContent">
						<div className="postHead">

							<div className='postAuthor'>
								<Image src={`/${author.profilePicture}`} onClick={() => redirect(`/profile/${author.id}`)} width={60} height={60} ></Image>
								<div className="column">
									<div className="userName" onClick={() => redirect(`/profile/${author.id}`)}>{author.userName}</div>
									<div className="postDate" onMouseEnter={() => showFormattedDate(true)} onMouseLeave={() => showFormattedDate(false)}>
										<div className="postDateContainer" ref={createTimeRef}>
											<div className='postDateItem'>{timeAgo}</div>
											<div className='postDateItem'>{formattedDate}</div>
										</div>
									</div>
								</div>

							</div>

							<p className='postText'>
								{postProp.text}
							</p>

						</div>

						<div className="postBody">
							{/* {postProp.mediaListList.length > 0 && postProp.mediaListList.map((m, i) =>
									<div className="mediaItem" key={i}>
										{
											(m.split('.').pop() === 'mp4' || m.split('.').pop() === 'avi') &&
											<video className='video' src={`/${m}`} ref={videoRefs[i]} onCanPlay={e => play(videoRefs[i])} controls loop>
											</video>
										}
										{
											(m.split('.').pop() === 'png' || m.split('.').pop() === 'jpg' || m.split('.').pop() === 'gif') && <Image key={i}
												// onClick={() => zoomMedia(message.media, i)}
												className='image'
												src={`/${m}`}
											/>
										}
									</div>
								)
								} */}
							{shownMedia.length > 0 &&
								<div className={`media ${postProp.mediaList.length > 3 ? 'manyMedia' : postProp.mediaList.length > 0 ? 'severalMedia' : 'noMedia'}`}>

									{shownMedia.map((m, i) =>
										<div key={i} className={`mediaItem ${postProp.mediaList.length > 3 ? 'manyMedia' : postProp.mediaList.length > 0 ? 'severalMedia' : 'noMedia'}`}>
											{
												(m.split('.').pop() === 'mp4' || m.split('.').pop() === 'avi') &&
												<video className='video' src={`/${m}`} controls>
												</video>
											}
											{
												(m.split('.').pop() === 'png' || m.split('.').pop() === 'jpg' || m.split('.').pop() === 'gif') && <Image key={i}
													onClick={() => zoomMedia(postProp.mediaList, i)}
													className='image'
													src={`/${m}`}
												/>
											}
										</div>
									)}

									{postProp.mediaList.length > 3 &&
										<div className='mediaItem seeMoreButton' onClick={() => zoomMedia(postProp.mediaList, 3)} >
											<PlusIco />
											<span className='mediaLeft'>{postProp.mediaList.length - 3}</span>

										</div>
									}
								</div>
							}
							{
								messageFile.length > 0 && messageFile.map((file,index) =>
									<div className="messageFileWrapper" key={index}>
										{
											(file.split('.')[1] === 'mp3' || file.split('.')[1] === 'wav') &&
											<audio controls>
												<source src={`/${file}`} type="audio/mpeg" />
												Ваш браузер не поддерживает аудиоэлемент.
											</audio>
										}
										{
											(file.split('.')[1] !== 'mp3' && file.split('.')[1] !== 'wav') &&
											<FileDisplay file={file} />	
										}
									</div>
								)
							}
							<div className="counters">
								<div className='likes' onClick={handleLikeClick}>
									<Image
										className={`liked ${likeState ? 'shown' : 'hidden'}`}
										width={40}
										height={40}
										src={likeClickedIco}
										alt="liked"
									/>
									<Image
										className={`notLiked ${likeState ? 'hidden' : 'shown'}`}
										width={40}
										height={40}
										src={likesIco}
										alt="not liked"
									/>
									<div className="likesCounter">{likesCounter}</div>
								</div>

								<div className='shares'>
									<Image className='img'
										width={40}
										height={40}
										src={sharesIco} alt=""
									/>
									<div className="sharesCounter">{postProp.repostedUsers.length}</div>
								</div>

							</div>
						</div>


                                                <Input messageText={messageText}
                                                        parentComponent={'post'}
                                                        handleAttachClick={handleAttachClick}
                                                        handleFileChange={handleFileChange}
                                                        handleFileRemove={handleFileRemove}
                                                        textareaRef={textareaRef}
                                                        setMessageText={setMessageText}
                                                        sendMessageHandler={sendMessageHandler}
                                                        sendMessageClick={sendMessageClick}
                                                        showEmojiPicker={true}
                                                        showSendButton={true}
                                                        showRecorderButton={true}
                                                        showAttachFilesButton={true}
                                                        fileAttachRef={fileAttachRef}
                                                        multiple={false}
                                                        selectedFiles={[selectedFile]}
                                                        disabled={isGuest}
                                                        placeHolder={isGuest ? 'only for registered users' : undefined}
                                                />
						<div className="postFoot">
							<div className="comments">
								{
									comments.length > 0 && displayedComments.map((c, index) => <Comment
										sender={c.author}
										key={index}
										comment={c}
										likeClickedIco={likeClickedIco}
										postId={postProp.id}
										userId={user.user.id}
									/>)
								}
							</div>
							{comments.length > shownCommentsNumber && comments.length !== 0 && <div className="loadComments" onClick={showMoreComments}> <Image src={loadMore} /></div>}
						</div>
					</div>
					<div className='postDivider' />
				</div>
			}
			{isLoading &&
				<LoadingScreen finishLoading={finishLoading} loadingStages={loadingStages} loadedStages={loadedStages} />
			}
		</div>
	);
});

export default Post;


