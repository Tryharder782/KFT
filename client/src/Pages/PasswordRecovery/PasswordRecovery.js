import React, { useEffect, useState } from 'react';
import Input from '../../Components/Input';
import { registration } from './../../http/usersApi';
import { useNavigate, useParams } from 'react-router-dom';
import '../../styles/PasswordRecovery.scss';
import { checkPasswordToken, sendRecoveryMail } from '../../http/mailApi';
const PasswordRecovery = () => {

   const [emailAddress, setEmailAddress] = useState('');

   const navigate = useNavigate()
   
   const redirect = (address) => {
      navigate(`/${address}`)
   }
   const sendRecoveryEmail = () => {
      sendRecoveryMail(emailAddress)
   }
   return (
      <div className='passwordRecoveryBody'>
         <div className="PRContainer">
            <div className="KFTText">
               Keys For Troubles
            </div>
            <div className="pageName">
               Password recovery
            </div>
            <div className="inputBox">
               <div className="inputName">
                  Email address:
               </div>
               <Input messageText={emailAddress} setMessageText={setEmailAddress} />
            </div>
            <div className="submitButton" onClick={() => sendRecoveryEmail()}>
               Send link
            </div>
            <div className="backToRegistration" onClick={() => redirect('registration')}>
               Back to registration
            </div>
         </div>
      </div>
   );
};

export default PasswordRecovery;