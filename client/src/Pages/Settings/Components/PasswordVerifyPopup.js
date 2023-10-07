import React, { useEffect, useRef, useState } from 'react';
import Input from '../../../Components/Input';
import { checkPassword } from '../../../http/usersApi';

const PasswordVerifyPopup = ({saveNewPassword, shown, hidePopup, user}) => {

	const [oldPassword, setOldPassword] = useState('');
	const [newPassword, setNewPassword] = useState('');
	const [newPassConf, setNewPassConf] = useState('');
	const [isOldPasswordMatched, setIsOldPasswordMatched] = useState(false);
	const [isNewPasswordMatched, setIsNewPasswordMatched] = useState(false);

	const textareaRef1 = useRef(null)
	const textareaRef2 = useRef(null)
	const textareaRef3 = useRef(null)
	const containerRef = useRef(null)
	
	const saveChanges = () => {
		if (isNewPasswordMatched) {
			if (isOldPasswordMatched) {
				saveNewPassword(newPassword)
				hidePopup()
			}
		}
	}
	const checkNewPasswordMatch = () =>{
		setIsNewPasswordMatched(prev => newPassword === newPassConf)
	}

	useEffect(() => {
		let timeout
		timeout = setTimeout(() => {
			console.log('asdf')
			if (oldPassword){
				checkPassword(user.user.id, oldPassword).then(data => {
					setIsOldPasswordMatched(data)
				})
			}
		}, 1000)
		return () => clearTimeout(timeout)
	}, [oldPassword]);
	useEffect(() => {
		if (newPassword!== ''){
			checkNewPasswordMatch()
			console.log(isNewPasswordMatched)
		}
	}, [newPassConf, newPassword]);
	useEffect(() => {
		console.log(isOldPasswordMatched)
	}, []);
	useEffect(() => {
		const handleClickOutside = (event) => {
		  if (containerRef.current && !containerRef.current.contains(event.target)) {
			 	hidePopup()
		  }
		};
  
		document.addEventListener('mousedown', handleClickOutside);
		return () => {
		  document.removeEventListener('mousedown', handleClickOutside);
		};
	 }, [containerRef, hidePopup]);

	return (
		<div className={`PasswordVerifyPopup ${shown ? 'shown': 'hidden'}`}>
			<div className="container" ref={containerRef}>
				<div className="oldPassword sheesh">
					<Input messageText={oldPassword}
						setMessageText={setOldPassword}
						textareaRef={textareaRef1}
						showEmojiPicker={false}
						showSendButton={false}
						showRecorderButton={false}
						showAttachFilesButton={false}
						validationState={isOldPasswordMatched}
						placeHolder={'old password'}
						type={'password'}
					/>
				</div>
				<div className="newPassword sheesh">
					<Input messageText={newPassword}
						setMessageText={setNewPassword}
						textareaRef={textareaRef2}
						showEmojiPicker={false}
						showSendButton={false}
						showRecorderButton={false}
						showAttachFilesButton={false}
						placeHolder={'new password'}
						type={'password'}
					/>
				</div>
				<div className="newPassConf sheesh">
					<Input messageText={newPassConf}
						setMessageText={setNewPassConf}
						textareaRef={textareaRef3}
						showEmojiPicker={false}
						showSendButton={false}
						showRecorderButton={false}
						showAttachFilesButton={false}
						validationState={isNewPasswordMatched}
						placeHolder={'confirm new password'}
						type={'password'}
					/>
				</div>
				<div className="buttons">
					<div className="button cancel" onClick={() => hidePopup()}>
						<span>cancel</span>
					</div>
					<div className="button submit" onClick={() => saveChanges()}>
						<span>save</span>
					</div>
				</div>
			</div>
		</div>
	);
};

export default PasswordVerifyPopup;