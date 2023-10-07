import React, { useState } from 'react';
import { ReactComponent as CheckMarkRound} from '../../../static/checkMarkRound.svg'
import { ReactComponent as CheckMarkXRound} from '../../../static/checkMarkXRound.svg'
const Switcher = ({checked, setChecked}) => {
   
   return (
      <div className='container'>
         <div className={`checkField  ${checked ? 'checkedField' : ''}`}  onClick={() => setChecked(!checked)}>
            <div className={`checkMark ${checked ? 'checked' : ''}`}>
               { checked ? <CheckMarkRound /> : <CheckMarkXRound /> }
            </div>
         </div>
      </div>
   );
};


export default Switcher;