import { observer } from 'mobx-react-lite';
import React, { useEffect, useRef, useState } from 'react';
import { Button, Image } from 'react-bootstrap';
import { useLocation } from 'react-router-dom';
import magnifierIco from '../../../static/magnifier.svg'
import SidebarFriendItem from './SidebarFriendItem';


const Sidebar = observer(({ postsFilter, groups, bgCol, user, chatList, friendList, selectChat, chatsData, setLoadedStages }) => {
	const [lastMessages, setLastMessages] = useState([]);
	const [activeFilterBtn, setActiveFilterBtn] = useState('friends');
	const [searchInput, setSearchInput] = useState('');
	const [displayedchatList, setDisplayedChatList] = useState([]);
	const [selectedChatFilter, setSelectedChatFilter] = useState(null);

	const defaultChatList = () => {
		if (currentPage === 'chats') {
			setDisplayedChatList(prev => {
				return chatList.map(chat => {
					let friendId = chat.userList.filter(u => u !== user.user.id)[0]
					let friend = friendList.find(f => f.id === friendId)
					return {
						...chat,
						friend
					}
				})
			})
		}
		else if (currentPage === 'posts') {
			setDisplayedChatList(friendList)
		}
	}
	const sidebarFriendClick = (chatId, friend) => {
		if (currentPage === 'chats') {
			selectChat(chatId)
		}
		else if (currentPage === 'posts') {
			if (selectedChatFilter === friend) {
				setSelectedChatFilter(prev => {
					postsFilter(null)
					return null
				})
			}
			else {
				setSelectedChatFilter(prev => {
					postsFilter(friend)
					return friend
				})
			}
		}
	}
	useEffect(() => {
	}, [selectedChatFilter]);
	const location = useLocation();

	useEffect(() => {
		if (chatsData) {
			setLastMessages(prev => {
				return chatsData.map(chat => {
					if (chat.messages.length > 0) {
						// console.log(chat.messages[chat.messages.length - 1])
						console.log(chat.messages[0])
						return chat.messages[0]
					}
					return 'message'
				})
			})
			setLoadedStages(prev => prev + 1)
			console.log('loaded stages + 1')
		}
		// console.log(lastMessages)
	}, [chatsData]);

	// Определение текущей страницы на основе пути
	let currentPage;
	switch (location.pathname) {
		case '/chats':
			currentPage = 'chats';
			break;
		case '/posts':
			currentPage = 'posts';
			break;
		default:
			currentPage = 'Unknown';
	}

	useEffect(() => {
		if (searchInput)
			setDisplayedChatList(prev => prev.filter(f => f.friend.userName.toUpperCase().includes(searchInput.toUpperCase())))
		else if (searchInput === '') {
			defaultChatList()
		}
	}, [searchInput]);

	useEffect(() => {
		// console.log(chatList)
		defaultChatList()
	}, [chatList,friendList]);

	return (
		<div className='sidebar' style={{ backgroundColor: bgCol }}>
			<div className='filters' >
				<Button style={{ color: activeFilterBtn === 'friends' ? 'white' : '' }} onClick={() => setActiveFilterBtn('friends')}>Friends</Button>
				<Button style={{ color: activeFilterBtn === 'groups' ? 'white' : '' }} onClick={() => setActiveFilterBtn('groups')}>Groups</Button>
			</div>
			<div className="inner">
				<div className="inputContainer">
					<input placeholder='  	search...' value={searchInput} onChange={e => setSearchInput(e.target.value)} />
					{!searchInput && <img className="magnifier" src={magnifierIco} alt="" />}
				</div>
				<div className="items">
					{
						displayedchatList !== undefined && friendList.length > 0 && activeFilterBtn === 'friends' && displayedchatList.map((c, index) => {
							return (<SidebarFriendItem friend={currentPage === 'chats' ? c.friend : c} chat={c} key={c.id} sidebarFriendClick={sidebarFriendClick} lastMessage={lastMessages[index]} />)
						})
					}
					{activeFilterBtn === 'groups' && groups.map(g =>
						<div className="item"></div>
					)}
				</div>
			</div>
		</div>
	)
});

export default Sidebar;

