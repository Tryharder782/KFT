import { observer } from 'mobx-react-lite';
import React, { useEffect, useState } from 'react';
import { Image } from 'react-bootstrap';
import { ReactComponent as PlusIco } from '../../src/static/plus.svg';
import { ReactComponent as XMarkThin } from '../../src/static/XMarkThin.svg';

const FilesAttach = observer(({ files, fileAddRef, handleFileAdd, addKey, handleAddClick, clearSelectedFiles, handleFileRemove }) => {
	const [images, setImages] = useState([]);
	const [shownImages, setShownImages] = useState([]);
	const [currentImage, setCurrentImage] = useState('');
	const [isImagesLoaded, setIsImagesLoaded] = useState(false);

	function convertFileToBase64(file) {
		return new Promise((resolve, reject) => {
			const reader = new FileReader();

			reader.onload = () => {
				const base64String = reader.result;
				resolve(base64String);
			};

			reader.onerror = (error) => {
				reject(error);
			};

			reader.readAsDataURL(file);
		});
	}

	const processFiles = async (fileList) => {
		if (fileList.length === 0) {
			setIsImagesLoaded(true)
			return; // Все файлы обработаны, выходим из функции
		}
		if (isImagesLoaded === true){
			setIsImagesLoaded(false)
		}
		const file = fileList[0]; // Берем первый файл для обработки
		const remainingFiles = fileList.slice(1); // Оставшиеся файлы для дальнейшей обработки

		try {
			const base64String = await convertFileToBase64(file);
			setImages((prev) => [...prev, base64String]);

			// Рекурсивно вызываем функцию для обработки оставшихся файлов
			await processFiles(remainingFiles);
		} catch (error) {
			console.error(error);
		}
	};

	useEffect(() => {
		setImages([])
		processFiles(files); // Запускаем обработку файлов
	}, [files]);

	useEffect(() => {
		setCurrentImage(images[0]); // Сбрасываем текущую картинку
	}, [images[0]]);
	useEffect(() => {
		if (isImagesLoaded){
			setShownImages(images)
		}
	}, [shownImages, isImagesLoaded]);
	
	return (
		<div className='filesAttachContainer'>
			<div className="closeAttacherBtn" onClick={clearSelectedFiles}>
				<XMarkThin />
			</div>
			<div className="filePreview">
				{currentImage && currentImage[5] === 'i' && <Image fluid={true} src={currentImage} />}
				{currentImage && currentImage[5] === 'v' && <video className='video' src={currentImage} controls></video>}
			</div>
			<div className="mediaSlider">
				{isImagesLoaded && shownImages.map((image, index) => (
					<div className="sliderItem" key={index} onClick={() => setCurrentImage(shownImages[index])}>
						{files && files[index] && files[index].type.split('/')[0]==='image' && <Image src={image} />}
						{files && files[index] && files[index].type.split('/')[0]==='video' && <video className='video' src={image}></video>}
						<div className="removeSliderItemBtn" onClick={() => {handleFileRemove(files[index])}}>
							<XMarkThin />
						</div>
					</div>
				))}
				<div className="sliderItem addFile" onClick={handleAddClick}>
					<PlusIco />
					<input type="file" key={addKey} multiple hidden={true} onChange={handleFileAdd} ref={fileAddRef} />
				</div>
			</div>
		</div>
	);
});

export default FilesAttach;
