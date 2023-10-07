import { $authHost, $host } from "."

export const createChat = async (userList, adminList) => {
	try {
		console.log(userList, adminList);
		const { data } = await $host.post('/api/chats/create', { userList, adminList })
		return (data)
	} catch (err) {
		console.log(err)
	}
}

export const getChatInfo = async () => {
	const { data } = await $host.get()
}
export const getChatMessages = async (chatId, userId, limit, offset) => {
	try {
		const { data } = await $host.post(`/api/messages/getChatMessages`, { chatId, userId, limit, offset })
		return (data)
	} catch (error) {
		alert(error.response.data.message)
	}
}
export const getChatByMembers = async (userList, requesterId, limit, offset) => {
	try {
		const response = await $host.post('/api/messages/getByMembers', { userList, requesterId, limit, offset });
		const data = response.data;
		return data;
	} catch (error) {
		console.error('Error occurred while fetching chat:', error);
		throw error;
	}
};

export const getUserChats = async (userId) => {
	try {
		const { data } = await $authHost.get(`/api/chats/getUserChats/${userId}`)
		return data
	} catch (error) {
		throw error
	}
}

export const createMessage = async (messageData) => {
	try {
		const { data } = await $host.post('/api/messages/create', messageData, {
			headers: {
				'Content-Type': 'multipart/form-data',
			},
		})
		return (data)
	} catch (err) {
		console.log(err)
	}
}
export const deleteMessage = async (id, userId) => {
	const { data } = await $host.delete(`/api/messages/delete/${id}/${userId}`)
	return (data)
}

