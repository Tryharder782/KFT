import { $authHost, $host } from ".";
import jwt_decode from "jwt-decode"

export const registration = async(user) => {
	const {data} = await $host.post('/api/users/registration', user)
	localStorage.setItem('token', data.token)
	return jwt_decode(data.token)
}

export const editUser = async(user) => {
	const {data} = await $authHost.put(`/api/users/update/${user.get('id')}`, user)
	localStorage.setItem('token', data)
	console.log(data)
	console.log('editUser request')
	return jwt_decode(data)
}

export const searchUsers = async(text) => {
	console.log(text);
	const {data} = await $host.post('/api/users/searchUsers', {text})
	return (data)
}
export const friendRequest = async(userId, friendId) => {
	console.log('userId',userId, 'friendId', friendId)
	const {data} = await $host.post('/api/users/friendRequest', {userId, friendId})
	return (data)
}

export const login = async(user) => {
	const {data} = await $host.post('/api/users/login', user)
	localStorage.setItem('token', data.token)
	return jwt_decode(data.token)
}

export const getExactUser = async(id,userId) => {
	const {data} = await $authHost.post(`/api/users/getExact`, {id,userId})
	return jwt_decode(data.token)
}
export const check = async() => {
	const {data} = await $authHost.get('/api/users/check')
	localStorage.setItem('token', data.token)
	return jwt_decode(data.token)
}
export const getMultipleUsers = async(ids) => {
	const {data} = await $authHost.post(`api/users/getMultiple`, {ids})
	return (data)
}
export const checkPassword = async(userId, inputPass) => {
	try{
		const {data} = await $authHost.post(`/api/users/checkPassword`, {userId, inputPass})
		return (data)
	} catch(err) {
		console.error(err);
	}
}
export const auth = async(token) => {
	try {
		let user = jwt_decode(token)
		let userId = user.id
		let tokenVersion = user.tokenVersion
		const response = await $host.post('/api/users/auth', {userId, tokenVersion})
		return (response)
	} catch (error) {
		console.log(error);
	}
}

export const passChange = async(token, newPass) => {
	try {
		const {data} = await $authHost.post(`/api/users/changePassword`, {token, newPass})
		return (data)
	} catch (error) {
		console.log(error)
		alert(error)
	}

}

export const changeOnlineStatus = async(userId, isOnline) => {
	try {
		const {data} = await $authHost.get(`/api/users/changeOnlineStatus/${userId}/${isOnline}`)
		return (data)
	} catch (error) {
		alert(error)
	}
}