import React, { useRef } from 'react';
import { saveAs } from 'file-saver';

const FileDisplay = ({ file }) => {

   const downloadButton = useRef(null)
   const fileExtension = file.split('.')[1]
   const downloadFile = () => {
      // Преобразуйте ваш файл в Blob или ArrayBuffer, если это необходимо
      // Например, если file - это URL файла, то можно использовать fetch

      fetch(`/${file}`)
         .then((response) => response.blob())
         .then((blob) => {
            // Сохраняем файл с помощью FileSaver.js
            saveAs(blob, file);
         })
         .catch((error) => {
            console.error('Ошибка при скачивании файла:', error);
         });
   };

   return (
      <div>
         <div className="fileContainer">
            <div className="fileExtension">
               <div className="shownButton" onClick={downloadFile}>
                  {fileExtension}
               </div>
            </div>
            <div className="fileData">
               <div className="fileName">
                  {file}
               </div>
               <div className="fileSize"></div>
            </div>
         </div>
      </div>
   );
};

export default FileDisplay;