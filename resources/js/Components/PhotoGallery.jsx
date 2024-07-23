import React, { useEffect, useRef } from 'react';
import PhotoSwipeLightbox from 'photoswipe/lightbox';
import 'photoswipe/style.css';

const PhotoGallery = ({ images }) => {
  const galleryRef = useRef(null);
  const lightboxRef = useRef(null);

  useEffect(() => {
    if (lightboxRef.current) {
      lightboxRef.current.destroy();
    }

    lightboxRef.current = new PhotoSwipeLightbox({
      gallery: galleryRef.current,
      children: 'a',
      pswpModule: () => import('photoswipe')
    });

    lightboxRef.current.on('uiRegister', () => {
      lightboxRef.current.pswp.ui.registerElement({
        name: 'print-button',
        order: 9,
        isButton: true,
        tagName: 'button',
        html: 'Yazdır',
        style: {
          backgroundColor: 'white',
          color: 'black',
          border: '1px solid black',
          padding: '5px 10px',
          borderRadius: '5px'
        },
        onClick: () => {
          const currentSlide = lightboxRef.current.pswp.currSlide;
          if (currentSlide) {
            const imgSrc = currentSlide.data.src;
            const printWindow = window.open('', '_blank');
            printWindow.document.write(`
              <style>
                @media print {
                  img {
                    width: 210mm;
                    height: auto;
                  }
                }
              </style>
              <img src="${imgSrc}" onload="window.print();window.close()" />
            `);
            printWindow.document.close();
          }
        },
        appendTo: 'bar',
        className: 'pswp__button--print',
        style: {
          backgroundColor: 'white',
          color: 'black',
          border: '1px solid black',
          padding: '5px 10px',
          borderRadius: '5px'
        }
      });
    });

    lightboxRef.current.init();

    return () => {
      if (lightboxRef.current) {
        lightboxRef.current.destroy();
      }
    };
  }, [images]);

  return (
    <div ref={galleryRef} className="grid grid-cols-3 gap-4">
      {images.map((image, index) => (
        <a href={image.url} key={index} data-pswp-width="1024" data-pswp-height="768" target="_blank" rel="noreferrer">
          <img
            src={image.url}
            alt={`Gallery Image ${index}`}
            className="cursor-pointer"
          />
        </a>
      ))}
    </div>
  );
};

export default PhotoGallery;