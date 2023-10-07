import React from 'react';
import { Image } from 'react-bootstrap';
import { ReactComponent as EditPfpIco } from '../../../static/editPfp.svg';
const NewPfpSelectPopup = ({confirmNewPfp, showPopup, shown, hidePopup, selectedImage, selectPicture}) => {

   const closePopup = () => {
      if (shown) {
         hidePopup()
      }
   }

   const proceed = () => {
      confirmNewPfp()
      closePopup()
   }
   
   return (
      <div className={`newPfpSelectPopup ${shown ? 'shown' : ''}`}>
         <div className="block">

            <div className="pfpPreview settingsRow" onClick={selectPicture}>
               <div className="fullPreview column">
                  <h1>Full view</h1>
                  <div className="view">
                     { selectedImage &&
                        <Image src={URL.createObjectURL(selectedImage)} fluid={true} />
                     }
                     {
                        !selectedImage &&
                        <div className="placeholder">
                           <EditPfpIco />
                        </div>
                     }
                  </div>
                  <p className='hint'>tap to select</p>
               </div>
               
               <div className="preview column">
                  <h1>Preview</h1>
                  <div className="previewCircle">
                     { selectedImage &&
                        <Image src={URL.createObjectURL(selectedImage)} fluid={true} />
                     }
                     {
                        !selectedImage &&
                        <div className="placeholder"></div>
                     }
                  </div>
               </div>
            </div>
            
            <div className="buttons">
               <div className="cancelButton button"  onClick={closePopup}>
                  cancel
               </div>
               <div className="proceedButton button" onClick={proceed}>
                  proceed
               </div>
            </div>
         </div>
      </div>
   );
};

export default NewPfpSelectPopup;