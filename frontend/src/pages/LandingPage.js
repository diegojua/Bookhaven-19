import { useNavigate } from "react-router-dom";
import { BookOpen, Library, Bookmark, Palette, Clock, Quote } from "lucide-react";

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen paper-texture">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#FAF6EB] border border-[#8D6E63]/20">
              <BookOpen className="w-4 h-4 text-[#8D6E63]" />
              <span className="text-sm text-[#8D6E63] font-medium">Sua biblioteca digital pessoal</span>
            </div>
            
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-[#212121] leading-tight">
              Leitura Digital
              <br />
              <span className="text-[#8D6E63]">Como Papel</span>
            </h1>
            
            <p className="text-xl text-[#424242] max-w-2xl mx-auto leading-relaxed">
              Experiência de leitura que imita a textura e suavidade do papel. 
              Seus livros, suas anotações, seu ritmo.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
              <button 
                onClick={() => navigate("/auth")}
                className="btn-primary"
                data-testid="get-started-btn"
              >
                Começar Agora
              </button>
              <button 
                onClick={() => document.getElementById('features').scrollIntoView({ behavior: 'smooth' })}
                className="btn-secondary"
                data-testid="learn-more-btn"
              >
                Saiba Mais
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="py-24 bg-[#FAF6EB]/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-[#212121] mb-4">Recursos Principais</h2>
            <p className="text-lg text-[#424242]">Tudo que você precisa para uma leitura perfeita</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <Library className="w-8 h-8" />,
                title: "Biblioteca Organizada",
                description: "Gerencie todos os seus livros em um só lugar com visualização em grade elegante"
              },
              {
                icon: <Bookmark className="w-8 h-8" />,
                title: "Marcadores Inteligentes",
                description: "Marque páginas importantes e retorne a elas instantaneamente"
              },
              {
                icon: <Quote className="w-8 h-8" />,
                title: "Anotações Destacadas",
                description: "Destaque trechos e adicione suas próprias notas de leitura"
              },
              {
                icon: <Palette className="w-8 h-8" />,
                title: "Tema Suave",
                description: "Design inspirado em papel bege para leitura confortável"
              },
              {
                icon: <Clock className="w-8 h-8" />,
                title: "Progresso Sincronizado",
                description: "Retome a leitura exatamente de onde parou"
              },
              {
                icon: <BookOpen className="w-8 h-8" />,
                title: "Múltiplos Formatos",
                description: "Suporte para PDF, EPUB e TXT"
              }
            ].map((feature, idx) => (
              <div key={idx} className="paper-card p-8 rounded-xl hover:scale-105 transition-transform duration-300">
                <div className="w-16 h-16 bg-[#8D6E63]/10 rounded-lg flex items-center justify-center text-[#8D6E63] mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-[#212121] mb-3">{feature.title}</h3>
                <p className="text-[#424242] leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="paper-card p-12 rounded-2xl">
            <h2 className="text-4xl font-bold text-[#212121] mb-6">
              Pronto para começar sua jornada de leitura?
            </h2>
            <p className="text-lg text-[#424242] mb-8">
              Crie sua conta gratuitamente e transforme a forma como você lê digitalmente.
            </p>
            <button 
              onClick={() => navigate("/auth")}
              className="btn-primary text-lg px-8 py-4"
              data-testid="cta-get-started-btn"
            >
              Criar Conta Grátis
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-[#212121] text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <BookOpen className="w-6 h-6 text-[#8D6E63]" />
            <span className="text-xl font-semibold">BookHaven</span>
          </div>
          <p className="text-gray-400">
            © 2025 BookHaven. Sua experiência de leitura digital.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
