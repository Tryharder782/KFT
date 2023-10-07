import { observer } from 'mobx-react-lite';
import React, { useEffect, useState } from 'react';
import { Image } from 'react-bootstrap';

const SidebarFriendItem = observer(({friend, sidebarFriendClick, lastMessage, chat}) => {
console.log(chat.id)
	return (
		<div className="item" onClick={() => sidebarFriendClick(chat.id, friend)}>
			<Image fluid={true} src={`/${friend.profilePicture}`} width={40} height={40} className="pfp" />
			<div className="col">
				<p className='userName'>{friend.userName}</p>
				<p className='lastMessage'>{lastMessage ? lastMessage.text !== '' ? lastMessage.text : 'attachments' : ''}</p>
			</div>
			{/* <div className="unreadMessagesNumber">
				<p>10</p>
			</div> */}
		</div>
	);
});

export default SidebarFriendItem;