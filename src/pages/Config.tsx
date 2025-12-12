import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, FileText, Building2, Target, Hash, MapPin, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useReport } from '@/contexts/ReportContext';

type AccordionSection = 'empresa' | 'relatorio' | 'localizacao' | null;

export default function Config() {
  const navigate = useNavigate();
  const { config, setConfig } = useReport();
  const [openSection, setOpenSection] = useState<AccordionSection>('empresa');
  const [formData, setFormData] = useState(config);

  const toggleSection = (section: AccordionSection) => {
    setOpenSection(openSection === section ? null : section);
  };

  const handleInputChange = (field: keyof typeof formData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleContinue = () => {
    setConfig(formData);
    navigate('/photos');
  };

  const inputClass = "w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground";

  const sections = [
    {
      id: 'empresa' as const,
      title: '1. Dados da Empresa',
      icon: Building2,
      content: (
        <div className="space-y-4">
          <div>
            <label htmlFor="razaoSocial" className="block text-sm font-medium text-foreground mb-1">
              Razão Social
            </label>
            <input
              id="razaoSocial"
              type="text"
              value={formData.razaoSocial}
              onChange={handleInputChange('razaoSocial')}
              placeholder="Ex: EMPRESA LTDA"
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="codigoReferencia" className="block text-sm font-medium text-foreground mb-1">
              Código de Referência
            </label>
            <input
              id="codigoReferencia"
              type="text"
              value={formData.codigoReferencia}
              onChange={handleInputChange('codigoReferencia')}
              placeholder="Ex: NOT-0001"
              className={inputClass}
            />
          </div>
        </div>
      ),
    },
    {
      id: 'relatorio' as const,
      title: '2. Informações do Relatório',
      icon: FileText,
      content: (
        <div className="space-y-4">
          <div>
            <label htmlFor="tituloRelatorio" className="block text-sm font-medium text-foreground mb-1">
              Título do Relatório
            </label>
            <input
              id="tituloRelatorio"
              type="text"
              value={formData.tituloRelatorio}
              onChange={handleInputChange('tituloRelatorio')}
              placeholder="Ex: VISTORIA TÉCNICA"
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="objetivo" className="block text-sm font-medium text-foreground mb-1">
              Objetivo
            </label>
            <textarea
              id="objetivo"
              value={formData.objetivo}
              onChange={handleInputChange('objetivo')}
              placeholder="Ex: INSPEÇÃO DE REGULARIDADE"
              rows={2}
              className={cn(inputClass, "resize-none")}
            />
          </div>
        </div>
      ),
    },
    {
      id: 'localizacao' as const,
      title: '3. Localização',
      icon: MapPin,
      content: (
        <div className="space-y-4">
          <div>
            <label htmlFor="local" className="block text-sm font-medium text-foreground mb-1">
              Local
            </label>
            <input
              id="local"
              type="text"
              value={formData.local}
              onChange={handleInputChange('local')}
              placeholder="Ex: Rua das Flores, 123 - Centro"
              className={inputClass}
            />
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-primary text-primary-foreground py-4 sm:py-6 shadow-lg">
        <div className="container mx-auto px-4">
          <h1 className="text-xl sm:text-2xl font-bold text-center">Relatório Fotográfico</h1>
          <p className="text-center text-primary-foreground/80 mt-1 text-sm sm:text-base">
            Configure as informações do documento
          </p>
        </div>
      </header>

      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-8 max-w-2xl">
        <div className="space-y-3 sm:space-y-4">
          {sections.map((section) => {
            const Icon = section.icon;
            const isOpen = openSection === section.id;

            return (
              <div
                key={section.id}
                className="bg-card rounded-lg border border-border overflow-hidden shadow-sm"
              >
                <button
                  onClick={() => toggleSection(section.id)}
                  className="w-full flex items-center justify-between p-3 sm:p-4 text-left hover:bg-muted/50 transition-colors"
                  aria-expanded={isOpen}
                >
                  <div className="flex items-center gap-2 sm:gap-3">
                    <Icon size={18} className="text-secondary sm:w-5 sm:h-5" />
                    <span className="font-medium text-card-foreground text-sm sm:text-base">
                      {section.title}
                    </span>
                  </div>
                  <ChevronDown
                    size={18}
                    className={cn(
                      "text-muted-foreground transition-transform duration-200 sm:w-5 sm:h-5",
                      isOpen && "rotate-180"
                    )}
                  />
                </button>

                <div
                  className={cn(
                    "overflow-hidden transition-all duration-200",
                    isOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
                  )}
                >
                  <div className="p-3 sm:p-4 pt-0 border-t border-border">
                    {section.content}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <button
          onClick={handleContinue}
          className="w-full mt-6 sm:mt-8 flex items-center justify-center gap-2 py-3 sm:py-4 bg-primary text-primary-foreground rounded-lg text-sm sm:text-base font-semibold hover:bg-primary/90 transition-colors shadow-md"
        >
          Continuar para Fotos
          <ArrowRight size={18} className="sm:w-5 sm:h-5" />
        </button>
      </main>
    </div>
  );
}
