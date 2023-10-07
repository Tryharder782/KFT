import React, { useEffect, useState } from 'react';
import Input from '../../Components/Input';
import { registration } from '../../http/usersApi';
import { useNavigate, useParams } from 'react-router-dom';
import '../../styles/PasswordRecoveryAction.scss';
import { checkPasswordToken } from '../../http/mailApi';
import { ReactComponent as RevealPasswordIco} from '../../static/revealPassword.svg'
const PasswordRecoveryAction = () => {

   const [unvalidToken, setUnvalidToken] = useState(true);
   const [newPassword, setNewPassword] = useState('');
   const [newPasswordConfirm, setNewPasswordConfirm] = useState('');
   const [arePasswordsSame, setArePasswordsSame] = useState(true);
   const [isPasswordShown, setIsPasswordShown] = useState(false);
   const [isPasswordConfirmShown, setIsPasswordConfirmShown] = useState(false);
   
   const {key} = useParams();

   const saveNewPass = () => {
      if (similarityCheck(newPassword, newPasswordConfirm , setArePasswordsSame  )) {
         
      }
      else{
         console.log('nerofl')

      }
   }
   useEffect(() => {
      console.log(arePasswordsSame)
   }, [arePasswordsSame]);
   useEffect(() => {
      if (key !== '') {
         checkPasswordToken(key).then( result => {
            console.log(result)
            if (result === 'token valid'){
               setUnvalidToken(false)
            }
         }).catch(err => alert(err))
      }
   }, [key]);

   const similarityCheck = (a, b, func) => {
      if (a === b && a !== '')
      {
         return true
      }
      else {
         func(false)
         setTimeout(() => {
            func(true)
         }, 2000)
         return false
      }
   }
   
   const navigate = useNavigate()
   
   const redirect = (address) => {
      navigate(`/${address}`)
   }
   const sendRecoveryEmail = () => {
      
   }
   const revealPassword = () => {
      setIsPasswordShown(prev => !prev)
   }
   const revealPasswordConfirm = () => {
      setIsPasswordConfirmShown(prev => !prev)
   }
   return (
      <div className='passwordRecoveryBody'>
         {!unvalidToken &&
         <div className="PRContainer">
            <div className="KFTText">
               Keys For Troubles
            </div>
            <div className="pageName">
               Password recovery
            </div>
            <div className="inputBox">
               <div className="inputName">
                  Enter new password:
               </div>
               <Input type={`${isPasswordShown ? 'text' : 'password'}`} messageText={newPassword} setMessageText={setNewPassword} />
               <div className="revealPassword" onClick={revealPassword}>
                  <RevealPasswordIco/>
               </div>
            </div>
            <div className={`inputBox ${arePasswordsSame === false ? "wrong" : '' }`}>
               <div className="inputName">
                  Confirm new password:
               </div>
               <Input type={`${isPasswordConfirmShown ? 'text' : 'password'}`} messageText={newPasswordConfirm} setMessageText={setNewPasswordConfirm} />
               <div className="revealPassword" onClick={revealPasswordConfirm}>
                  <RevealPasswordIco/>
               </div>
            </div>
            <div className="submitButton" onClick={() => saveNewPass()}>
               Save new password
            </div>
            <div className='backToRegistration' onClick={() => redirect('registration')}>
               Back to registration
            </div>
         </div>
         }
         {unvalidToken && 
            <div className="errorPage">
               Error
            </div>
         }
      </div>
   );
};

export default PasswordRecoveryAction;