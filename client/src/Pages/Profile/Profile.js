import React, { useContext, useEffect, useRef, useState } from 'react';
import Posts from '../Posts/Posts';
import Post from '../../Components/Post'
import '../../styles/Profile.scss'
import profileSettings from '../../static/profileSettings.svg'
import { observer } from 'mobx-react-lite';
import { Image as BootstrapImage } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import { Context } from '../..';
import jwt_decode from 'jwt-decode';
import { getUserPosts } from '../../http/postsApi';
import { getExactUser, getMultipleUsers } from '../../http/usersApi';
import LoadingScreen from '../../Components/LoadingScreen';
import MediaZoomPopup from '../Chats/Components/MediaZoomPopup';

const Profile = observer(({ socket, socketConnect }) => {
	const profileUserId = useParams().id

	const [visibleSettings, setVisibleSettings] = useState(false);
	const [profileUser, setProfileUser] = useState(null);
	const [userPosts, setUserPosts] = useState([]);
	const { user } = useContext(Context)
	const [isLoading, setIsLoading] = useState(true);
	const [loadedStages, setLoadedStages] = useState(0)
	const navigate = useNavigate()
	const profileHeaderRef = useRef(null)
	const userContainerRef = useRef(null)
	const scrollTarget2 = useRef(null)
	const profileRef = useRef(null)

	const [mediaZoomPopupHidden, setMediaZoomPopupHidden] = useState(true);
	const [mediaList, setMediaList] = useState([]);
	const [currentMedia, setCurrentMedia] = useState(null);
	const [counterForPopup, setCounterForPopup] = useState(0);

	const zoomMedia = (media, mediaIndex) => {
		setMediaList(prev => media)
		// console.log(media)
		setCurrentMedia(prev => mediaIndex)
		// console.log(mediaIndex)
		setMediaZoomPopupHidden(false)
		setCounterForPopup(counterForPopup + 1)
	}
	const zoomPopupHide = () => {
		setMediaZoomPopupHidden(true)
	}

	const loadingStages = 3

	const finishLoading = () => {
		console.log('loadedStages:', loadedStages)
		setIsLoading(false)
	}



	useEffect(() => {
		if (profileRef.current && !isLoading) {
			setTimeout(() => {
				profileRef.current.style.opacity = 1;
			}, 100)
		}
	}, [profileRef, isLoading]);
	useEffect(() => {
		if (userContainerRef.current && !isLoading) {
			setTimeout(() => {
				console.log('scroll 1')
				userContainerRef.current.scrollIntoView({ behavior: 'auto', block: 'start' })
			}, 20)
			setTimeout(() => {
				console.log('scroll 2')
				scrollTarget2.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
			}, 20)
		}
	}, [userContainerRef, isLoading]);
	useEffect(() => {
		user.setUser(jwt_decode(localStorage.getItem('token')))
		user.setIsAuth(true)
		if (!user.isAuth) {
			navigate('/login');
		}
		if (profileUserId === user.user.id) {
			setProfileUser(user.user)
		}
	}, [user]);
	useEffect(() => {
		if (profileUser) {
			getUserPosts(profileUser.id)
				.then((data) => {
					setUserPosts(data)
					console.log('profile user posts loaded successfully')
					setLoadedStages(prev => prev + 1)
				})
				.catch((error) => {
					alert(error)
				})
		}
	}, [profileUser]);
	useEffect(() => {
		if (profileUserId) {
			getExactUser(profileUserId, user.user.id).then((data) => {
				setProfileUser(data)
				console.log('profile user loaded successfully')
				setLoadedStages(prev => prev + 1)
			})
		}
	}, [profileUserId]);

	useEffect(() => {
		if (profileUser) {
			console.log('starting loading profile user header, url:', profileUser.profileHeaderPicture)
			const img = new Image();
			img.src = `/${profileUser.profileHeaderPicture}`;
			img.onload = () => {
				// Когда изображение загружено, обновите состояние
				console.log('profile user header loaded successfully')
				setLoadedStages(prev => prev + 1)
			};
		}
	}, [profileUser]);


	return (
		<div className="profileContainer">
			<MediaZoomPopup
				currentMediaIndex={currentMedia}
				mediaList={mediaList}
				hidden={mediaZoomPopupHidden}
				hidePopup={zoomPopupHide}
				counterForPopup={counterForPopup}
			/>
			{!isLoading &&
				<div className="profile" ref={profileRef}>
				<div className="gradient"></div>
					{profileUser &&
						<div>
							<div className="pfpBig">
								<BootstrapImage fluid={true} width={"100%"} src={`/${profileUser.profileHeaderPicture}`} alt="pfp" />
								{/* <div className="pfpMock"></div> */}
							</div>

							<div className='userContainer' >
								<div ref={userContainerRef} className='scrollTarget'></div>
								<div ref={scrollTarget2} className='scrollTarget2'></div>
								<div className="underPfp">

									<div className="profileInfo" >
										<span className='userName' >
											<img src={`/${profileUser.profilePicture}`} className='pfp' alt='pfp' />
											{profileUser.userName}
											<div onClick={() => visibleSettings
												? setVisibleSettings(false)
												: setVisibleSettings(true)}>
												{profileUser.id === user.user.id && <BootstrapImage fluid={true} src={profileSettings} alt="settings" className='settingsIco' />}
											</div>
										</span>
										<br />
										<span className='status'>@{profileUser.status}</span>
									</div>
									{userPosts &&
										<div className="userPosts">
											{
												userPosts.map(p => <Post postProp={p}
													author={profileUser}
													getMultipleUsers={getMultipleUsers}
													key={p.id}
													socket={socket}
													zoomMedia={zoomMedia}
													socketConnect={socketConnect}
													parentRef={profileRef}
												/>)
											}
										</div>
									}
									{userPosts.length === 0 &&
										<div className="noPosts">
											<div className="text">
												There is no posts yet...
											</div>
										</div>
									}
									
								</div>
							</div>
						</div>
					}
					
				</div>
			}
			{isLoading &&
				<LoadingScreen finishLoading={finishLoading} loadingStages={loadingStages} loadedStages={loadedStages} />
			}
		</div>
	);
});

export default Profile;