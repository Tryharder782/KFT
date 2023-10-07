import { observer } from 'mobx-react-lite';
import React, { useEffect, useRef, useState } from 'react';
import {ReactComponent as DeleteMessageIco} from '../../../static/deleteMessageIco.svg'
import {ReactComponent as RespondToMessageIco} from '../../../static/respondToMessageIco.svg'
import {ReactComponent as CopyMessageIco} from '../../../static/copyMessageIco.svg'
const MessageOptionList = observer(({fadingAnimation, id, messageDelete, messageRespond, messageCopy, toggleFadingAnimation, expandButtonRef, appearSide}) => {
	
	const [isVisible, setIsVisible] = useState(false);

	const ref = useRef(null)
	
	const handleClickOutside = (event) => {
		if (ref.current && !ref.current.contains(event.target) && expandButtonRef.current && !expandButtonRef.current.contains(event.target)) {
			toggleFadingAnimation();
		}
	};
	
	useEffect(() => {
		setIsVisible(!isVisible)
	}, [fadingAnimation]);
	useEffect(() => {
		document.addEventListener('click', handleClickOutside);
		return () => {
		  document.removeEventListener('click', handleClickOutside);
		};
	 }, []);
	
	return (
		<div ref={ref} className={`optionList ${isVisible ? 'visible' : ''} ${appearSide}`} >
			<div className="listItem" onClick={() => messageDelete()}> <DeleteMessageIco /> delete</div>
			<div className="listItem" onClick={messageRespond}> <RespondToMessageIco /> response</div>
			<div className="listItem" onClick={() => messageCopy()}> <CopyMessageIco /> copy to clipboard</div>
		</div>
	);
});

export default MessageOptionList;