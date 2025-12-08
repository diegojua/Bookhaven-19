import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { toast } from "sonner";
import {
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  Bookmark,
  BookmarkPlus,
  Type,
  Palette,
  Menu,
  BookOpen
} from "lucide-react";
import { ReactReader } from "react-reader";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

const ReaderPage = ({ user }) => {
  const { bookId } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [progress, setProgress] = useState(null);
  const [bookmarks, setBookmarks] = useState([]);
  const [preferences, setPreferences] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(100); // Default for non-paginated
  const [isTextMode, setIsTextMode] = useState(false);
  const [extractedPages, setExtractedPages] = useState([]);

  useEffect(() => {
    fetchData();
  }, [bookId]);

  const fetchData = async () => {
    try {
      const [bookRes, progressRes, bookmarksRes, prefsRes] = await Promise.all([
        api.get(`/books/${bookId}`),
        api.get(`/reading/progress/${bookId}`),
        api.get(`/bookmarks/${bookId}`),
        api.get("/preferences"),
      ]);

      setBook(bookRes.data);
      setProgress(progressRes.data);
      setBookmarks(bookmarksRes.data);
      setPreferences(prefsRes.data);
      console.error(error);
      toast.error("Erro ao carregar livro");
      navigate("/library");
    } finally {
      setLoading(false);
    }
  };

  const toggleTextMode = async () => {
    if (!isTextMode && extractedPages.length === 0 && book.file_format === 'pdf') {
      try {
        setLoading(true);
        const res = await api.get(`/books/${bookId}/extract-text`);
        setExtractedPages(res.data.pages);
        setIsTextMode(true);
      } catch (error) {
        toast.error("Erro ao extrair conteúdo do PDF");
      } finally {
        setLoading(false);
      }
    } else {
      setIsTextMode(!isTextMode);
    }
  };

  const updateProgress = async (page) => {
    try {
      await api.put(`/reading/progress/${bookId}`, {
        current_page: page,
        percentage_complete: (page / totalPages) * 100,
      });
    } catch (error) {
      console.error("Error updating progress", error);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    setCurrentPage(newPage);
    updateProgress(newPage);
  };

  const handleLocationChanged = (epubcifi) => {
    setLocation(epubcifi);
    api.put(`/reading/progress/${bookId}`, {
      last_position: epubcifi,
    }).catch(err => console.error(err));
  };

  const addBookmark = async () => {
    try {
      await api.post("/bookmarks", {
        book_id: bookId,
        position: `page-${currentPage}`,
        page_number: currentPage,
        note: `Marcador na página ${currentPage}`,
      });
      toast.success("Marcador adicionado!");
      fetchData();
    } catch (error) {
      toast.error("Erro ao adicionar marcador");
    }
  };

  const updatePreference = async (key, value) => {
    try {
      await api.put("/preferences", { [key]: value });
      setPreferences({ ...preferences, [key]: value });
    } catch (error) {
      toast.error("Erro ao atualizar preferências");
    }
  };

  if (loading || !book || !preferences) {
    return <div className="flex items-center justify-center h-screen bg-[#FDFBF5]">Carregando...</div>;
  }

  const percentage = Math.round((currentPage / totalPages) * 100);

  // Determine background and text color based on theme
  const getThemeStyles = () => {
    return {
      backgroundColor: preferences.theme === 'dark' ? '#1a1a1a' : 
                       preferences.theme === 'sepia' ? '#f4ecd8' : '#ffffff',
      color: preferences.theme === 'dark' ? '#e5e5e5' : '#1a1a1a',
    };
  };

  return (
    <div className="h-screen flex flex-col bg-[#FDFBF5]" style={isTextMode ? getThemeStyles() : {}}>
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-[#8D6E63]/20 px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/library")}
            data-testid="back-to-library-btn"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="font-semibold text-[#212121] line-clamp-1">{book.title}</h1>
            <p className="text-xs text-[#8D6E63]">{book.author}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {book.file_format === 'pdf' && (
             <Button 
               variant={isTextMode ? "default" : "outline"}
               size="sm"
               onClick={toggleTextMode}
               className="hidden sm:flex"
             >
               {isTextMode ? <Type className="w-4 h-4 mr-2" /> : <BookOpen className="w-4 h-4 mr-2" />}
               {isTextMode ? "Modo Original" : "Modo Leitura"}
             </Button>
          )}

          <span className="text-sm text-[#424242] hidden sm:block">
            {currentPage} / {totalPages} ({percentage}%)
          </span>
          
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" data-testid="settings-menu-btn">
                <Menu className="w-4 h-4" />
              </Button>
            </SheetTrigger>
            <SheetContent className="w-[300px] sm:w-[400px]">
              <SheetHeader>
                <SheetTitle>Configurações de Leitura</SheetTitle>
              </SheetHeader>
              
              <div className="space-y-6 py-6">
                {/* Theme Selection */}
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Palette className="w-4 h-4" />
                    Tema
                  </label>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => updatePreference("theme", "light")}
                      className={`w-8 h-8 rounded-full border bg-white ${preferences.theme === 'light' ? 'ring-2 ring-blue-500' : ''}`}
                    />
                    <button 
                      onClick={() => updatePreference("theme", "sepia")}
                      className={`w-8 h-8 rounded-full border bg-[#f4ecd8] ${preferences.theme === 'sepia' ? 'ring-2 ring-blue-500' : ''}`}
                    />
                    <button 
                      onClick={() => updatePreference("theme", "dark")}
                      className={`w-8 h-8 rounded-full border bg-[#1a1a1a] ${preferences.theme === 'dark' ? 'ring-2 ring-blue-500' : ''}`}
                    />
                  </div>
                </div>

                <Separator />

                {/* Font Size */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <Type className="w-4 h-4" />
                      Tamanho da Fonte
                    </label>
                    <span className="text-sm text-[#424242]">{preferences.font_size}px</span>
                  </div>
                  <Slider
                    value={[preferences.font_size]}
                    onValueChange={([value]) => updatePreference("font_size", value)}
                    min={12}
                    max={32}
                    step={1}
                    data-testid="font-size-slider"
                  />
                </div>

                <Separator />

                {/* Font Family */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Fonte</label>
                  <Select
                    value={preferences.font_family}
                    onValueChange={(value) => updatePreference("font_family", value)}
                  >
                    <SelectTrigger data-testid="font-family-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Merriweather">Merriweather (Serif)</SelectItem>
                      <SelectItem value="Georgia">Georgia (Serif)</SelectItem>
                      <SelectItem value="Times New Roman">Times New Roman (Serif)</SelectItem>
                      <SelectItem value="Inter">Inter (Sans)</SelectItem>
                      <SelectItem value="Roboto">Roboto (Sans)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                {/* Line Spacing */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Espaçamento</label>
                    <span className="text-sm text-[#424242]">{preferences.line_spacing}</span>
                  </div>
                  <Slider
                    value={[preferences.line_spacing]}
                    onValueChange={([value]) => updatePreference("line_spacing", value)}
                    min={1.0}
                    max={2.5}
                    step={0.1}
                    data-testid="line-spacing-slider"
                  />
                </div>

                <Separator />

                {/* Bookmarks */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <Bookmark className="w-4 h-4" />
                      Marcadores ({bookmarks.length})
                    </label>
                  </div>
                  {bookmarks.length === 0 ? (
                    <p className="text-sm text-[#424242]">Nenhum marcador ainda</p>
                  ) : (
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {bookmarks.map((bookmark) => (
                        <div
                          key={bookmark.id}
                          onClick={() => handlePageChange(bookmark.page_number)}
                          className="p-2 bg-[#FAF6EB] rounded cursor-pointer hover:bg-[#F5F0E1] transition-colors"
                          data-testid={`bookmark-${bookmark.id}`}
                        >
                          <p className="text-sm font-medium">Página {bookmark.page_number}</p>
                          {bookmark.note && <p className="text-xs text-[#424242]">{bookmark.note}</p>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>

          <Button
            variant="outline"
            size="icon"
            onClick={addBookmark}
            data-testid="add-bookmark-btn"
          >
            <BookmarkPlus className="w-4 h-4" />
          </Button>
        </div>
      </header>

      {/* Reading Content */}
      <div className="flex-1 overflow-y-auto" style={isTextMode ? getThemeStyles() : {}}>
        {isTextMode ? (
           <div
             className="max-w-3xl mx-auto px-6 py-12 reading-text whitespace-pre-wrap"
             style={{
               fontSize: `${preferences.font_size}px`,
               fontFamily: preferences.font_family,
               lineHeight: preferences.line_spacing,
               color: getThemeStyles().color,
             }}
             data-testid="reading-content-adaptive"
           >
             {!extractedPages.length ? (
                <div className="flex justify-center py-10">Carregando conteúdo...</div>
             ) : (
                <>
                  <h1 className="text-3xl font-bold mb-8 opacity-80">{book.title}</h1>
                  <p className="text-lg mb-12 opacity-60">por {book.author}</p>
                  
                  {extractedPages.map((page, i) => (
                    <div key={i} className="mb-12 pb-8 border-b border-gray-200/10 last:border-0">
                        <div className="mb-6">{page.text}</div>
                        {page.images && page.images.map((img, imgIdx) => (
                            <img 
                                key={imgIdx} 
                                src={img} 
                                alt={`Ilustração página ${page.page}`} 
                                className="max-w-full h-auto mx-auto my-6 rounded-lg shadow-md"
                                style={{ maxHeight: '80vh' }}
                            />
                        ))}
                        <div className="text-xs opacity-40 text-center mt-4">Página {page.page}</div>
                    </div>
                  ))}
                </>
             )}
           </div>
        ) : book.file_format === 'pdf' ? (
          <iframe 
            src={`${import.meta.env.VITE_BACKEND_URL || "http://localhost:8000"}${book.file_url}`}
            className="w-full h-full"
            title="PDF Viewer"
          />
        ) : book.file_format === 'epub' ? (
          <div className="h-full relative">
            <ReactReader
              url={`${import.meta.env.VITE_BACKEND_URL || "http://localhost:8000"}${book.file_url}`}
              location={location}
              locationChanged={handleLocationChanged}
              epubInitOptions={{
                openAs: 'epub'
              }}
              getRowStyle={() => ({
                 fontFamily: preferences.font_family,
                 fontSize: `${preferences.font_size}px`,
                 lineHeight: preferences.line_spacing,
                 color: getThemeStyles().color,
                 background: getThemeStyles().backgroundColor,
              })}
            />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <p className="text-xl mb-4">Formato {book.file_format} não suportado para leitura online.</p>
            <Button 
              onClick={() => window.open(`${import.meta.env.VITE_BACKEND_URL || "http://localhost:8000"}${book.file_url}`, '_blank')}
            >
              Baixar Arquivo
            </Button>
          </div>
        )}
      </div>

      {/* Footer Navigation */}
      <footer className="bg-white/80 backdrop-blur-sm border-t border-[#8D6E63]/20 px-4 py-4 sticky bottom-0 z-10">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
            <Button
            variant="outline"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            data-testid="prev-page-btn"
          >
            <ChevronLeft className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">Anterior</span>
          </Button>

          <div className="flex-1 text-center">
            <div className="w-full bg-[#FAF6EB] rounded-full h-2 mb-1">
              <div
                className="bg-[#8D6E63] h-2 rounded-full transition-all"
                style={{ width: `${percentage}%` }}
                data-testid="progress-bar"
              />
            </div>
            <p className="text-xs text-[#424242]">
              Página {currentPage} de {totalPages}
            </p>
          </div>

          <Button
            variant="outline"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            data-testid="next-page-btn"
          >
            <span className="hidden sm:inline">Próxima</span>
            <ChevronRight className="w-4 h-4 sm:ml-2" />
          </Button>
        </div>
      </footer>
    </div>
  );
};

export default ReaderPage;
