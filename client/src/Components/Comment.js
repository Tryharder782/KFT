import React, { useRef, useState } from 'react';
import { Image } from 'react-bootstrap';
import likesIco from '../static/likesIco.svg'
import sharesIco from '../static/sharesIco.svg'
import { useMediaZoom } from '../Context/MediaZoomContext';
import { format, formatDistanceToNow, parseISO } from 'date-fns';
import { ru } from 'date-fns/locale'; // Импортируйте нужную локаль (русская в данном случае)
import { likeComment, unlikeComment } from '../http/postsApi';


const Comment = ({ comment, sender, likeClickedIco, postId, userId}) => {
	const [likeState, setLikeState] = useState(comment.likedUsers.includes(userId));
	const [actualDateShown, setActualDateShown] = useState(false)
	const [likesCounter, setLikesCounter] = useState(comment.likedUsers.length);
	let timeAgo = formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true});
	let formattedDate = format(parseISO(comment.createdAt), 'HH:mm dd MMM yyyy');
	// if (timeAgo.includes("день") || timeAgo.includes("дня") || timeAgo.includes("дней")) {
	// 	timeAgo = format(parseISO(comment.createdAt), 'dd MMM', { locale: ru });
	// }
	
	const createTimeRef = useRef(null)
	const showFormattedDate = (bool) => {
		setActualDateShown(bool)
		if (bool) {
			createTimeRef.current.style.transform = 'translateY(-53%)'
		}
		else {
			createTimeRef.current.style.transform = 'translateY(0)'

		}
	}

	const {
		zoomMedia
	} = useMediaZoom()
	
	const likeStateHandler = () => {
		if (!likeState){
			likeComment(comment.id, postId, userId).then(data => setLikesCounter(data)).catch(err => console.log(err))
		}
		else if (likeState) {
			unlikeComment(comment.id, postId, userId).then(data => setLikesCounter(data)).catch(err => console.log(err))
		}
		setLikeState (!likeState)
	}
	let extension
	let fileType
	if (comment.media ){
		extension = comment.media.split('.')[comment.media.split('.').length - 1]
		fileType = extension === 'jpg' || extension === 'png' ||extension === 'webp' ? 'image' : fileType = extension === 'mp4' || extension === 'avi' ||extension === 'mkv' ? 'video' : null
		
		console.log("comment", fileType);
	}
	return (
		<div className='comment'>
			<div className="sender">
				<Image width={50} height={50} src={`/${sender.profilePicture}`}></Image>
			</div>
			
			<div className="commentBody">
				<div className="senderUserName">
					{sender.userName}
					<div className="verticalDivider" >|</div>
					<div className="createDate" onMouseEnter={() => showFormattedDate(true)} onMouseLeave={() => showFormattedDate(false)}>
						<div className="createDateContainer" ref={createTimeRef}>
							<div className='createDateItem'>{timeAgo}</div>
							<div className='createDateItem'>{formattedDate}</div>
						</div>
					</div>
				</div>

				<div className="text">
					{comment.text.split('\n').map((r, index) => <p key={index + comment.id}>{r !== '' ? r : <br />}</p>)}
				</div>
				{comment.media &&
					<div className="media">
						{fileType && fileType === 'image' &&
							<div className="mediaItem image"><img src={comment.media} onClick={() => zoomMedia([comment.media], 0)} alt="image" /></div>
						}
						{fileType && fileType === 'video' &&
							<div className="mediaItem video"><video controls src={comment.media} alt="video" /></div>
						}
					</div>
				}
				
			</div>
			<div className="actions">
				<div className="response">
					<Image src={sharesIco} width={15} height={15} />
				</div>
				<div className="like">
					<Image src={likeState ? likeClickedIco : likesIco} onClick={likeStateHandler} width={15} height={15}/>
					<div className="likesCounter">
						{likesCounter}
					</div>
				</div>
			</div>
		</div>
	);
};

export default Comment;