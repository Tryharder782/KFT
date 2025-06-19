import { observer } from 'mobx-react-lite';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { Image } from 'react-bootstrap';
import { Context } from '../..';
import { toJS } from 'mobx';
import jwt_decode from 'jwt-decode';
import { checkPassword, editUser, getMultipleUsers } from '../../http/usersApi';
import { useNavigate } from 'react-router-dom';
import '../../styles/Settings.scss'
import { ReactComponent as EditIco } from '../../static/editIco.svg'
import { ReactComponent as XMark } from '../../static/XMark.svg';
import { ReactComponent as CheckMark } from '../../static/checkMark.svg';
import PasswordVerifyPopup from './Components/PasswordVerifyPopup';
import Switcher from './Components/Switcher';
import NewPfpSelectPopup from './Components/NewPfpSelectPopup';
import { sendMail } from '../../http/testApi';

const Settings = observer(() => {
	const { user } = useContext(Context)
	const [newPfpPreview, setNewPfpPreview] = useState(null);
	const [newPfp, setNewPfp] = useState(null);
	const [newUserName, setNewUserName] = useState({ state: 'blocked', value: '' });
	const [newStatus, setNewStatus] = useState({ state: 'blocked', value: '' });
	const [newBirthDate, setNewBirthDate] = useState({ state: 'blocked', value: '' });
	const [newPassword, setNewPassword] = useState(null);
	const [isPrivate, setIsPrivate] = useState(null)
	const [passwordVerifyShow, setPasswordVerifyShow] = useState(false);
	const [isPopupShown, setIsPopupShown] = useState(false);

	const fileInputRef = useRef(null)

	const selectPicture = () => {
		fileInputRef.current.click();
	}

	const confirmNewPfp = () => {
		setNewPfp(newPfpPreview)
		console.log('confirm newpfp', newPfpPreview);
	}
	const showPopup = () => {
		setIsPopupShown(true)
	}

	const changePfp = (e) => {
		const selectedFile = e.target.files[0]
		if (selectedFile) {
			console.log('newPfp preview')
			setNewPfpPreview(selectedFile)
		}
	}
	const sendTestMail = () => {
		sendMail()
	}
	const resetForms = () => {
		if (user) {
			setNewUserName(prev => ({ ...prev, value: user.user.userName }))
			const year = user.user.birthYear
			const month = user.user.birthMonth
			const day = user.user.birthDay
			const date = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
			setNewBirthDate(prev => ({ ...prev, value: date }))
			console.log(toJS(user))
			setNewStatus(prev => ({ ...prev, value: user.user.status }))
			setIsPrivate(prev => user.user.isPrivate)
		}
	}

	const navigate = useNavigate()

	const saveNewPassword = (pass) => {										// state handler as an exception as of duplication
		setNewPassword(prev => pass)
	}

	const submitChanges = () => {
		const formData = new FormData()
		if (newUserName.value !== user.user.userName) {
			formData.append('userName', newUserName.value)
		}
		formData.append('password', newPassword)
		if (newPfp !== null) {
			formData.append('pfp', newPfp)
		}
		formData.append('birthDate', newBirthDate.value)
		if (newStatus.value !== user.user.status) {
			formData.append('status', newStatus.value)
		}
		formData.append('id', user.user.id)
		formData.append('tokenVersion', user.user.tokenVersion)
		if (isPrivate !== user.user.isPrivate) {
			formData.append('isPrivate', isPrivate)
		}
		editUser(formData).then(data => user.setUser(data))
	}

	const setter = (value, setter) => {
		setter(prev => ({ ...prev, value }))
		console.log(value)
	}
	useEffect(() => {
		if (localStorage.length > 0) {
			if (localStorage.getItem('token') !== 'undefined') {
				user.setUser(jwt_decode(localStorage.getItem('token')))
				user.setIsAuth(true)
			}
		}
		if (!user.isAuth) {
			navigate('/login');
		}
	}, [localStorage]);

	useEffect(() => {
		console.log(newStatus.value)
	}, [newStatus]);
	useEffect(() => {
		setNewUserName(prev => ({ ...prev, value: user.user.userName }))
		const year = user.user.birthYear
		const month = user.user.birthMonth
		const day = user.user.birthDay
		const date = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
		setNewBirthDate(prev => ({ ...prev, value: date }))
		console.log(toJS(user))
		setNewStatus(prev => ({ ...prev, value: user.user.status }))
		setIsPrivate(prev => user.user.isPrivate)

	}, [user]);

	useEffect(() => {
		console.log('newPfpPreview', newPfpPreview)
	}, [newPfpPreview]);

	return (
		<div className='settings'>
			<NewPfpSelectPopup selectedImage={newPfpPreview} shown={isPopupShown} confirmNewPfp={confirmNewPfp} showPopup={() => setIsPopupShown(true)} hidePopup={() => setIsPopupShown(false)} selectPicture={selectPicture} />
			<div className="settingsContainer">
				<div className="pfpSettings" onClick={showPopup}>
					<Image className="pfp" src={`${newPfp ? URL.createObjectURL(newPfp) : `/${user.user.profilePicture}`}`} />
					<input type="file" className='pfpInput' ref={fileInputRef} onChange={e => changePfp(e)} />
				</div>
					{/* {	user.user.id === 1 &&
						<div className="button" style={{background: 'red', width: 100, height: 40, cursor: 'pointer'}} onClick={() => sendTestMail()}>
						send test mail
						</div>
					} */}
				<div className="grid">
					<div className="emailPreview item">
						<div className="settingName">
							Email:
						</div>
						<div className="previewBox">
							{user.user.email}
						</div>
					</div>
					<div className="phoneNumber item">
						<div className="settingName">
							Phone number
						</div>
						<div className="previewBox">
							{user.user.phoneNumber === null ? 'N/A' : user.user.phoneNumber}
						</div>
					</div>
					<div className="userNameSettings item">
						<div className="settingName">
							Username:
						</div>

						<input type="text"
							onChange={e => setter(e.target.value, setNewUserName)}
							value={newUserName.value}
							className={`input ${newUserName.state}`}
						/>
						{newUserName.state == 'blocked' && <div className="blockedState"></div>}

						<div className="editButton"
							onClick={() => setNewUserName(prev =>
							({
								...prev,
								state: prev.state === 'blocked'
									? 'unblocked'
									: 'blocked'
							})
							)}>
							<EditIco className='editIco' />
						</div>
					</div>

					<div className="statusSettings item">

						<div className="settingName">
							status:
						</div>

						<input type="text"
							value={newStatus.value ? newStatus.value : ""}
							onChange={e => setter(e.target.value, setNewStatus)}
							className="input"
						/>
						{newStatus.state == 'blocked' && <div className="blockedState"></div>}

						<div className="editButton"
							onClick={() => setNewStatus(prev =>
							({
								...prev,
								state: prev.state === 'blocked'
									? 'unblocked'
									: 'blocked'
							})
							)}>
							<EditIco className='editIco' />
						</div>
					</div>
					<div className="passwordSettings item">

						<div className="settingName">
							password:
						</div>
						<div className="placeholder"> *hidden* </div>
						<div className="editButton"
							onClick={() => { setPasswordVerifyShow(!passwordVerifyShow) }}>
							<EditIco className='editIco' />
						</div>

					</div>
					<div className="birthDateSettings item">
						<div className="settingName">
							birth date:
						</div>
						<div className="inputs">

							<input type="date"
								value={newBirthDate.value}
								onChange={e => setter(e.target.value, setNewBirthDate)}
								className="input"
							/>
							{newBirthDate.state == 'blocked' && <div className="blockedState"></div>}

						</div>
						<div className="editButton"
							onClick={() => setNewBirthDate(prev =>
							({
								...prev,
								state: prev.state === 'blocked'
									? 'unblocked'
									: 'blocked'
							})
							)}>
							<EditIco className='editIco' />
						</div>
					</div>
				</div>

				<PasswordVerifyPopup user={user} shown={passwordVerifyShow} hidePopup={() => setPasswordVerifyShow(false)} saveNewPassword={saveNewPassword} />

				<div className="isPrivateSwitcher">
					<p className='disclaimer'>Make your account private?
						<br />
						(makes it visible only for your friends)</p>
					<Switcher checked={isPrivate} setChecked={setIsPrivate} />
				</div>
				<div className="saveBlock">
					<span className='saveQuestion'>save changes?</span>

					<div className="buttons">
						<div className="reset button" onClick={resetForms}>
							<XMark />
						</div>
						<div className="submit button" onClick={submitChanges}>
							<CheckMark />
						</div>
					</div>

				</div>
			</div>

		</div>
	);
});

export default Settings;