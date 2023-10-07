import React, { useContext, useEffect, useRef, useState } from 'react';
import { Image } from 'react-bootstrap';
import Friend from './Components/Friend';
import '../../styles/Friends.scss'
import magnifierIco from '../../static/magnifier.svg'
import { useNavigate } from 'react-router-dom';
import { Context } from '../..';
import { getMultipleUsers } from '../../http/usersApi';
import { observer } from 'mobx-react-lite';
import jwt_decode from 'jwt-decode';
import { toJS } from 'mobx';
import LoadingScreen from '../../Components/LoadingScreen';

const Friends = observer(({ goToChat, socket }) => {

	const [friendList, setFriendList] = useState([]);
	const [filteredList, setFilteredList] = useState();
	const [onlineFriends, setOnlineFriends] = useState(false);
	const [onlineFriendList, setOnlineFriendList] = useState([]);
	const [search, setSearch] = useState('');
	const [isLoading, setIsLoading] = useState(true);
	const [loadedStages, setLoadedStages] = useState(0)
	const loadingStages = 1

	const freindsRef = useRef(null)
	const { user } = useContext(Context)

	const navigate = useNavigate()

	const finishLoading = () => {
		setIsLoading(false)
	}
	const redirect = (userId) => {
		console.log(userId)
		goToChat(userId)
		navigate('/chats')
	}


	//smooth appearance
	useEffect(() => {
		if (freindsRef.current && !isLoading){
			setTimeout(() => {
				freindsRef.current.style.opacity = 1;
			},100)
		}
	}, [freindsRef,isLoading])
	useEffect(() => {
		setOnlineFriendList(friendList.filter(f => f.isOnline === true))
		setFilteredList(friendList.filter(f => f.userName.toUpperCase().includes(search.toUpperCase())))
	}, [search, friendList]);

	useEffect(() => {
		user.setUser(jwt_decode(localStorage.getItem('token')))
		user.setIsAuth(true)
		getMultipleUsers(user.user.friendList).then((data) => setFriendList(friendList => data));
		setLoadedStages(prev => prev + 1)
		if (!user.isAuth) {
			navigate('/login');
		}
		console.log(toJS(user))
	}, []);
	useEffect(() => {
		console.log(friendList)
	}, [friendList]);
	useEffect(() => {
		if (!isLoading) {
			
		}
	}, [isLoading]);

	return (
		<div className='friendsContainer' ref={freindsRef}>
			{!isLoading &&
				<div className="loaded">
					<div className="filters">

						<div className="button">
							<button
								className={`${onlineFriends ? 'inactive' : 'active'}`}
								onClick={() => setOnlineFriends(!true)}>
								All friends
							</button>
						</div>

						<div className="button">
							<button
								className={`${onlineFriends ? 'active' : 'inactive'}`}
								onClick={() => setOnlineFriends(!false)}>
								Online Friends
							</button>
						</div>

					</div>
					<div className="searchBar">
						{ search === '' && 
							<Image className='magnifier' src={magnifierIco} />
						}
						<input className='input' placeholder='      search...' value={search} onChange={e => setSearch(e.target.value)} />
					</div>
					<div className="friendList">
						{
							onlineFriends
								? onlineFriendList.map(f => <Friend goToChat={redirect} data={f} key={f.userName} />)
								: filteredList ? filteredList.map(f => <Friend data={f} goToChat={redirect} key={f.userName} />)
									: friendList.map(f => <Friend data={f} goToChat={redirect} key={f.userName} />)
						}
					</div>
				</div>
			}
			{isLoading &&
				<LoadingScreen finishLoading={finishLoading} loadingStages={loadingStages} loadedStages={loadedStages} />
			}
		</div>
	);
});

export default Friends;