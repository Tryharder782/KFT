import React, { useState } from 'react';
import { Image } from 'react-bootstrap';
import plusIco from '../../../static/plus.svg'
import CreatePostPopup from './CreatePostPopup';
const CreatePostBlock = ({newPostText, setNewPostText, postCreateTabHide, setPostCreateTabHide, postCreate, isGuest}) => {

	
	return (
                <div className='CreatePostBlock'>
                        <div className={`buttonBlock ${isGuest ? 'disabled' : ''}`} onClick={() => !isGuest && setPostCreateTabHide(false)}>
				<p className='text'>Add a new post or create one!</p>
				<Image className='ico' src={plusIco} alt="" />
			</div>
			<CreatePostPopup newPostText={newPostText} setNewPostText={setNewPostText} postCreate={postCreate} hidden={postCreateTabHide} setHidden={setPostCreateTabHide} />
		</div>
	);
};

export default CreatePostBlock;