const ApiError = require("../ErrorApi/ApiError")
const { Op } = require("sequelize");
const fs = require("fs")
const path = require('path')
const uuid = require('uuid');
const { User, PasswordTokens, UserInfo } = require("../models/models");
const FileType = import('file-type');
const sgMail = require('@sendgrid/mail')

sgMail.setApiKey(process.env.SENDGRID_API_KEY)


class MailController {
	async passwordRecovery (req,res,next) {
      try {
         const email = req.body.email
         if (!email) {
            return next(ApiError.badRequest('no specified email'));
         }
         const foundUser = await UserInfo.findOne({where: {email}})
         if (!foundUser) {
            return next(ApiError.badRequest('no account found'))
         }
         const tokenGenerated = uuid.v4()
         const foundToken = await PasswordTokens.findOne({where :{email}})
         if ( foundToken ) {
            await PasswordTokens.update({token: tokenGenerated, expired: false}, {where: {email}})
         }
         if ( !foundToken ) {
            await PasswordTokens.create({email, token : tokenGenerated, expired: false})
         }
         const msg = {
            to: email, // Change to your recipient
            from: 'semetei.arkabaev@gmail.com', // Change to your verified sender
            subject: 'Change your password',
            text: 'We are writing to you because you requested a password change. To reset your password, please follow the link below:',
            html: `<strong>http://localhost:3000/recovery/api_key/${tokenGenerated}</strong>`,
         }
         sgMail
            .send(msg)
            .then(() => {
               console.log('Email sent')
               return res.status(200).send('OK')
            })
            .catch((error) => {
               console.error(error)
            })

      } catch (error) {
         console.log(error)
         return next(ApiError.internal(error))
      }
   }

   async checkPasswordToken (req, res, next) {
      try {
         const token = req.body.token 
         console.log(token)
         if (!token) {
            return next(ApiError.badRequest('no token'))
         }
         const foundToken = await PasswordTokens.findOne({where: {token}})
         if (!foundToken) {
            return next(ApiError.badRequest('there is no password reset request'))
         }
         else if (foundToken.expired){
            return res.status(403).send('expired token')
         }
         return res.json('token valid')
      } catch (error) {
         console.log(error)
         return next(ApiError.internal(error))
      }
   }
   async test (req,res,next) {
      sgMail
      .send(msg)
      .then(() => {
         console.log('Email sent')
      })
      .catch((error) => {
         console.error(error)
      })
   }
}

module.exports = new MailController