import { observer } from 'mobx-react-lite';
import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Col, Row } from 'react-bootstrap';
import Sidebar from '../Chats/Components/Sidebar';
import Content from './Components/Content';
import '../../styles/Posts.scss'
import { useNavigate } from 'react-router-dom';
import { Context } from '../..';
import { check, getMultipleUsers } from '../../http/usersApi';
import ErrorComponent from '../../Components/ErrorComponent';
import jwt_decode from 'jwt-decode';
import { toJS } from 'mobx';
import { getPosts } from '../../http/postsApi';
import LoadingScreen from '../../Components/LoadingScreen';
import MediaZoomPopup from '../Chats/Components/MediaZoomPopup';
import { useMediaZoom } from './../../Context/MediaZoomContext';

const Posts = observer(({ socket, socketConnect }) => {
	const { user } = useContext(Context)
	const [friendList, setFriendList] = useState([]);
	const [posts, setPosts] = useState([]);
	const [userIdList, setUserIdList] = useState([]);
	const [userList, setUserList] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [displayedPosts, setDisplayedPosts] = useState([]);
	const [groups, setGroups] = useState([]);
	const [loadedStages, setLoadedStages] = useState(0);
	
	const postsRef = useRef(null)
	let loadingStages = 2

	let filter;

	const navigate = useNavigate()

	const finishLoading = () => {
		setIsLoading(false)
	}

	useEffect(() => {
		if (postsRef.current && !isLoading){
			setTimeout(() => {
				postsRef.current.style.opacity = 1;
			},100)
		}
	}, [postsRef,isLoading]);
	
	const postsFilter = (user) => {
		clearTimeout(filter)
		filter = setTimeout(() => {
			if (user) {
				setDisplayedPosts(prev => posts.filter(p => p.authorId === user.id))
			}
			else {
				setDisplayedPosts(prev => posts)
			}
		}, 500)
	}


	// socketConnect && socket.on('post_liked', data => {
	// 	setPosts(prevPosts => {
	// 		// Создаем новый массив, в котором изменяем нужный объект
	// 		const newPosts = prevPosts.map(obj => {
	// 			if (obj.id === data.postId) {
	// 				return { ...obj, likedUsers: data.postLikedUsers };
	// 			}
	// 			return obj;
	// 		});
	// 		return newPosts;
	// 	});
	// })
	useEffect(() => {
		setDisplayedPosts(posts)
		console.log(posts)
	}, [posts]);
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
				setUserIdList(userIds);
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
			.then(() => setLoadedStages(prev => prev + 1))
			.catch(error => console.error(error));
	}, []);
	useEffect(() => {
		user.setUser(jwt_decode(localStorage.getItem('token')))
		user.setIsAuth(true)
		getMultipleUsers(user.user.friendList).then((data) => {
			setFriendList(friendList => data)
			setLoadedStages(prev => prev + 1)
		});
		if (!user.isAuth) {
			navigate('/login');
		}
	}, []);

	return (
		<div className='postsRow' ref={postsRef}>
		<MediaZoomPopup/>
			{ !isLoading &&
				<div className="loaded">
					<Col style={{ width: 340 }}>
						{user.user.friendList !== undefined ?
							<Sidebar
								postsFilter={postsFilter}
								friendList={friendList}
								groups={groups}
							/> : <ErrorComponent />
						}
					</Col>
					<Col className='contentt'>
						<Content
							socket={socket}
							socketConnect={socketConnect}
							userList={userList}
							isLoading={isLoading}
							posts={posts}
							displayedPosts={displayedPosts}
						/>
					</Col>
				</div>}
			{isLoading &&
				<LoadingScreen finishLoading={finishLoading} loadingStages={loadingStages} loadedStages={loadedStages} />
			}
		</div>
	);
});

export default Posts;