import { $authHost, $host } from ".";

export const sendMail = () => {
   try {
      const {data} = $host.get('/api/mails/testMail') 
      return data
   } catch (e) {
      alert (e)
   }
}