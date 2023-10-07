import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
// import Post from './Components/Post'
import Post from '../../Components/Post'
import '../../styles/Home.scss'
import { Context } from '../..';
import { useNavigate } from 'react-router-dom';
import { check, getExactUser, getMultipleUsers } from '../../http/usersApi';
import CreatePostBlock from './Components/CreatePostBlock';
import { createPost, getPosts, updatePost } from '../../http/postsApi';
import { observer } from 'mobx-react-lite';
import MediaZoomPopup from '../Chats/Components/MediaZoomPopup';


const Home = observer(({socket, socketConnect}) => {
	const [isLoading, setIsLoading] = useState(true);
	const [userList, setUserList] = useState([]);
	const [postCreateTabHide, setPostCreateTabHide] = useState(true);
	const [posts, setPosts] = useState([]);
	const { user } = useContext(Context)
	const navigate = useNavigate()
	const [newPostText, setNewPostText] = useState('');
	const homeRef = useRef(null)
	
	useEffect(() => {
		if (homeRef.current && !isLoading){
			setTimeout(() => {
				homeRef.current.style.opacity = 1;
			},100)
		}
	}, [homeRef,isLoading]);
	
	const setMessageTextHandler = (e, setMessageText) => {
		e.preventDefault();
		setMessageText(e.target.value)
	}

	const handleLike = useCallback((post) => {
		console.log(post)
		if (!post.likedUsers.includes(user.user.userName)) {
			console.log('like')
			const newLikedusers = [...post.likedUsers, user.user.userName]
			const updatedPost = { ...post, likedUsers: newLikedusers }
			console.log(updatedPost)
			updatePost(updatedPost)
		}
		else if (post.likedUsers.includes(user.user.userName)) {
			console.log('dislike')
			const newLikedusers = post.likedUsers.filter(u => u !== user.user.userName)
			const updatedPost = { ...post, likedUsers: newLikedusers }
			updatePost(updatedPost)
		}
	}, []);
	
	const postCreate = async (text, media) => {
		console.log(text, user.user.id, media)
		const formData = new FormData()
		formData.append('text', text)
		formData.append('authorId', user.user.id)
		if (media.length > 0){
			media.forEach((file, index) => {
				formData.append(`media_${index}`, file)
			})
		}
		formData.append('mediaList', media)
		if (text || media.length > 0){
			createPost(formData).then(data => {
				setPosts((prevPosts) => [data, ...prevPosts])
				setPostCreateTabHide(true)
				setNewPostText('')
			})
		}
		else {
			alert('empty post')
		}
	}
	useEffect(() => {
		console.log(newPostText)
	}, [newPostText]);
	
	useEffect(() => {
		check().then(data => {
			user.setUser(data)
			user.setIsAuth(true)
		}, reason => {
			if (!user.isAuth) { navigate('/login') }
		})

	}, []);
	useEffect(() => {
		getPosts()
			.then(data => {
				const sortedPosts = data.sort((a, b) => {
					const dateA = new Date(a.createdAt);
					const dateB = new Date(b.createdAt);
					return dateB - dateA;
				})
				setPosts(sortedPosts);
				const userIds = [...new Set(data.map(u => u.authorId))];
				if (userIds.length > 0) {
					return getMultipleUsers(userIds)
						.then(data => {
							if (userList.length === 0) {
								setUserList(data);
							}
						})
						.catch(error => console.error(error));
				}
			})
			.then(() => setIsLoading(false))
			.catch(error => console.error(error));
	}, []);

	return (
		<div className="home" ref={homeRef}>
		<MediaZoomPopup/>
			<div className='HomeContainer'>
				<CreatePostBlock 
					newPostText={newPostText} 
					setNewPostText={setNewPostText} 
					postCreateTabHide={postCreateTabHide} 
					setPostCreateTabHide={setPostCreateTabHide} 
					postCreate={postCreate} 
						
					/>
				{
					!isLoading && posts.map(p =>
						<Post
							author={userList.find(u => u.id === p.authorId)}
							setMessageTextHandler={setMessageTextHandler}
							handleLike={handleLike}
							socket={socket}
							socketConnect={socketConnect}
							postProp={p}
							key={p.id}
							parentRef={homeRef}
							getMultipleUsers={getMultipleUsers}
						/>
					)
				}
			</div>
		</div>
	);
});

export default Home;