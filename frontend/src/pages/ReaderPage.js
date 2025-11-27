import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "@/App";
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
} from "lucide-react";
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
  const [totalPages] = useState(100); // Mock

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
      setCurrentPage(progressRes.data.current_page || 1);
    } catch (error) {
      toast.error("Erro ao carregar livro");
      navigate("/library");
    } finally {
      setLoading(false);
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

  return (
    <div className="h-screen flex flex-col bg-[#FDFBF5]">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-[#8D6E63]/20 px-4 py-3 flex items-center justify-between">
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
                    max={24}
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
                      <SelectItem value="Merriweather">Merriweather</SelectItem>
                      <SelectItem value="Georgia">Georgia</SelectItem>
                      <SelectItem value="Times New Roman">Times New Roman</SelectItem>
                      <SelectItem value="Inter">Inter</SelectItem>
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
      <div className="flex-1 overflow-y-auto">
        <div
          className="max-w-4xl mx-auto px-8 py-12 reading-text"
          style={{
            fontSize: `${preferences.font_size}px`,
            fontFamily: preferences.font_family,
            lineHeight: preferences.line_spacing,
          }}
          data-testid="reading-content"
        >
          <h1 className="text-3xl font-bold mb-8 text-[#212121]">{book.title}</h1>
          <p className="text-lg text-[#8D6E63] mb-12">por {book.author}</p>

          <div className="space-y-6 text-[#212121]">
            <p className="indent-8">
              Esta é uma visualização de demonstração do leitor de livros. Página {currentPage} de {totalPages}.
            </p>
            <p className="indent-8">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore
              et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut
              aliquip ex ea commodo consequat.
            </p>
            <p className="indent-8">
              Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
              pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit
              anim id est laborum.
            </p>
            <p className="indent-8">
              Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium,
              totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae
              dicta sunt explicabo.
            </p>
            <p className="indent-8">
              Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur
              magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem
              ipsum quia dolor sit amet, consectetur, adipisci velit.
            </p>
          </div>
        </div>
      </div>

      {/* Footer Navigation */}
      <footer className="bg-white/80 backdrop-blur-sm border-t border-[#8D6E63]/20 px-4 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <Button
            variant="outline"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            data-testid="prev-page-btn"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Anterior
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
            Próxima
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </footer>
    </div>
  );
};

export default ReaderPage;
