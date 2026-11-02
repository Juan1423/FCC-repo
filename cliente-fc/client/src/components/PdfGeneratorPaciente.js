import React, { useState } from 'react';
import { jsPDF } from "jspdf";
import 'jspdf-autotable';
import { 
  Button, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  FormGroup, 
  FormControlLabel, 
  Switch,
  styled
} from '@mui/material';
import { PictureAsPdf } from '@mui/icons-material';
import LogoImage from '../assets/img/logo-fcc.png';
import { API_IMAGE_URL } from "../services/apiConfig";

// Styled button component
const StyledButton = styled(Button)(({ theme }) => ({
  borderRadius: '20px',
  padding: '10px 20px',
  textTransform: 'none',
  fontWeight: 'bold',
  boxShadow: '0 3px 5px 2px rgba(255, 105, 135, .3)',
  transition: 'all 0.3s',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 10px 4px rgba(255, 105, 135, .3)',
  },
}));

const PDFGeneratorPaciente = ({ paciente }) => {
  const [openDialog, setOpenDialog] = useState(false);
  const [options, setOptions] = useState({
    includePhoto: true,
    includeCedulas: true,
    includeCertificados: true
  });

  const handleOpenDialog = () => setOpenDialog(true);
  const handleCloseDialog = () => setOpenDialog(false);
  const handleOptionChange = (event) => {
    setOptions({ ...options, [event.target.name]: event.target.checked });
  };

  // Carga imágenes con credenciales (cookie HttpOnly) y las convierte a blob
  // local. Así las rutas /uploads protegidas por verifyToken (C-03) funcionan y
  // el canvas de jsPDF no queda "tainted" al usar un blob del mismo origen.
  const loadImage = async (src) => {
    const response = await fetch(src, { credentials: 'include' });
    if (!response.ok) {
      throw new Error(`No se pudo cargar la imagen (${response.status})`);
    }
    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        URL.revokeObjectURL(objectUrl);
        resolve(img);
      };
      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        reject(new Error('La imagen no se pudo decodificar'));
      };
      img.src = objectUrl;
    });
  };

  // Function to determine file type
  const getFileType = (filename) => {
    const extension = filename.split('.').pop().toLowerCase();
    return ['jpg', 'jpeg', 'png', 'gif'].includes(extension) ? 'image' : 'pdf';
  };

  const generatePDF = async () => {
    const doc = new jsPDF();
    
    const addPage = () => {
      doc.addPage();
      return 20; // Top margin on new page
    };

    const addLine = (y) => doc.line(10, y, 200, y);

    const addTitle = (text, y) => {
      doc.setFontSize(14);
      doc.setTextColor(0, 102, 204);
      doc.text(text, 10, y);
      addLine(y + 1);
    };

    const ensureSpace = (height) => {
      const pageHeight = doc.internal.pageSize.height;
      if (doc.lastAutoTable && doc.lastAutoTable.finalY + height > pageHeight - 20) {
        return addPage();
      }
      return doc.lastAutoTable ? doc.lastAutoTable.finalY + 10 : 60;
    };

    // Add logo
    const logoImg = await loadImage(LogoImage);
    doc.addImage(logoImg, 'PNG', 10, 10, 20, 20);

    // Title
    doc.setFontSize(18);
    doc.setTextColor(0, 102, 204);
    doc.text("Ficha del Paciente", 50, 25);

    // Patient photo
    let startY = 40;
    if (options.includePhoto && paciente.foto_paciente) {
      try {
        const img = await loadImage(`${API_IMAGE_URL}${paciente.foto_paciente}`);
        const aspectRatio = img.width / img.height;
        const imgWidth = 40;
        const imgHeight = imgWidth / aspectRatio;
        doc.addImage(img, 'JPEG', 160, startY, imgWidth, imgHeight);
        startY += imgHeight + 10;
      } catch (error) {
        console.error("Error loading patient image:", error);
      }
    }

    // Patient data
    addTitle("Datos del Paciente", startY);

    const pacienteData = [
      ["Nombre", paciente.nombre_paciente, "Apellido", paciente.apellidos_paciente],
      ["Nacionalidad", paciente.nacionalidad_paciente, "Tipo DNI", paciente.tipo_dni_paciente],
      ["DNI", paciente.dni_paciente, "Dirección", paciente.direccion_paciente],
      ["Teléfono", paciente.telefono_paciente, "Email", paciente.email_paciente],
      ["Tipo de Sangre", paciente.tiposangre_paciente, "Edad", paciente.edad_paciente.toString()],
      ["Fecha de Nacimiento", new Date(paciente.fecha_paciente).toLocaleDateString(), "Género", paciente.genero_paciente],
      ["Familiar Cuidador", paciente.familiar_cuidador, "Parentesco", paciente.parentesco_familiar],
      ["Teléfono Cuidador", paciente.telefono_cuidador, "", ""],
      ["Fecha de Registro", new Date(paciente.fecha_registro_paciente).toLocaleDateString(), "", ""]
    ];

    doc.autoTable({
      startY: startY + 5,
      body: pacienteData,
      theme: 'grid',
      styles: { fontSize: 8, cellPadding: 1 },
      columnStyles: {
        0: { fontStyle: 'bold', fillColor: [240, 240, 240], cellWidth: 40 },
        1: { cellWidth: 50 },
        2: { fontStyle: 'bold', fillColor: [240, 240, 240], cellWidth: 40 },
        3: { cellWidth: 50 }
      },
      columns: [
        { header: '', dataKey: 'attribute1' },
        { header: '', dataKey: 'value1' },
        { header: '', dataKey: 'attribute2' },
        { header: '', dataKey: 'value2' }
      ],
      margin: { left: 10, right: 10 }
    });

    // Biography
    startY = ensureSpace(60);
    addTitle("Biografía", startY);
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    const splitBiografia = doc.splitTextToSize(paciente.biografia_paciente || "No disponible", 180);
    doc.text(splitBiografia, 10, startY + 10);

    // New page for documents
    startY = addPage();
    addTitle("Documentos del Paciente", startY);
    startY += 10;

    // Function to add documents
    const addDocument = async (url, title, type) => {
      if (type === 'image') {
        try {
          const img = await loadImage(`${API_IMAGE_URL}${url}`);
          const aspectRatio = img.width / img.height;
          const imgWidth = 180;
          const imgHeight = imgWidth / aspectRatio;
          doc.addImage(img, 'JPEG', 15, startY, imgWidth, imgHeight);
          startY += imgHeight + 10;
          doc.text(title, 15, startY);
          startY += 15;
        } catch (error) {
          console.error(`Error loading image ${title}:`, error);
        }
      } else {
        // Button for PDF
        doc.setFillColor(0, 102, 204);
        doc.rect(15, startY, 180, 20, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(12);
        doc.text(title, 20, startY + 13);
        doc.link(15, startY, 180, 20, { url: `${API_IMAGE_URL}${url}` });
        startY += 30;
      }
    };

    // Documents: Cédula
    if (options.includeCedulas && paciente.archivo_documentos_cedulas) {
      await addDocument(paciente.archivo_documentos_cedulas, "Cédula", getFileType(paciente.archivo_documentos_cedulas));
    }
  
    // Medical certificate
    if (options.includeCertificados && paciente.archivo_certificado_medico) {
      await addDocument(paciente.archivo_certificado_medico, "Certificado Médico", getFileType(paciente.archivo_certificado_medico));
    }

    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    for(let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(0, 0, 0);
      doc.text(`Página ${i} de ${pageCount}`, doc.internal.pageSize.width / 2, doc.internal.pageSize.height - 10, null, null, 'center');
    }

    // Generate blob and open in new tab
    const pdfBlob = doc.output('blob');
    const blobUrl = URL.createObjectURL(pdfBlob);
    
    // Open the PDF in a new tab for preview
    window.open(blobUrl, '_blank');

    // Create a link element for download
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = `Ficha_Paciente_${paciente.nombre_paciente}_${paciente.apellidos_paciente}.pdf`;
    
    // Append the link to the document
    document.body.appendChild(link);
    
    // Simulate click on the link to start the download
    link.click();
    document.body.removeChild(link);
    
    // Clean up the blob URL after a short delay
    setTimeout(() => {
      URL.revokeObjectURL(blobUrl);
    }, 300);
  };

  return (
    <>
      <StyledButton 
        variant="contained" 
        color="primary" 
        onClick={handleOpenDialog}
        startIcon={<PictureAsPdf />}
      >
        Generar y Descargar PDF
      </StyledButton>
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Opciones de la Ficha del Paciente</DialogTitle>
        <DialogContent>
          <FormGroup>
            <FormControlLabel
              control={<Switch checked={options.includePhoto} onChange={handleOptionChange} name="includePhoto" />}
              label="Incluir foto del paciente"
            />
            <FormControlLabel
              control={<Switch checked={options.includeCedulas} onChange={handleOptionChange} name="includeCedulas" />}
              label="Incluir cédula"
            />
            <FormControlLabel
              control={<Switch checked={options.includeCertificados} onChange={handleOptionChange} name="includeCertificados" />}
              label="Incluir certificado médico"
            />
          </FormGroup>
        </DialogContent>
        <DialogActions>
          <StyledButton onClick={handleCloseDialog} color="secondary">
            Cancelar
          </StyledButton>
          <StyledButton onClick={() => { handleCloseDialog(); generatePDF(); }} color="primary">
            Generar y Descargar PDF
          </StyledButton>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default PDFGeneratorPaciente;