import React, { useEffect, useRef } from 'react';

const FriendOptionList = ({optionsOpacity}) => {
	const ref = useRef(null)
	const setOpacity = (opacity) => {
		ref.current.style.opacity = opacity
		ref.current.style.top = '-50px'
	}
	useEffect(() => {
		ref.current.style.transition = '0.3s ease'
		ref.current.style.opacity = 0
		ref.current.style.top = '-100px'

		setTimeout(() => {
			setOpacity(optionsOpacity)
		}, 300)
	}, [optionsOpacity]);
	return (
		<div ref={ref} className='friendOptionList'>
			<div className="removeFriendBtn item">remove from friends</div>
		</div>
	);
};

export default FriendOptionList;