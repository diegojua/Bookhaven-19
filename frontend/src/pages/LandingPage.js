import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, Library, Bookmark, Quote, Clock, Heart, TrendingUp, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";

const LandingPage = () => {
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const savedDarkMode = localStorage.getItem("darkMode") === "true";
    setDarkMode(savedDarkMode);
    document.body.className = savedDarkMode ? "dark-mode" : "";
  }, []);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    document.body.className = newMode ? "dark-mode" : "";
    localStorage.setItem("darkMode", newMode);
  };

  return (
    <div className={`min-h-screen ${
      darkMode 
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
        : 'bg-gradient-to-br from-blue-50 via-white to-purple-50'
    }`}>
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Dark Mode Toggle */}
        <button
          onClick={toggleDarkMode}
          className={`fixed top-6 right-6 z-50 p-3 rounded-full transition-all ${
            darkMode 
              ? 'bg-gray-800 text-yellow-400 hover:bg-gray-700' 
              : 'bg-white text-gray-700 hover:bg-gray-100'
          } shadow-lg`}
          data-testid="theme-toggle-btn"
        >
          {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center space-y-8">
            {/* Badge */}
            <div className={`inline-flex items-center gap-2 px-6 py-3 rounded-full ${
              darkMode 
                ? 'bg-gray-800 border border-gray-700' 
                : 'bg-white border border-purple-200'
            } shadow-lg`}>
              <BookOpen className="w-5 h-5 text-transparent bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text" style={{WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text'}} />
              <span className={`text-sm font-medium ${
                darkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Sua biblioteca digital pessoal
              </span>
            </div>
            
            {/* Title */}
            <div className="space-y-4">
              <h1 className={`text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Leitura Digital
                <br />
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Como Papel
                </span>
              </h1>
            </div>
            
            {/* Subtitle */}
            <p className={`text-xl max-w-2xl mx-auto leading-relaxed ${
              darkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Experiência de leitura que imita a textura e suavidade do papel. 
              Seus livros, suas anotações, seu ritmo.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
              <Button 
                onClick={() => navigate("/auth")}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-6 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all"
                data-testid="get-started-btn"
              >
                Começar Agora
              </Button>
              <Button 
                onClick={() => document.getElementById('features').scrollIntoView({ behavior: 'smooth' })}
                variant="outline"
                className={`px-8 py-6 text-lg rounded-xl ${
                  darkMode 
                    ? 'border-2 border-gray-700 text-gray-300 hover:bg-gray-800' 
                    : 'border-2 border-purple-600 text-purple-600 hover:bg-purple-50'
                }`}
                data-testid="learn-more-btn"
              >
                Saiba Mais
              </Button>
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000" />
        <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-4000" />
      </div>

      {/* Features Section */}
      <div id="features" className={`py-24 ${
        darkMode ? 'bg-gray-900/50' : 'bg-white/50'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className={`text-4xl font-bold mb-4 ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Recursos Principais
            </h2>
            <p className={`text-lg ${
              darkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Tudo que você precisa para uma leitura perfeita
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <Library className="w-8 h-8" />,
                title: "Biblioteca Organizada",
                description: "Gerencie todos os seus livros em um só lugar com visualização em grade elegante",
                gradient: "from-blue-500 to-cyan-500"
              },
              {
                icon: <Bookmark className="w-8 h-8" />,
                title: "Marcadores Inteligentes",
                description: "Marque páginas importantes e retorne a elas instantaneamente",
                gradient: "from-purple-500 to-pink-500"
              },
              {
                icon: <Quote className="w-8 h-8" />,
                title: "Anotações Destacadas",
                description: "Destaque trechos e adicione suas próprias notas de leitura",
                gradient: "from-pink-500 to-rose-500"
              },
              {
                icon: <TrendingUp className="w-8 h-8" />,
                title: "Acompanhamento de Progresso",
                description: "Rastreie seu progresso de leitura com estatísticas detalhadas",
                gradient: "from-emerald-500 to-teal-500"
              },
              {
                icon: <Clock className="w-8 h-8" />,
                title: "Progresso Sincronizado",
                description: "Retome a leitura exatamente de onde parou",
                gradient: "from-amber-500 to-orange-500"
              },
              {
                icon: <Heart className="w-8 h-8" />,
                title: "Sistema de Favoritos",
                description: "Salve seus livros favoritos para acesso rápido",
                gradient: "from-red-500 to-pink-500"
              }
            ].map((feature, idx) => (
              <div 
                key={idx} 
                className={`group p-8 rounded-2xl transition-all duration-300 hover:scale-105 ${
                  darkMode 
                    ? 'bg-gray-800 hover:bg-gray-750' 
                    : 'bg-white hover:shadow-2xl'
                } shadow-lg`}
              >
                <div className={`w-16 h-16 bg-gradient-to-r ${feature.gradient} rounded-xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform`}>
                  {feature.icon}
                </div>
                <h3 className={`text-xl font-semibold mb-3 ${
                  darkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {feature.title}
                </h3>
                <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { label: "Livros Disponíveis", value: "10K+" },
              { label: "Usuários Ativos", value: "5K+" },
              { label: "Páginas Lidas", value: "1M+" },
              { label: "Avaliação", value: "4.9★" }
            ].map((stat, idx) => (
              <div key={idx} className="text-center">
                <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                  {stat.value}
                </div>
                <div className={`text-sm ${
                  darkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className={`p-12 rounded-3xl shadow-2xl ${
            darkMode 
              ? 'bg-gradient-to-br from-gray-800 to-gray-900' 
              : 'bg-gradient-to-br from-white to-gray-50'
          }`}>
            <h2 className={`text-4xl font-bold mb-6 ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Pronto para começar sua jornada de leitura?
            </h2>
            <p className={`text-lg mb-8 ${
              darkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Crie sua conta gratuitamente e transforme a forma como você lê digitalmente.
            </p>
            <Button 
              onClick={() => navigate("/auth")}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-10 py-6 text-lg rounded-xl shadow-lg"
              data-testid="cta-get-started-btn"
            >
              Criar Conta Grátis
            </Button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className={`py-12 border-t ${
        darkMode 
          ? 'bg-gray-900 border-gray-800' 
          : 'bg-white border-gray-200'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="bg-gradient-to-br from-blue-600 to-purple-600 p-2 rounded-xl">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              BookHaven
            </span>
          </div>
          <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
            © 2025 BookHaven. Sua experiência de leitura digital.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
