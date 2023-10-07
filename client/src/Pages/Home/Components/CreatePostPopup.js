import React, { useRef, useState, useEffect } from 'react';
import Input from '../../../Components/Input';
import { ReactComponent as MySvg } from '../../../static/imgIco.svg'
import { Image } from 'react-bootstrap';
import xSign from '../../../static/xSign.svg'
import inputBlockHeight from '../../../functions/InputBlockHeight';
import { ReactComponent as PlusIco } from '../../../static/plus.svg';

const CreatePostPopup = ({ newPostText, setNewPostText, hidden, setHidden, postCreate }) => {

  const [selectedFiles, setSelectedFiles] = useState([]);
  const [selectedMedia, setSelectedMedia] = useState([]);
  const [attachMediaKey, setAttachMediaKey] = useState(Date.now());
  const [previewImage, setPreviewImage] = useState(null);
  const textareaRef = useRef(null);
  const containerRef = useRef(null);
  const fileInputRef = useRef(null);

  const handleButtonClick = () => {
    fileInputRef.current.click();
  };
  const handleFileChange = (event) => {
    const files = event.target.files;
    if (files) {
      setSelectedFiles(prev => [...prev, ...files]);
      for (let i = 0; i < files.length; i++) {
        setSelectedMedia(prev => [...prev, URL.createObjectURL(files[i])]);
      }
      // Обработка выбранного файла
      setAttachMediaKey(Date.now())
    }
  };
  const clearSelection = (index) => {
    setSelectedFiles(prev => {
      const newFiles = [...prev];
      newFiles.splice(index, 1);
      return newFiles;
    });

    setSelectedMedia(prev => {
      const newMedia = [...prev];
      newMedia.splice(index, 1);
      return newMedia;
    });
    setPreviewImage(selectedMedia[0])
  };
  const newPostTextEndCutter = (newPostText) => {
    let msgRowsArr = newPostText.split('\n');
    let lastLetterRow = 0;
    for (let i = 0; i < msgRowsArr.length; i++) {
      if (msgRowsArr[i] !== '') lastLetterRow = i;
    }
    msgRowsArr.splice(lastLetterRow + 1, msgRowsArr.length - 1 - lastLetterRow);
    let finalMsg = msgRowsArr.join('\n');
    return finalMsg;
  };
  const setNewPostTextHandler = (e, setNewPostText) => {
    e.preventDefault();
    setNewPostText(e.target.value);
  };

  useEffect(() => {
    setPreviewImage(selectedMedia[0])
  }, [selectedMedia]);
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setHidden(true);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [containerRef, setHidden]);
  useEffect(() => {
    inputBlockHeight(newPostText, textareaRef)
  }, [newPostText]);
  return (
    <div className={`createPostPopup ${hidden ? 'hidden' : 'shown'}`} >
      <div className="container" ref={containerRef}>
        <Input messageText={newPostText}
          textareaRef={textareaRef}
          setMessageText={setNewPostText}
          showEmojiPicker={false}
          showSendButton={false}
          showRecorderButton={false}
          showAttachFilesButton={false}
        />

        <div className="imgPin" >

          {selectedMedia.length === 0 && <div className="logoContainer" onClick={handleButtonClick}><MySvg className='photoLogo' /></div>}
          {selectedMedia.length > 0 &&
            <div className="previewBlock">
              <div className="filePreview">
                <Image src={previewImage} />
              </div>
              <div className="images">
                {selectedMedia.map((f, index) => {
                  console.log(selectedFiles[index].type)
                  return (selectedFiles[index].type === 'image/gif' || selectedFiles[index].type === 'image/jpeg' || selectedFiles[index].type === 'image/png') &&
                    <div className="item" key={index} onClick={() => setPreviewImage(selectedMedia[index])}>
                      <div className="removeFile"><Image className='xIco' src={xSign} onMouseUp={e => clearSelection(index)} /></div>
                      <Image className='selectedFile' src={f} />
                    </div>
                }
                )}
                <div className="item addFile" onClick={handleButtonClick}>
                  <PlusIco />
                </div>
              </div>
            </div>
          }
          <input type="file" key={attachMediaKey} multiple ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileChange} />
        </div>

        <div className="buttons">
          <div className="button cancel" onClick={() => setHidden(true)}>
            <span>cancel</span>
          </div>
          <div className="button submit" onClick={() => {
              postCreate(newPostTextEndCutter(newPostText), selectedFiles)
              setSelectedFiles([])
              setSelectedMedia([])
              setPreviewImage(null)
            }}>
            <span>submit post</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePostPopup;