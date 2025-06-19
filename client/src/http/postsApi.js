import { $authHost, $host } from ".";

// export const createComment = async(commentData, commentId) => {
// 	const {data} = await $host.put(`/api/posts/update:${commentId}`, commentData)
// 	return (data)
// }

export const updatePost = async(postData) => {
	try {
		let start = Date.now()
		console.log("запрос отправлен", start)
                const {data} = await $authHost.put(`/api/posts/update/${postData.id}`, postData)
		let end = Date.now()
		console.log("задержка: ", end - start)
		return data
	} catch (error) {
		console.log(error)
	}
}

export const createPost = async(postData) =>{

	try{
		console.log('postData', postData.getAll('mediaList'))
                const {data} = await $authHost.post('/api/posts/create', postData, {
			headers: {
				'Content-Type': 'multipart/form-data',
			},
		})
		return (data)
	}
	catch (error) {
		console.error(error)
	}
}

export const createComment = async (postId, text, userId, replyingToCommentId, media) => {
	// Создаем объект с данными для отправки на сервер
	const commentData = new FormData()
	commentData.append('replyingToCommentId', replyingToCommentId)
	commentData.append('postId', postId)
	commentData.append('userId', userId)
	commentData.append('text', text)
	commentData.append('media', media)

	console.log(commentData)
	try {
		// Отправляем запрос на сервер
		const {data} = await $authHost.post('/api/comments/create', commentData);
		// Возвращаем данные о созданном комментарии
		return (data);
	} catch (error) {
		// Обрабатываем ошибки
		console.error(error);
	}
};

export const likeComment = async (commentId, postId, userId) => {
	try {
                const {data} = await $authHost.put('/api/comments/likeComment', {commentId, postId, userId});
		return (data)
	} catch (error) {
		alert(error)
	}
}
export const unlikeComment = async (commentId, postId, userId) => {
	try {
                const {data} = await $authHost.delete(`/api/comments/unlikeComment/${commentId}/${postId}/${userId}`, {commentId, postId, userId});
		return (data)
	} catch (error) {
		alert(error)
	}
}

export const getComments = async (postId, limit, offset) => {
	try {
		const {data} = await $host.get(`/api/comments/get/${postId}/${limit}/${offset}`);
		return (data);
	}
	catch (error) {
		console.log(error)
	}
}

export const getPosts = async () => {
	try {
		const {data} = await $host.get('/api/posts/getAll')
		return (data)
	}
	catch(err){
		console.log(err)
	}
}
export const likePost = async (postId, userId) => {
	try {
		console.log(postId, userId)
                const {data} = await $authHost.put('/api/posts/likePost',{postId, userId})
		return (data);
	} catch (error) {
		alert(error)
	}
}
export const unlikePost = async (postId, userId) => {
	try {
		console.log(postId, userId)
                const {data} = await $authHost.delete(`/api/posts/unlikePost/${postId}/${userId}`)
		return (data);
	} catch (error) {
		alert(error)
	}
}

export const getUserPosts = async (id) => {
   try {
      const {data} = await $host.get(`/api/posts/getUserPosts/${id}`)
      return (data)
   }
   catch(err){
      console.log(err)
   }
}