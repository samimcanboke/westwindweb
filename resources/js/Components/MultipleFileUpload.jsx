import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import { useEffect } from 'react';

const MultipleFileUpload = ({images,setImages}) => {

  const uploadFiles = async (acceptedFiles) => {
    const formData = new FormData();
    acceptedFiles.forEach(file => {
      formData.append('files[]', file);
    });

    try {
      const response = await axios.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setImages(prevUploadedFiles => [...prevUploadedFiles, ...response.data]);
    } catch (error) {
      console.error('Fehler beim Hochladen der Dateien:', error);
    }
  };

  const onDrop = useCallback((acceptedFiles) => {
    uploadFiles(acceptedFiles);
  }, []);

  const { getRootProps, getInputProps, isDragActive, isDragAccept, isDragReject } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpeg', '.jpg'],
      'image/png': ['.png'],
      'image/gif': ['.gif'],
      'image/heif': ['.heif'],
      'image/heic': ['.heic']
    }
  });

  const getClassNames = () => {
    let classNames = 'dropzone';
    if (isDragActive) classNames += ' active';
    if (isDragAccept) classNames += ' accept';
    if (isDragReject) classNames += ' reject';
    return classNames;
  };

  const removeFile = (index) => {
    setImages(prevUploadedFiles => prevUploadedFiles.filter((_, i) => i !== index));
  };

  return (
    <div>
      <div {...getRootProps()} className={getClassNames()}>
        <input {...getInputProps()} />
        <p>Ziehen Sie einige Bilder hierher oder klicken Sie, um Bilder auszuwählen</p>
      </div>
      {images.length > 0 && (
        <div>
          <h3>Hochgeladene Bilder</h3>
          <ul className="uploaded-files-list">
            {images.map((file, index) => (
              <li key={index} className="uploaded-file-item" style={{ position: 'relative', display: 'inline-block', margin: '10px' }}>
                <img src={file.url} alt={`upload-${index}`} className="thumbnail" style={{ width: '100px', height: '100px', objectFit: 'cover' }} />
                <button className="remove-button" onClick={() => removeFile(index)} style={{ position: 'absolute', top: '5px', right: '5px', background: 'red', color: 'white', border: 'none', borderRadius: '50%', cursor: 'pointer' }}>✖</button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default MultipleFileUpload;
