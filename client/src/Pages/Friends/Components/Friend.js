import { observer } from 'mobx-react-lite';
import React, { useState } from 'react';
import { Image } from 'react-bootstrap';
import nopfp from '../../../static/nopfp.webp'
import FriendOptionList from './FriendOptionList';

const Friend = observer(({data, goToChat}) => {

	const [isFriendOptionsShown, setIsFriendOptionsShown] = useState(false)
	const [optionsOpacity, setOptionsOpacity] = useState(0);

	const expandOptionList = () => {
		if (!isFriendOptionsShown){
			setOptionsOpacity(1)
			setIsFriendOptionsShown(true)
		}
		else if (isFriendOptionsShown){
			setOptionsOpacity(0)
			setTimeout(() => {
				setIsFriendOptionsShown(false)
			}, 300)
		}
	}
	console.log(data)
	return (
		<div className='friend'>
			<div className="pfp"><Image src={`${data.profilePicture ? data.profilePicture : nopfp}`}/></div>
			<div className="data">
				<div className="row1 friendRow">
					<div className="userName">{data.userName}</div>
					<div className="status">@{data.status}</div>
					
				</div>
				<div className="row2 friendRow">
					<div className={`${data.isOnline ? 'userOnline' : 'userOffline' } isOnline`} >{data.isOnline === true ? 'online' : data.isOnline.updatedAt}</div>
					<div className="optionsButton" onClick={expandOptionList}>...</div>
					{isFriendOptionsShown && 
						<FriendOptionList optionsOpacity={optionsOpacity} />
					}
				</div>
				<div className="row3 friendRow">
					<div className="messageLink" onClick={() => goToChat(data.id)}>message...</div>
					<div className="lastOnline">{data.lastOnline}</div>
				</div>
			</div>
			
		</div>
	);
});

export default Friend;