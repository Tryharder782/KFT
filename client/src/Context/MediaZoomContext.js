import React, { createContext, useContext, useState } from 'react';

const MediaZoomContext = createContext();

export function useMediaZoom() {
   return useContext(MediaZoomContext);
}

export function MediaZoomProvider({ children }) {
   const [hidden, setHidden] = useState(true);
   const [mediaList, setMediaList] = useState([]);
   const [currentMediaIndex, setCurrentMediaIndex] = useState(null);
   const [counterForPopup, setCounterForPopup] = useState(0);

   
   const zoomMedia = (media, mediaIndex) => {
      console.log('zoom media')
      setMediaList(media);
      setCurrentMediaIndex(mediaIndex);
      setHidden(false);
      setCounterForPopup((prevCounter) => prevCounter + 1);
   };

   const hidePopup = () => {
      setHidden(true);
   };

   return (
      <MediaZoomContext.Provider
         value={{
            hidden,
            mediaList,
            currentMediaIndex,
            counterForPopup,
            zoomMedia,
            hidePopup,
         }}
      >
         {children}
      </MediaZoomContext.Provider>
   );
}