import React from 'react';
import { Document, Page, PDFViewer } from '@react-pdf/renderer';

const PDFViewerComponent = ({ pdfBlob }) => {
  return (
    <PDFViewer width="1000" height="600">
          <Document file={{ data: atob(pdfBlob) }}>
            <Page pageNumber={1} />
          </Document>
        </PDFViewer>
  );
};

export default PDFViewerComponent;