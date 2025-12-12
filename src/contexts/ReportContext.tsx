import React, { createContext, useContext, useState, ReactNode } from 'react';
import { ReportConfig, Photo, ReportData } from '@/types/report';

interface ReportContextType {
  config: ReportConfig;
  setConfig: (config: ReportConfig) => void;
  photos: Photo[];
  addPhoto: (photo: Photo) => void;
  updatePhotoDescription: (id: string, description: string) => void;
  removePhoto: (id: string) => void;
  getReportData: () => ReportData;
  resetReport: () => void;
}

const defaultConfig: ReportConfig = {
  documentName: '',
  razaoSocial: '',
  tituloRelatorio: '',
  objetivo: '',
  codigoReferencia: '',
  local: '',
  header: '',
  footer: '',
};

const ReportContext = createContext<ReportContextType | undefined>(undefined);

export function ReportProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<ReportConfig>(defaultConfig);
  const [photos, setPhotos] = useState<Photo[]>([]);

  const addPhoto = (photo: Photo) => {
    setPhotos((prev) => [...prev, photo]);
  };

  const updatePhotoDescription = (id: string, description: string) => {
    setPhotos((prev) =>
      prev.map((photo) =>
        photo.id === id ? { ...photo, description } : photo
      )
    );
  };


  const removePhoto = (id: string) => {
    setPhotos((prev) => prev.filter((photo) => photo.id !== id));
  };


  
  const getReportData = (): ReportData => ({
    config,
    photos,
  });

  const resetReport = () => {
    setConfig(defaultConfig);
    setPhotos([]);
  };

  return (
    <ReportContext.Provider
      value={{
        config,
        setConfig,
        photos,
        addPhoto,
        updatePhotoDescription,
        removePhoto,
        getReportData,
        resetReport,
      }}
    >
      {children}
    </ReportContext.Provider>
  );
}

export function useReport() {
  const context = useContext(ReportContext);
  if (context === undefined) {
    throw new Error('useReport must be used within a ReportProvider');
  }
  return context;
}
