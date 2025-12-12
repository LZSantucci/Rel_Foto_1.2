// src/lib/exportDocx.ts

import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  ImageRun,
  Table,
  TableCell,
  TableRow,
  WidthType,
  AlignmentType,
  BorderStyle,
  VerticalAlign,
  ShadingType,
} from 'docx';
import { saveAs } from 'file-saver';
import { ReportData } from '@/types/report';

// Função auxiliar para conversão (mantida)
async function imageUrlToBase64(url: string): Promise<Uint8Array> {
  if (url.startsWith('data:')) {
    const base64 = url.split(',')[1];
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  }

  const response = await fetch(url);
  const blob = await response.blob();
  const arrayBuffer = await blob.arrayBuffer();
  return new Uint8Array(arrayBuffer);
}

export async function generateDOCX(data: ReportData): Promise<void> {
  const date = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
  
  // Definição de Cores
  const accentColor = 'E6BE32'; 
  const darkTextColor = '3C3C3C'; 
  const paddingDxA = 100; // 2mm de padding interno

  const totalPages = Math.ceil(data.photos.length / 4) || 1;
  const children: (Paragraph | Table)[] = [];

  // --- FUNÇÃO PARA CRIAR TEXT RUNS ---
  const createInfoRun = (label: string, value: string): TextRun[] => [
      new TextRun({ text: `${label}: `, bold: true, size: 18, color: accentColor }),
      new TextRun({ text: value || 'NÃO INFORMADO', size: 18, color: darkTextColor }),
  ];

  // --- CABEÇALHO 1: TÍTULO PRINCIPAL ---
  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: 'RELATÓRIO FOTOGRÁFICO',
          bold: true,
          size: 28, 
          color: darkTextColor,
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 100 },
    })
  );

  // --- CABEÇALHO 2: CÓDIGO DE REFERÊNCIA (Caixa Laranja) ---
  const refCode = data.config.codigoReferencia || 'NOT-XXXX';
  
  children.push(
    new Paragraph({
      alignment: AlignmentType.RIGHT,
      spacing: { after: 100 },
      children: [
          new TextRun({
              text: refCode,
              bold: true,
              size: 20,
              color: darkTextColor,
              shading: {
                  type: ShadingType.SOLID,
                  color: accentColor,
                  fill: accentColor,
              },
          }),
          new TextRun({ text: '  ', size: 20 }), // Simula Padding
      ],
    })
  );

  // --- GRADE DE INFORMAÇÕES (Cabeçalho de Dados) ---
  const logoCellDxA = 40 * 50; // 40mm
  const col3CellDxA = 40 * 50; // 40mm (Vermelha - Fixa)
  
  const headerTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 4, color: '000000' },
      bottom: { style: BorderStyle.SINGLE, size: 4, color: '000000' },
      left: { style: BorderStyle.SINGLE, size: 4, color: '000000' },
      right: { style: BorderStyle.SINGLE, size: 4, color: '000000' },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 4, color: '000000' },
      insideVertical: { style: BorderStyle.SINGLE, size: 4, color: '000000' },
    },
    columnWidths: [logoCellDxA, undefined, col3CellDxA], 
    rows: [
      new TableRow({
        children: [
          // COLUNA 1: LOGO (RowSpan 3)
          new TableCell({
            children: [
              new Paragraph({
                children: [new TextRun({ text: 'LOGO', size: 18, color: darkTextColor })], 
                alignment: AlignmentType.CENTER,
              }),
            ],
            width: { size: logoCellDxA, type: WidthType.DXA },
            verticalAlign: VerticalAlign.CENTER,
            rowSpan: 3,
            margins: { left: paddingDxA, right: paddingDxA, top: paddingDxA, bottom: paddingDxA },
          }),
          
          // COLUNA 2 (VERDE) - Linha 1 (Razão Social)
          new TableCell({
            children: [
              new Paragraph({
                children: createInfoRun('Razão Social', data.config.razaoSocial),
              }),
            ],
            borders: { bottom: { style: BorderStyle.SINGLE, size: 4, color: '000000' } },
            margins: { left: paddingDxA, right: paddingDxA, top: paddingDxA, bottom: paddingDxA },
          }),
          
          // COLUNA 3 (VERMELHA) - Linha 1 (Pág) - Alinhamento à Direita
          new TableCell({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: createInfoRun('Pág', `1 de ${totalPages}`),
              }),
            ],
            width: { size: col3CellDxA, type: WidthType.DXA },
            borders: { bottom: { style: BorderStyle.SINGLE, size: 4, color: '000000' } },
            margins: { left: paddingDxA, right: paddingDxA, top: paddingDxA, bottom: paddingDxA },
          }),
        ],
      }),
      
      new TableRow({
        children: [
          // COLUNA 2 (VERDE) - Linha 2 (Título do Relatório)
          new TableCell({
            children: [
              new Paragraph({
                children: createInfoRun('Título do Relatório', data.config.tituloRelatorio),
              }),
            ],
            borders: { bottom: { style: BorderStyle.SINGLE, size: 4, color: '000000' } },
            margins: { left: paddingDxA, right: paddingDxA, top: paddingDxA, bottom: paddingDxA },
          }),
          
          // COLUNA 3 (VERMELHA) - Linha 2 (Data) - Alinhamento à Direita
          new TableCell({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: createInfoRun('Data', date),
              }),
            ],
            width: { size: col3CellDxA, type: WidthType.DXA },
            borders: { bottom: { style: BorderStyle.SINGLE, size: 4, color: '000000' } },
            margins: { left: paddingDxA, right: paddingDxA, top: paddingDxA, bottom: paddingDxA },
          }),
        ],
      }),
      
      new TableRow({
        children: [
          // COLUNA 2 (VERDE) - Linha 3 (Objetivo)
          new TableCell({
            children: [
              new Paragraph({
                children: createInfoRun('Objetivo', data.config.objetivo),
              }),
            ],
            margins: { left: paddingDxA, right: paddingDxA, top: paddingDxA, bottom: paddingDxA },
          }),
          
          // COLUNA 3 (VERMELHA) - Linha 3 (Local) - Alinhamento à Direita
          new TableCell({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: createInfoRun('Local', data.config.local),
              }),
            ],
            width: { size: col3CellDxA, type: WidthType.DXA },
            margins: { left: paddingDxA, right: paddingDxA, top: paddingDxA, bottom: paddingDxA },
          }),
        ],
      }),
    ],
  });

  children.push(headerTable);
  children.push(new Paragraph({ spacing: { after: 200 } }));

  // --- GRID DE FOTOS (2x2) ---
  for (let i = 0; i < data.photos.length; i += 2) {
    const photo1 = data.photos[i];
    const photo2 = data.photos[i + 1];

    const cells: TableCell[] = [];
    
    // CORREÇÃO: Dimensões Otimizadas (Largura 7.5cm, Altura 7.9cm)
    const imgWidth = 1500; 
    const imgHeight = 1579; 

    // Margens da célula de foto (4mm de padding)
    const photoCellMarginDxA = 200; 
    const photoBorderWeight = 8;

    // Helper para adicionar a célula de foto
    const addPhotoCell = async (photo: typeof photo1 | null, index: number) => {
        const margins = { top: photoCellMarginDxA, bottom: photoCellMarginDxA, left: photoCellMarginDxA, right: photoCellMarginDxA };
        const borders = {
            top: { style: BorderStyle.SINGLE, size: photoBorderWeight, color: '000000' }, 
            bottom: { style: BorderStyle.SINGLE, size: photoBorderWeight, color: '000000' },
            left: { style: BorderStyle.SINGLE, size: photoBorderWeight, color: '000000' },
            right: { style: BorderStyle.SINGLE, size: photoBorderWeight, color: '000000' },
        };
        
        if (!photo) {
            // Célula vazia (placeholder)
            cells.push(
                new TableCell({
                    children: [new Paragraph({})],
                    width: { size: 50, type: WidthType.PERCENTAGE },
                    margins: margins,
                    borders: borders,
                })
            );
            return;
        }

        try {
            const imageData = await imageUrlToBase64(photo.src);
            cells.push(
                new TableCell({
                    children: [
                        new Paragraph({
                            children: [
                                new ImageRun({
                                    data: imageData,
                                    transformation: { width: imgWidth, height: imgHeight },
                                    type: 'jpg',
                                }),
                            ],
                            alignment: AlignmentType.CENTER,
                        }),
                        new Paragraph({
                            children: [
                                new TextRun({ text: `Foto ${index} - `, bold: true, size: 18 }),
                                new TextRun({ text: photo.description || 'Sem descrição', size: 18 }),
                            ],
                            spacing: { before: 100 },
                        }),
                    ],
                    width: { size: 50, type: WidthType.PERCENTAGE },
                    verticalAlign: VerticalAlign.TOP,
                    margins: margins,
                    borders: borders,
                })
            );
        } catch (error) {
            console.error(`Error adding image ${index}:`, error);
            cells.push(
                new TableCell({
                    children: [
                        new Paragraph({
                            children: [new TextRun({ text: '[Imagem não disponível]', italics: true, size: 18 })],
                        }),
                    ],
                    width: { size: 50, type: WidthType.PERCENTAGE },
                    margins: margins,
                    borders: borders,
                })
            );
        }
    };

    const photoIndex1 = i + 1;
    await addPhotoCell(photo1, photoIndex1); 

    if (photo2) {
        const photoIndex2 = i + 2;
        await addPhotoCell(photo2, photoIndex2);
    } else {
        // Célula vazia para preencher o grid
        await addPhotoCell(null, i + 2);
    }

    const photoRow = new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [new TableRow({ children: cells })],
      borders: {
        insideHorizontal: { style: BorderStyle.NONE },
        insideVertical: { style: BorderStyle.NONE },
      },
      margins: { top: 100, bottom: 100, left: 0, right: 0 },
    });

    children.push(photoRow);
    children.push(new Paragraph({ spacing: { after: 100 } }));
  }

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 500,    // 10mm
              right: 500,  // 10mm
              bottom: 500, // 10mm
              left: 500,   // 10mm
            },
          },
        },
        children,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const fileName = `${data.config.codigoReferencia || 'relatorio'}_${date.replace(/\//g, '-')}.docx`;
  saveAs(blob, fileName);
}