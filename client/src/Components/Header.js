import React, { useContext, useEffect, useRef, useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Image } from 'react-bootstrap';
import magnifierIco from '../static/magnifier.svg'

import dropDownIco from '../static/dropDownIco.svg'
import notificationBell from '../static/notificationBell.svg'
import { Context } from '..';
import { observer } from 'mobx-react-lite';
import { toJS } from 'mobx';
import { changeOnlineStatus, friendRequest, searchUsers } from '../http/usersApi';
import SearchResultItem from './SearchResultItem';
import { ReactComponent as MagnifierIco } from '../static/magnifier.svg';
import { ReactComponent as ChatIco } from '../static/chatIco.svg';
import { ReactComponent as PostsIco } from '../static/postsIco.svg';
import { ReactComponent as FriendsIco } from '../static/friendsIco.svg';
import { ReactComponent as GroupsIco } from '../static/groupsIco.svg';
import { ReactComponent as DropDownIco } from '../static/dropDownIco.svg';
import { ReactComponent as NotificationBell } from '../static/notificationBell.svg';
import { ReactComponent as HomeIco } from '../static/homeIco.svg';

const Header = observer(() => {
	const navigate = useNavigate(); // Хук для навигации
	const { user } = useContext(Context); // Получение значения контекста
	const [dropDownShow, setDropDownShow] = useState(false);
	const [searchText, setSearchText] = useState(''); // Состояние текста поиска
	const [foundUsers, setFoundUsers] = useState([]); // Состояние найденных пользователей
	const [inputFocus, setInputFocus] = useState(false); // Состояние фокуса поля ввода
	const [areUsersFound, setAreUsersFound] = useState(null); // Состояние для отображения результата поиска
	const [isScrolled, setIsScrolled] = useState(false);
	const [searchResultXCoord, setSearchResultXCoord] = useState(null);
	const [headerHidden, setHeaderHidden] = useState(false);
	const searchFieldRef = useRef(null);
	const searchResultsRef = useRef(null)
	const headerRef = useRef(null)
	const location = useLocation();


	const [currentPage, setcurrentPage] = useState();
	useEffect(() => {
		switch (location.pathname.split('/')[1]) {
			case 'chats':
				setcurrentPage('chats');
				break;
			case 'posts':
				setcurrentPage('posts')
				break;
			case 'home':
				setcurrentPage('home')
				break;
			case 'profile':
				setcurrentPage('profile')
				break;
			default:
				setcurrentPage('unknown')
				break;
		}	
	}, []);

	useEffect(() => {
		if (currentPage === 'profile') {
			let prevScroll = window.scrollY
			const handleScroll = () => {
				const scrollY = window.scrollY;	
				const scrollElement = headerRef;
				

			
			if (scrollElement.current){
				if (scrollY < prevScroll) {
					setHeaderHidden(false)
					prevScroll = scrollY
				}
				if (scrollY > prevScroll) {
					setHeaderHidden(true)
					prevScroll = scrollY
				}
			}
			};
	
			window.addEventListener('scroll', handleScroll);
	
			return () => {
				window.removeEventListener('scroll', handleScroll);
			};
		}
	}, [currentPage]);
	
	const dropDown = () => {
		setDropDownShow(prev => !prev)
	}

	const showAnimationBlock = (index) => {
		navlinkAnimationBlocks[index].current.style.transform = 'translateY(0px)';
	}
	const hideAnimationBlock = (index) => {
		navlinkAnimationBlocks[index].current.style.transform = 'translateY(60px)';
	}

	const navlinkAnimationBlocks = Array.from({length: 5}, () => useRef(null)) 

	const logOut = () => {
		changeOnlineStatus(user.user.id, false)
		localStorage.clear('token'); // Очистка локального хранилища
		user.setUser({}); // Обновление состояния пользователя
		user.setIsAuth(!user.isAuth); // Обновление состояния авторизации пользователя
		navigate('/login'); // Перенаправление на страницу входа
		setDropDownShow(false)

	};
	const redirect = (address) => {
		navigate(address)
		setDropDownShow(false)
	}


	const onFocus = () => {
		setInputFocus(true); // Обработчик фокуса поля ввода
	};
	const onBlur = () => {
		setInputFocus(false); // Обработчик потери фокуса поля ввода
	};

	useEffect(() => {
		if (searchText) {
			setFoundUsers([]); // Очистка найденных пользователей
			setAreUsersFound(null); // Сброс состояния результата поиска
			const search = setTimeout(() => {
				searchUsers(searchText).then(data => {
					setFoundUsers(data); // Установка найденных пользователей
					data.length === 0 ? setAreUsersFound(false) : setAreUsersFound(true); // Установка состояния результата поиска
				});
			}, 500);
			return () => clearTimeout(search); // Очистка таймера при изменении текста поиска
		} else if (searchText === '') {
			setAreUsersFound(null); // Сброс состояния результата поиска, если текст поиска пустой
		}
	}, [searchText]);
	useEffect(() => {
		if (localStorage.length < 1) {
			navigate('/registration')
		}
		else if (localStorage.length > 0) {
			if (localStorage.getItem('token') === 'undefined') {
				navigate('/registration')
			}
		}
	}, [localStorage]);
	useEffect(() => {
		const element = searchFieldRef.current;
		if (element) {
			const rect = element.getBoundingClientRect();
			setSearchResultXCoord(rect.left + window.pageXOffset);
		}
	}, [foundUsers]);
	useEffect(() => {
		const handleClickOutside = (event) => {
			if (searchFieldRef.current && searchResultsRef.current && !searchFieldRef.current.contains(event.target) && !searchResultsRef.current.contains(event.target)) {
				onBlur();
			}
		};

		document.addEventListener('mousedown', handleClickOutside);
		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, [searchResultsRef, searchFieldRef, setInputFocus]);
	const friendRequestHandler = (userId, friendId) => {
		userId !== friendId && !user.user.friendList.includes(friendId) && friendRequest(userId, friendId);
	};
	return (
		<div className={`header ${headerHidden ? 'hidden' : ''}`} ref={headerRef}>
			<div className="logo" onClick={() => navigate('/home')}>
				<div className="text">
					KeysForTroubles
				</div>
			</div>
			<div className="navbar">
				<NavLink to="/chats" className="navlink" onMouseEnter={() => showAnimationBlock(0)} onMouseLeave={() => hideAnimationBlock(0)}>
						<ChatIco />
						chats
					<div className="animationBlock" ref={navlinkAnimationBlocks[0]}></div>
				</NavLink>
				<NavLink to="/posts" className="navlink" onMouseEnter={() => showAnimationBlock(1)} onMouseLeave={() => hideAnimationBlock(1)}>
					<PostsIco />
					posts
					<div className="animationBlock" ref={navlinkAnimationBlocks[1]}></div>
				</NavLink>
				<NavLink to="/friends" className="navlink" onMouseEnter={() => showAnimationBlock(2)} onMouseLeave={() => hideAnimationBlock(2)}>
					<FriendsIco />
					friends
					<div className="animationBlock" ref={navlinkAnimationBlocks[2]}></div>
				</NavLink>
				<NavLink to="/home" className="navlink" onMouseEnter={() => showAnimationBlock(3)} onMouseLeave={() => hideAnimationBlock(3)}>
					<HomeIco />
					home
					<div className="animationBlock" ref={navlinkAnimationBlocks[3]}></div>
				</NavLink>
				<div className="searchBar">
					<div className="searchField" ref={searchFieldRef}>
						{!searchText && <img className="magnifier" src={magnifierIco} alt="" />}
						<input
							onFocus={onFocus}
							value={searchText}
							placeholder="       search"
							onChange={e => setSearchText(e.target.value)}
						/>
					</div>
					<div className="sr">
				{inputFocus && searchText && foundUsers.length > 0 && (
					<div className="searchResults" ref={searchResultsRef}>
						{foundUsers.map(u =>
							<SearchResultItem
								key={u.id}
								friend={u}
								user={user.user}
								friendRequestHandler={friendRequestHandler}
							/>
						)}
					</div>
				)}
				{areUsersFound === false && <div className="usersNotFound">No users found</div>}
				{inputFocus && areUsersFound === null && foundUsers.length === 0 && searchText && (
					<div className="searchResults">
						<div className="searchResultItem">
							<div className="userLogo skeleton" width={40} height={40}></div>
							<div className="userInfo">
								<p className="userName skeleton"></p>
								<p className="userStatus skeleton"></p>
							</div>
						</div>
						<div className="searchResultItem">
							<div className="userLogo skeleton" width={40} height={40}></div>
							<div className="userInfo">
								<p className="userName skeleton"></p>
								<p className="userStatus skeleton"></p>
							</div>
						</div>
						<div className="searchResultItem">
							<div className="userLogo skeleton" width={40} height={40}></div>
							<div className="userInfo">
								<p className="userName skeleton"></p>
								<p className="userStatus skeleton"></p>
							</div>
						</div>
					</div>
				)}
			</div>
				</div>
			</div>

			<div className="userProfile">

				<div className="bell">
					<Image className='ico' src={notificationBell} />
				</div>

				<div className="userName" onClick={dropDown}>
					<Image className="dropDownIco" src={dropDownIco} />
					{user.user.userName}
				</div>

				<NavLink to={`/profile/${user.user.id}`} className="profileLink">
					<Image src={`/${user.user.profilePicture}`} width={40} height={40} />
				</NavLink>
			</div>
			<div className={`dropDown ${dropDownShow ? 'shown' : 'hidden'}`}>
				<a onClick={() => redirect('/settings')} className="item">Settings</a>
				<a onClick={logOut} className="logOut item">Log out</a>
			</div>

			
		</div>
	);
});

export default Header;