import React, { useEffect, useRef, useState } from 'react';
import { Image } from 'react-bootstrap';
import Slider from 'react-slick';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { ReactComponent as XMark } from '../../../static/XMarkThin.svg';
import { useMediaZoom } from './../../../Context/MediaZoomContext';
const MediaZoomPopup = () => {
	// console.log(currentMediaIndex)

	const {
		hidden,
		mediaList,
		currentMediaIndex,
		counterForPopup,
		zoomMedia,
		hidePopup,
	}	= useMediaZoom();
	
	
	const [currentCarouselSlide, setCurrentCarouselSlide] = useState(currentMediaIndex);
	const [settings, setSettings] = useState({
		dots: true,
		infinite: false,
		swipeToSlide: true,
		speed: 300,
		useCSS: true,
		slidesToShow: 1,
		slidesToScroll: 1,
		afterChange: (current) => {setCurrentCarouselSlide(current)},
		currentSlide: currentMediaIndex,
	});
	const hide = () => {
		hidePopup(true);
		if (sliderRef.current !== null) {
			sliderRef.current.slickGoTo(currentCarouselSlide, true)
		}
	}
	// console.log(['jpg', 'png','svg', 'webp', 'gif'].includes('asdf.gif'.split('.').pop()))
	const sliderRef = useRef(null)
	useEffect(() => {
		if (sliderRef.current !== null) {
			sliderRef.current.slickGoTo(currentMediaIndex, true)
		}
	}, [counterForPopup]);
	
	return (
		<div className={`mediaZoomPopup ${hidden? 'hidden': 'shown'} `} >
			<div className="close" onClick={hide}>
				<XMark />
			</div>
			<div className="container">
				<Slider {...settings} ref={sliderRef} >
					{mediaList.map((mediaFile, index) => (
						<div key={index}>
							{['jpg', 'png','svg', 'webp', 'gif'].includes(mediaFile.split('.').pop()) && <img className='image' src={`/${mediaFile}`} alt={`Slide ${index + 1}`} /> }
							{['mp4', 'avi'].includes(mediaFile.split('.').pop()) && <video className='image' src={mediaFile} alt={`Slide ${index + 1}`} />}
						</div>
					))}
				</Slider>
			</div>
		</div>
	);
};

export default MediaZoomPopup;