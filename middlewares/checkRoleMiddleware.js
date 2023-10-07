const jwt = require('jsonwebtoken')

module.exports = function(role) {
	return function (req,res,next) {
		if (req.method === 'OPTIONS'){
			next()
		}
		try {
			const token = req.headers.authorization.split(' ')[1]
			if(!token){
				return res.status(401).json({message: 'unauthorized'})
			}
			const decoded = jwt.verify(token, process.env.SECRET_KEY)
			if (!decoded.role === role) {
				return res.status(401).json({message: `No access to ${decoded.role}, ${role} needed`})
			}
			req.user = decoded
			next()
		} catch (e){
			res.status(401).json({message : `Error in checking role: \n ${e.message}`})
		}
	}
}