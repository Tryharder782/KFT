const inputBlockHeight = (messageText, textAreaRef) => {
	let rows = messageText.split(/\r\n|\r|\n/).length
	let inputHeight = 25
	if (rows < 5) inputHeight = textAreaRef.current.style.height = `${1 + rows * 24}px`
}

export default inputBlockHeight