import { $authHost, $host } from ".";

export const sendRecoveryMail = async (email) => {
   try {
      const {data} = await $host.post('/api/mails/recovery', {email})
      return (data)
   } catch (e) {
      alert (e)
   }
}

export const checkPasswordToken = async (token) => {
   try {
      const {data} = await $host.post('/api/mails/checkToken', {token})
      return (data)
   } catch (e) {
      alert (e)
   }
}