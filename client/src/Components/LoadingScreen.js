import React, { useEffect } from 'react';
import { ReactComponent as KFTLogo} from '../static/KFTlogo.svg'

const LoadingScreen = ({finishLoading, loadedStages, loadingStages}) => {


   useEffect(() => {
		if (loadedStages === loadingStages)
		{
			finishLoading()
		}
	}, [loadedStages]);
   
   return (
      <div className="loadingScreen">
         <div className="logo">
            <KFTLogo className='logotype'/>	
         </div>
      </div>
   );
};

export default LoadingScreen;