import { toJS } from 'mobx';
import { observer } from 'mobx-react-lite';
import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Context } from '../..';
import { check, login, registration } from '../../http/usersApi';
import '../../styles/Registration.scss'

const Registration = observer(() => {

	const navigate = useNavigate()
	
	const [isLogin, setIsLogin] = useState(true);
	const [firstName, setFirstName] = useState({ value: '', isWrong: null });
	const [lastName, setLastName] = useState({ value: '', isWrong: null });
	const [emailAddress, setEmailAddress] = useState({ value: '', isWrong: null });
	const [userName, setUserName] = useState({ value: '', isWrong: null });
	const [password, setPassword] = useState({ value: '', isWrong: null });
	const [birthYear, setBirthYear] = useState(2000);
	const [birthMonth, setBirthMonth] = useState(1);
	const [birthDay, setBirthDay] = useState(1);
	const [phoneNumber, setPhoneNumber] = useState('');
	const { user } = useContext(Context)
	const [passwordStageActive, setPasswordStageActive] = useState(false);
	const [loginEmail, setLoginEmail] = useState('');
	const [loginPassword, setLoginPassword] = useState('');

	console.log(user.isAuth);
	
	const redirect = (address) => {
		navigate(`/${address}`)
	}
	
	const checkField = (string) => {
		if (string !== '') {
			console.log(firstName.isWrong);
			if (string.startsWith("-")) return true
			// if (string.startsWith('_')) return false
			let string2 = string.replace(/[^A-z_-]/g, '')
			string2 = string2.replace('^', '')
			if (string2 === string) return false
		}
		return true
	}
	const checkEmail = (string) => {
		let string2 = string.replace(/[^A-z0-9_@.-]/g, '')
		string2 = string2.replace('^', '')
		const length = string.split('').length
		const hasAt = string.split('').includes('@')
		const indexOfAt = string.split('').indexOf('@')
		const check = string.split('')[indexOfAt+1]!=='.' && string.split('')[indexOfAt+1]!=='@'
		const hasDot = string.split('').includes('.')
		const indexOfDot = string.split('').lastIndexOf('.')
		console.log(length>+1)
		if (string2 === string && hasAt && hasDot && length>indexOfAt+1 && indexOfDot-indexOfAt>1 && check && indexOfAt!==0) return false
		return true
	}
	
  
	//!transition to password input
	const nextHandler = () => {
		let counter = 0;
		if (!checkField(firstName.value)) {
			setFirstName({...firstName, isWrong : false})
			counter++}
		else {
			setFirstName({...firstName, isWrong : true})
			setTimeout(() => {
				setFirstName({...firstName, isWrong : false})
			},2000)
		}
		if (!checkField(lastName.value)) {
			setLastName({...lastName, isWrong : false})
			counter++}
		else{
			setLastName({...lastName, isWrong : true})
			setTimeout(() => {
				setLastName({...lastName, isWrong : false})
			},2000)
		}
		if (!checkEmail(emailAddress.value)) {
			setEmailAddress({...emailAddress, isWrong : false})
			counter++}
		else {
			setEmailAddress({...emailAddress, isWrong : true})
			setTimeout(() => {
				setEmailAddress({...emailAddress, isWrong : false})
			},2000)
		}
		if (counter===3){
			passwordStageActive ? setPasswordStageActive(false) : setPasswordStageActive(true)
		}
	}
	
	//!send data to server and create new user
	const registerHandler = () => {
		let counter = 0;
		if (!checkField(userName.value) && userName.value.split('').length >= 4) {
			setUserName({ ...userName, isWrong: false })
			counter++
		}
		else {
			setUserName({ ...userName, isWrong: true })
		}
		if (password.value.split('').length >= 8) {
			setPassword({ ...password, isWrong: false })
			counter++
		}
		else {
			setPassword({ ...password, isWrong: true })
		}
		if (counter === 2) {
			const formData = new FormData()
			formData.append("firstName", firstName.value)
			formData.append("lastName", lastName.value)
			formData.append("email", emailAddress.value)
			formData.append("birthYear", Number(birthYear))
			formData.append("birthMonth", Number(birthMonth))
			formData.append("birthDay", Number(birthDay))
			formData.append("phoneNumber", Number(phoneNumber))
			formData.append('userName', userName.value)
			formData.append('password', password.value)
			registration(formData).then(data => {
				console.log(data);
				user.setUser(data)
				user.setIsAuth(true)
				navigate('/home')
			})
		}
	}
	const loginHandler = async () => {
		try {
			let data
			const formData = new FormData()
			formData.append('email', loginEmail)
			formData.append('password', loginPassword)
			data = await login(formData)
			console.log(data);
			user.setUser(data)
			user.setIsAuth(true)
			navigate('/home')
		} catch (e) {
			alert(e.response.data.message)
			console.log(e)
		}
	}

	console.log(toJS(user));
	// ! save user Data in Store and localStorage
	// useEffect(() => {
	// 	check().then(data => {
	// 		user.setUser(data)
	// 		user.setIsAuth(true)
	// 	})

	// }, []);
	useEffect(() => {
		
	}, [phoneNumber]);
	return (
		<div className='registrationContainer'>
			{
				!isLogin && <div className="registration">
					<div className="title">
						<div className="mainTitle">
							Keys For Troubles
						</div>
						<div className="subTitle">
							Registration
						</div>
						<div className="description">
							Tell us a bit about yourself
						</div>
					</div>
					<div className="inputs" style={passwordStageActive === false ? { transform: 'translateX(25%)' } : { transform: 'translateX(-25%)' }}>
						<div className="stage1" >
							<div className="col1">
								<div className={firstName.isWrong ? 'item wrongInput' : 'item'}>
									<p>First name {firstName.isWrong ? '(Incorrect format)': ''}</p>
									<input value={firstName.value} onChange={e => setFirstName({ ...firstName, isWrong: false, value: e.target.value })} />
								</div>
								<div className={lastName.isWrong ? 'item wrongInput' : 'item'}>
									<p>Last name {lastName.isWrong ? '(Incorrect format)': ''}</p>
									<input value={lastName.value} onChange={e => setLastName({ ...lastName, isWrong: false, value: e.target.value })} />
								</div>
								<div className={emailAddress.isWrong ? 'item wrongInput' : 'item'}>
									<p>Email {emailAddress.isWrong ? '(Incorrect format)': ''}</p>
									<input value={emailAddress.value} autoComplete='username' onChange={e => setEmailAddress({ ...emailAddress, isWrong: false, value: e.target.value })} />
								</div>
							</div>

							<div className="col2">

								<div className="item phoneNumber">
									<p>Phone number (optional)</p>
									<div className="input">
									{phoneNumber && <span className='plus'>+</span>}
									<input type='number' value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} />
									</div>
								</div>
								<div className="item birthDate">
									<label htmlFor="birthDate">Birth date:</label>
									<div className="select-wrapper">
										<select value={birthDay} onChange={e => setBirthDay(Number(e.target.value))} name="birthDay" className='birthDay' id="birthDate">
											<option value={1}>1</option>
											<option value={2}>2</option>
											<option value={3}>3</option>
											<option value={4}>4</option>
											<option value={5}>5</option>
											<option value={6}>6</option>
											<option value={7}>7</option>
											<option value={8}>8</option>
											<option value={9}>9</option>
											<option value={10}>10</option>
											<option value={11}>11</option>
											<option value={12}>12</option>
											<option value={13}>13</option>
											<option value={14}>14</option>
											<option value={15}>15</option>
											<option value={16}>16</option>
											<option value={17}>17</option>
											<option value={18}>18</option>
											<option value={19}>19</option>
											<option value={20}>20</option>
											<option value={21}>21</option>
											<option value={22}>22</option>
											<option value={23}>23</option>
											<option value={24}>24</option>
											<option value={25}>25</option>
											<option value={26}>26</option>
											<option value={27}>27</option>
											<option value={28}>28</option>
											<option value={29}>29</option>
											<option value={30}>30</option>
											<option value={31}>31</option>
										</select>
									</div>
									<div className="select-wrapper">
										<select value={birthMonth} onChange={e => setBirthMonth(Number(e.target.value))} name="birthMonth" className='birthMonth' id="birthMonth">
											<option value={1}>jan</option>
											<option value={2}>feb</option>
											<option value={3}>mar</option>
											<option value={4}>apr</option>
											<option value={5}>may</option>
											<option value={6}>jun</option>
											<option value={7}>jul</option>
											<option value={8}>aug</option>
											<option value={9}>sep</option>
											<option value={10}>oct</option>
											<option value={11}>nov</option>
											<option value={12}>dec</option>
										</select>
									</div>
									<div className="select-wrapper">
										<select value={birthYear} onChange={e => setBirthYear(Number(e.target.value))} name="birthDay" className='birthYear' id="birthDate">
											{[...Array(101).keys()].map(e =>
												<option key={e} value={Number(e + 1922)}>{Number(e + 1922)}</option>
											)}
										</select>
									</div>
								</div>
							</div>
						</div>
						<div className="stage2" >
							<div className="column">
								<div className={userName.isWrong ? 'item userName wrongInput' : 'item userName'}>
									<p>Username</p>
									<input value={userName.value} tabIndex={-1} onChange={e => setUserName({ ...userName, value: e.target.value })} />
								</div>
								<div className={password.isWrong ? 'item password wrongInput' : 'item password'}>
									<p>Password:</p>
									<input type='password' className={password.isWrong === true ? 'wrongInput' : ''} value={password.value} onChange={e => setPassword({ ...password, value: e.target.value })} />
								</div>
							</div>
						</div>
					</div>
					<div className="submit">
						<button style={{ marginRight: passwordStageActive ? '30px' : '0' }} onClick={() => nextHandler()}>{!passwordStageActive ? "Next" : "Back"}</button>
						<button style={{ display: passwordStageActive ? "inline-block" : 'none' }} onClick={() => registerHandler()}>Register</button>
					</div>
					<div className="links">
						<a onClick={() => setIsLogin(!isLogin)}>Have an account? Log in</a>
					</div>
				</div>
			}

			{isLogin && <div className="login">
				<div className="title">
					<div className="mainTitle">Keys For Troubles</div>
					<div className="subTitle">Welcome back!</div>
				</div>
				<div className="inputs">
					<div className="item">
						<p>Email:</p>
						<input value={loginEmail} onChange={e => setLoginEmail(e.target.value)} />
					</div>
					<div className="item">
						<p>Password:</p>
						<input type='password' value={loginPassword} onChange={e => setLoginPassword(e.target.value)} />
					</div>
				</div>
				<div className="submit">
					<button onClick={() => loginHandler()}>Log in</button>
				</div>
				<div className="links">
					<a onClick={() => setIsLogin(!isLogin)}>New to KFT? - register</a>
					<a className='forgotPasword' onClick={() => redirect('recovery')} >Forgot password?</a>
				</div>
			</div>}
		</div>
	);
});

export default Registration;