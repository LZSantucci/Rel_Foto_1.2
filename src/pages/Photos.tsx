// src/pages/Photos.tsx

import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Upload, FileDown, ArrowLeft, ImagePlus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useReport } from '@/contexts/ReportContext';
import { PhotoCard } from '@/components/PhotoCard';
import { ExportModal } from '@/components/ExportModal';
import { toast } from '@/hooks/use-toast';

// Dimensão máxima de altura para o Canvas, para garantir que o Base64 não seja gigantesco.
const MAX_HEIGHT_PX = 1000; 

// ===== FUNÇÃO AUXILIAR: Corrige Orientação e Redimensiona a Imagem no Canvas (Mantida) =====
const getOrientationCorrectedBase64 = (file: File): Promise<string> => {
    // ... (Lógica mantida)
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (readerEvent) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                
                let width = img.naturalWidth;
                let height = img.naturalHeight;

                // 1. CALCULAR REDIMENSIONAMENTO SE NECESSÁRIO
                if (height > MAX_HEIGHT_PX) {
                    width = (width * MAX_HEIGHT_PX) / height;
                    height = MAX_HEIGHT_PX;
                }
                
                canvas.width = width;
                canvas.height = height;

                // 2. DESENHAR NO CANVAS (Corrige EXIF e Redimensiona)
                if (ctx) {
                    ctx.drawImage(img, 0, 0, width, height);
                } else {
                    return reject(new Error("Canvas context is unavailable."));
                }

                // 3. RETORNAR O NOVO Base64 (Com resolução reduzida)
                resolve(canvas.toDataURL('image/jpeg', 0.9)); 
            };
            img.onerror = () => reject(new Error("Image failed to load."));
            
            const src = readerEvent.target?.result;
            if (typeof src === 'string') {
                 img.src = src;
            } else {
                 reject(new Error("FileReader result is invalid."));
            }
        };
        reader.onerror = () => reject(new Error("FileReader failed."));
        reader.readAsDataURL(file);
    });
};


export default function Photos() {
  const navigate = useNavigate();
  const { photos, addPhoto, updatePhotoDescription, removePhoto, config } = useReport();
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  
  // REFERÊNCIA PARA A GALERIA DE FOTOS (Zona de Drop)
  const photoGalleryRef = useRef<HTMLDivElement>(null); 

  // Função para formatar a contagem de fotos
  const formatPhotoCount = (count: number) => {
    if (count === 0) return 'Nenhuma foto adicionada';
    return `${count} foto${count !== 1 ? 's' : ''} adicionada${count !== 1 ? 's' : ''}`;
  };

  // ===== 2. FUNÇÃO CENTRALIZADA DE PROCESSAMENTO DE ARQUIVOS (File List) (Mantida) =====
  const processFiles = async (fileList: FileList | null) => {
    if (!fileList) return;
    
    const files = Array.from(fileList);

    for (const file of files) {
        if (!file.type.startsWith('image/')) {
            toast({
                title: 'Arquivo inválido',
                description: 'Por favor, selecione apenas imagens.',
                variant: 'destructive',
            });
            continue;
        }

        try {
            const correctedSrc = await getOrientationCorrectedBase64(file);
            
            addPhoto({
                id: `photo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                src: correctedSrc,
                description: '', 
            });
        } catch (error) {
            console.error('Error correcting image orientation:', error);
            toast({
                title: 'Erro de processamento',
                description: 'Não foi possível processar a imagem.',
                variant: 'destructive',
            });
        }
    }
  };
  
  // ===== 3. HANDLERS DE INPUT (Botão Upload/Câmera) (Mantidos) =====
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    await processFiles(e.target.files);

    if (e.target) {
      e.target.value = '';
    }
  };

  const handleCameraCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileUpload(e);
  };
  
  // ===== 4. HANDLER DE DROPZONE (Drag and Drop) =====
  const handleDropFiles = async (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Remove o highlight após o drop
    if (photoGalleryRef.current) {
        photoGalleryRef.current.classList.remove('highlight-drag');
    }

    const dt = e.dataTransfer;
    if (dt && dt.files) {
      await processFiles(dt.files);
    }
  };
  
  // ===== 5. EFEITO PARA CONFIGURAR LISTENERS (useEffect) =====
  useEffect(() => {
    const dropZone = photoGalleryRef.current;

    if (dropZone) {
      // Previne comportamento padrão e adiciona feedback visual
      const preventDefaults = (e: Event) => {
        e.preventDefault();
        e.stopPropagation();
      };
      
      const highlight = (e: DragEvent) => {
        // Verifica se o item arrastado é um arquivo (e não texto ou link)
        if (e.dataTransfer?.types && Array.from(e.dataTransfer.types).includes('Files')) {
             dropZone.classList.add('highlight-drag');
             // Opcional: Para mudar o cursor fora do elemento, você precisaria de CSS global
             // dropZone.style.cursor = 'copy'; 
        }
      };
      
      const unhighlight = () => {
        dropZone.classList.remove('highlight-drag');
        // dropZone.style.cursor = 'default';
      };
      
      // Adiciona Listeners
      ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
          dropZone.addEventListener(eventName, preventDefaults as EventListener, false);
      });
      // dragenter e dragover ativam o realce
      dropZone.addEventListener('dragenter', highlight as EventListener, false);
      dropZone.addEventListener('dragover', highlight as EventListener, false);
      // dragleave e drop desativam o realce
      dropZone.addEventListener('dragleave', unhighlight as EventListener, false);
      dropZone.addEventListener('drop', handleDropFiles as EventListener, false);
      
      // Cleanup: Remove Listeners ao desmontar
      return () => {
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            dropZone.removeEventListener(eventName, preventDefaults as EventListener, false);
        });
        dropZone.removeEventListener('dragenter', highlight as EventListener, false);
        dropZone.removeEventListener('dragover', highlight as EventListener, false);
        dropZone.removeEventListener('dragleave', unhighlight as EventListener, false);
        dropZone.removeEventListener('drop', handleDropFiles as EventListener, false);
      };
    }
  }, [addPhoto]); 

  // ===== 6. EXPORTAR FUNÇÃO (Mantida) =====
  const handleExport = () => {
    if (photos.length === 0) {
      toast({
        title: 'Nenhuma foto adicionada',
        description: 'Adicione pelo menos uma foto antes de exportar o relatório.',
        variant: 'destructive',
      });
      return;
    }
    setIsModalOpen(true);
  };
  
  // A classe 'highlight-drag' deve ser definida no seu CSS global ou utilitário:
  // Ex: .highlight-drag { border-color: #e6be32; box-shadow: 0 0 10px rgba(230, 190, 50, 0.5); }

  // ===== 7. RENDERIZAÇÃO (Galeria de Fotos) =====
  return (
    <div className="min-h-screen bg-background">
      <header className="bg-primary text-primary-foreground py-3 sm:py-4 shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-1 sm:gap-2 text-primary-foreground/80 hover:text-primary-foreground transition-colors"
            >
              <ArrowLeft size={18} className="sm:w-5 sm:h-5" />
              <span className="text-sm sm:text-base">Voltar</span>
            </button>
            <h1 className="text-base sm:text-xl font-bold truncate max-w-[180px] sm:max-w-none">
              {config.documentName || 'Relatório Fotográfico'}
            </h1>
            <div className="w-16 sm:w-20" />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-4 sm:py-6">
        {/* Mobile: Stack layout, Desktop: Side by side */}
        <div className="flex flex-col gap-4 lg:flex-row lg:gap-6">
          
          {/* Control Panel - Fixed bottom on mobile, sidebar on desktop */}
          <aside className="order-2 lg:order-1 lg:w-72 space-y-3 sm:space-y-4">
            <div className="bg-card rounded-lg border border-border p-3 sm:p-4 shadow-sm">
              <h2 className="font-semibold text-card-foreground mb-3 sm:mb-4 text-sm sm:text-base">Controles</h2>

              {/* Camera Toggle */}
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div className="flex items-center gap-2">
                  <Camera size={18} className="text-muted-foreground sm:w-5 sm:h-5" />
                  <span className="text-xs sm:text-sm font-medium">Câmera</span>
                </div>
                <button
                  onClick={() => setCameraEnabled(!cameraEnabled)}
                  className={cn(
                    "relative w-10 h-5 sm:w-12 sm:h-6 rounded-full transition-colors",
                    cameraEnabled ? "bg-secondary" : "bg-muted"
                  )}
                >
                  <span
                    className={cn(
                      "absolute top-0.5 sm:top-1 w-4 h-4 rounded-full bg-card shadow transition-transform",
                      cameraEnabled ? "left-5 sm:left-7" : "left-0.5 sm:left-1"
                    )}
                  />
                </button>
              </div>

              {/* Mobile: Horizontal buttons, Desktop: Stacked */}
              <div className="flex flex-row gap-2 sm:flex-col sm:gap-0">
                {cameraEnabled && (
                  <button
                    onClick={() => cameraInputRef.current?.click()}
                    className="flex-1 sm:flex-none sm:w-full flex items-center justify-center gap-2 py-2.5 sm:py-3 sm:mb-4 bg-secondary text-secondary-foreground rounded-lg text-sm font-medium hover:bg-secondary/90 transition-colors"
                  >
                    <Camera size={16} className="sm:w-[18px] sm:h-[18px]" />
                    <span className="hidden xs:inline sm:inline">Tirar Foto</span>
                    <span className="xs:hidden">Foto</span>
                  </button>
                )}

                {/* Upload Button */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 sm:flex-none sm:w-full flex items-center justify-center gap-2 py-2.5 sm:py-3 bg-secondary text-secondary-foreground rounded-lg text-sm font-medium hover:bg-secondary/90 transition-colors"
                >
                  <Upload size={16} className="sm:w-[18px] sm:h-[18px]" />
                  <span className="hidden xs:inline sm:inline">Enviar Fotos</span>
                  <span className="xs:hidden">Enviar</span>
                </button>
              </div>

              {/* Hidden Inputs */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileUpload}
                className="hidden"
              />
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleCameraCapture}
                className="hidden"
              />
            </div>

            {/* Export Button */}
            <button
              onClick={handleExport}
              className="w-full flex items-center justify-center gap-2 py-3 sm:py-4 bg-primary text-primary-foreground rounded-lg text-sm sm:text-base font-semibold hover:bg-primary/90 transition-colors shadow-md"
            >
              <FileDown size={18} className="sm:w-5 sm:h-5" />
              Imprimir Relatório
            </button>

            {/* Photo Count (Controle Lateral) */}
            <div className="text-center text-xs sm:text-sm text-muted-foreground">
              {formatPhotoCount(photos.length)}
            </div>
          </aside>

          {/* Photo Gallery (ZONA DE DROP) */}
          <section className="flex-1 order-1 lg:order-2">
            <div 
              ref={photoGalleryRef} 
              className="bg-card rounded-lg border border-border p-3 sm:p-4 shadow-sm min-h-[300px] sm:min-h-[400px] transition-all duration-150"
            >
              <h2 className="font-semibold text-card-foreground mb-3 sm:mb-4 text-sm sm:text-base">
                Galeria de Fotos 
                <span className="ml-2 font-normal text-muted-foreground/80">({formatPhotoCount(photos.length)})</span>
              </h2>

              {photos.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 sm:py-16 text-center">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-muted flex items-center justify-center mb-3 sm:mb-4">
                    <ImagePlus size={24} className="text-muted-foreground sm:w-8 sm:h-8" />
                  </div>
                  <p className="text-muted-foreground mb-2 text-sm sm:text-base font-medium">
                    {formatPhotoCount(photos.length)}
                  </p>
                  <p className="text-xs sm:text-sm text-muted-foreground/70 px-4">
                    Use os controles ou **arraste imagens** para esta área.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
                  {photos.map((photo) => (
                    <PhotoCard
                      key={photo.id}
                      photo={photo}
                      onUpdateDescription={(description) =>
                        updatePhotoDescription(photo.id, description)
                      }
                      onRemove={() => removePhoto(photo.id)}
                    />
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>
      </main>

      <ExportModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}