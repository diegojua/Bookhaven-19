import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/App";
import { toast } from "sonner";
import { BookOpen, Plus, LogOut, Settings, Upload, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const LibraryPage = ({ user, setUser }) => {
  const navigate = useNavigate();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Upload form
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [description, setDescription] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [file, setFile] = useState(null);

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      const response = await api.get("/books");
      setBooks(response.data);
    } catch (error) {
      toast.error("Erro ao carregar livros");
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      toast.error("Selecione um arquivo");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("title", title);
    formData.append("author", author);
    formData.append("description", description);
    formData.append("cover_url", coverUrl);
    formData.append("file", file);

    try {
      await api.post("/books", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Livro adicionado com sucesso!");
      setUploadOpen(false);
      resetForm();
      fetchBooks();
    } catch (error) {
      toast.error(error.response?.data?.detail || "Erro ao adicionar livro");
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setTitle("");
    setAuthor("");
    setDescription("");
    setCoverUrl("");
    setFile(null);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
    navigate("/");
    toast.success("Logout realizado");
  };

  const filteredBooks = books.filter(
    (book) =>
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return <div className="flex items-center justify-center h-screen bg-[#FDFBF5]">Carregando...</div>;
  }

  return (
    <div className="min-h-screen paper-texture">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-[#8D6E63]/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BookOpen className="w-8 h-8 text-[#8D6E63]" />
              <div>
                <h1 className="text-2xl font-bold text-[#212121]">Minha Biblioteca</h1>
                <p className="text-sm text-[#424242]">Olá, {user?.username}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button
                onClick={() => navigate("/settings")}
                variant="outline"
                size="icon"
                data-testid="settings-btn"
              >
                <Settings className="w-4 h-4" />
              </Button>
              <Button
                onClick={handleLogout}
                variant="outline"
                size="icon"
                data-testid="logout-btn"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Upload */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 w-4 h-4 text-[#8D6E63]" />
            <Input
              placeholder="Buscar por título ou autor..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              data-testid="search-input"
            />
          </div>

          <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#8D6E63] hover:bg-[#6D4C41] text-white" data-testid="add-book-btn">
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Livro
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Adicionar Novo Livro</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleUpload} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Título *</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    data-testid="book-title-input"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="author">Autor *</Label>
                  <Input
                    id="author"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    required
                    data-testid="book-author-input"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    data-testid="book-description-input"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cover_url">URL da Capa</Label>
                  <Input
                    id="cover_url"
                    type="url"
                    value={coverUrl}
                    onChange={(e) => setCoverUrl(e.target.value)}
                    placeholder="https://..."
                    data-testid="book-cover-input"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="file">Arquivo (PDF, EPUB, TXT) *</Label>
                  <Input
                    id="file"
                    type="file"
                    accept=".pdf,.epub,.txt"
                    onChange={(e) => setFile(e.target.files[0])}
                    required
                    data-testid="book-file-input"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-[#8D6E63] hover:bg-[#6D4C41]"
                  disabled={uploading}
                  data-testid="upload-book-btn"
                >
                  {uploading ? "Enviando..." : "Adicionar Livro"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Books Grid */}
        {filteredBooks.length === 0 ? (
          <div className="text-center py-20" data-testid="empty-library">
            <BookOpen className="w-20 h-20 text-[#8D6E63] mx-auto mb-4 opacity-50" />
            <h3 className="text-2xl font-semibold text-[#212121] mb-2">
              {searchQuery ? "Nenhum livro encontrado" : "Sua biblioteca está vazia"}
            </h3>
            <p className="text-[#424242] mb-6">
              {searchQuery
                ? "Tente buscar por outro título ou autor"
                : "Comece adicionando seu primeiro livro"}
            </p>
            {!searchQuery && (
              <Button
                onClick={() => setUploadOpen(true)}
                className="bg-[#8D6E63] hover:bg-[#6D4C41] text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Primeiro Livro
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" data-testid="books-grid">
            {filteredBooks.map((book) => (
              <div
                key={book.id}
                onClick={() => navigate(`/reader/${book.id}`)}
                className="paper-card rounded-xl overflow-hidden cursor-pointer hover:scale-105 transition-transform duration-300 group"
                data-testid={`book-card-${book.id}`}
              >
                <div className="aspect-[3/4] bg-gradient-to-br from-[#8D6E63]/10 to-[#8D6E63]/5 relative overflow-hidden">
                  {book.cover_url ? (
                    <img
                      src={book.cover_url}
                      alt={book.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <BookOpen className="w-16 h-16 text-[#8D6E63] opacity-30" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-[#212121] mb-1 line-clamp-2">{book.title}</h3>
                  <p className="text-sm text-[#8D6E63] mb-2">{book.author}</p>
                  <div className="flex items-center justify-between text-xs text-[#424242]">
                    <span>{book.file_format.toUpperCase()}</span>
                    <span>{Math.round(book.file_size / 1024)} KB</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LibraryPage;
