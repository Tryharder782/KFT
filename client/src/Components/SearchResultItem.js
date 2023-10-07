import { observer } from 'mobx-react-lite';
import React from 'react';
import { Image } from 'react-bootstrap';
import friendRequestIco from '../static/friendRequest.svg'
import friendsIco from '../static/friends.svg'
import { toJS } from 'mobx';

const SearchResultItem = observer(({friend, friendRequestHandler, user}) => {
	console.log(toJS(user.friendList));

	return (
		<div className="searchResultItem">
			<Image className='userLogo' src={`/${friend.profilePicture}`} width={40} height={40} ></Image>
			<div className="userInfo">
				<div className='userName'>{friend.userName}</div>
				<div className="userStatus">status</div>
			</div>
			{friend.id === user.id && <div>You</div> }
			{friend.id !== user.id && <div className="friendRequestButton" onClick={() => friendRequestHandler(user.id,friend.id)}>
				{!user.friendList.includes(friend.id) ? <Image src={friendRequestIco} width={25} height={17} /> : <Image src={friendsIco} width={25} height={17} />}
			</div>}
		</div>
	);
});

export default SearchResultItem;