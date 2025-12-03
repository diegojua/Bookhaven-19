import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/App";
import { toast } from "sonner";
import { 
  BookOpen, Plus, LogOut, Settings, Search, Filter, 
  Heart, TrendingUp, Star, Sun, Moon, BarChart3, Clock, BookMarked 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

const CATEGORIES = [
  { value: "all", label: "📚 Todos", icon: "📚" },
  { value: "fiction", label: "✨ Ficção", icon: "✨" },
  { value: "science", label: "🔬 Ciência", icon: "🔬" },
  { value: "fantasy", label: "🐉 Fantasia", icon: "🐉" },
  { value: "romance", label: "💕 Romance", icon: "💕" },
  { value: "mystery", label: "🔍 Mistério", icon: "🔍" },
  { value: "history", label: "📜 História", icon: "📜" },
  { value: "business", label: "💼 Negócios", icon: "💼" },
];

const LibraryPage = ({ user, setUser }) => {
  const navigate = useNavigate();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("popular");
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [readingProgress, setReadingProgress] = useState({});

  // Upload form
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [description, setDescription] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [category, setCategory] = useState("fiction");
  const [file, setFile] = useState(null);

  useEffect(() => {
    fetchBooks();
    loadFavorites();
    loadProgress();
    const savedDarkMode = localStorage.getItem("darkMode") === "true";
    setDarkMode(savedDarkMode);
  }, []);

  useEffect(() => {
    document.body.className = darkMode ? "dark-mode" : "";
    localStorage.setItem("darkMode", darkMode);
  }, [darkMode]);

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

  const loadFavorites = () => {
    const saved = localStorage.getItem("favorites");
    if (saved) setFavorites(JSON.parse(saved));
  };

  const loadProgress = () => {
    const saved = localStorage.getItem("readingProgress");
    if (saved) setReadingProgress(JSON.parse(saved));
  };

  const toggleFavorite = (bookId) => {
    const newFavorites = favorites.includes(bookId)
      ? favorites.filter((id) => id !== bookId)
      : [...favorites, bookId];
    setFavorites(newFavorites);
    localStorage.setItem("favorites", JSON.stringify(newFavorites));
    toast.success(
      favorites.includes(bookId) ? "Removido dos favoritos" : "Adicionado aos favoritos!"
    );
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
    formData.append("category", category);
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
    setCategory("fiction");
    setFile(null);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
    navigate("/");
    toast.success("Logout realizado");
  };

  const filteredBooks = books
    .filter((book) => {
      const matchesSearch =
        book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.author.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        selectedCategory === "all" || book.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (sortBy === "popular") return (b.rating || 0) - (a.rating || 0);
      if (sortBy === "recent") return new Date(b.created_at) - new Date(a.created_at);
      if (sortBy === "rating") return (b.rating || 0) - (a.rating || 0);
      return 0;
    });

  const stats = {
    booksRead: Object.keys(readingProgress).filter(
      (id) => readingProgress[id] >= 100
    ).length,
    favorites: favorites.length,
    readingHours: Math.round(Object.values(readingProgress).reduce((a, b) => a + b, 0) / 20),
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#FDFBF5]">
        Carregando...
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' : 'bg-gradient-to-br from-blue-50 via-white to-purple-50'}`}>
      {/* Header */}
      <header className={`${darkMode ? 'bg-gray-800/80 border-gray-700' : 'bg-white/80 border-[#8D6E63]/20'} backdrop-blur-sm border-b sticky top-0 z-50`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-blue-600 to-purple-600 p-2 rounded-xl">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-[#212121]'}`}>
                  BookHaven
                </h1>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-[#424242]'}`}>
                  Olá, {user?.username}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                onClick={() => setDarkMode(!darkMode)}
                variant="outline"
                size="icon"
                data-testid="theme-toggle-btn"
                className={darkMode ? 'border-gray-700 text-yellow-400' : ''}
              >
                {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </Button>
              <Button
                onClick={() => navigate("/settings")}
                variant="outline"
                size="icon"
                data-testid="settings-btn"
                className={darkMode ? 'border-gray-700 text-gray-300' : ''}
              >
                <Settings className="w-4 h-4" />
              </Button>
              <Button
                onClick={handleLogout}
                variant="outline"
                size="icon"
                data-testid="logout-btn"
                className={darkMode ? 'border-gray-700 text-gray-300' : ''}
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8" data-testid="stats-dashboard">
          <div className={`${darkMode ? 'bg-gradient-to-br from-blue-600 to-blue-700' : 'bg-gradient-to-br from-blue-500 to-blue-600'} rounded-2xl p-6 text-white shadow-lg`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm mb-1">Livros Lidos</p>
                <p className="text-3xl font-bold">{stats.booksRead}</p>
              </div>
              <BookMarked className="w-12 h-12 opacity-80" />
            </div>
          </div>
          <div className={`${darkMode ? 'bg-gradient-to-br from-purple-600 to-purple-700' : 'bg-gradient-to-br from-purple-500 to-purple-600'} rounded-2xl p-6 text-white shadow-lg`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm mb-1">Favoritos</p>
                <p className="text-3xl font-bold">{stats.favorites}</p>
              </div>
              <Heart className="w-12 h-12 opacity-80" />
            </div>
          </div>
          <div className={`${darkMode ? 'bg-gradient-to-br from-pink-600 to-pink-700' : 'bg-gradient-to-br from-pink-500 to-pink-600'} rounded-2xl p-6 text-white shadow-lg`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-pink-100 text-sm mb-1">Horas de Leitura</p>
                <p className="text-3xl font-bold">{stats.readingHours}h</p>
              </div>
              <Clock className="w-12 h-12 opacity-80" />
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="space-y-4 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className={`absolute left-3 top-3 w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-[#8D6E63]'}`} />
              <Input
                placeholder="Buscar por título ou autor..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`pl-11 h-12 ${darkMode ? 'bg-gray-800 border-gray-700 text-white placeholder:text-gray-400' : ''}`}
                data-testid="search-input"
              />
            </div>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className={`w-full lg:w-48 h-12 ${darkMode ? 'bg-gray-800 border-gray-700 text-white' : ''}`} data-testid="sort-select">
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="popular">Mais Popular</SelectItem>
                <SelectItem value="rating">Melhor Avaliado</SelectItem>
                <SelectItem value="recent">Mais Recente</SelectItem>
              </SelectContent>
            </Select>

            <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
              <DialogTrigger asChild>
                <Button 
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white h-12" 
                  data-testid="add-book-btn"
                >
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
                    <Label htmlFor="category">Categoria *</Label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger data-testid="book-category-select">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.slice(1).map((cat) => (
                          <SelectItem key={cat.value} value={cat.value}>
                            {cat.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    disabled={uploading}
                    data-testid="upload-book-btn"
                  >
                    {uploading ? "Enviando..." : "Adicionar Livro"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Categories */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setSelectedCategory(cat.value)}
                className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-all ${
                  selectedCategory === cat.value
                    ? darkMode
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                      : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                    : darkMode
                    ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
                data-testid={`category-${cat.value}`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-[#424242]'}`}>
            {filteredBooks.length} {filteredBooks.length === 1 ? 'livro encontrado' : 'livros encontrados'}
          </p>
        </div>

        {/* Books Grid */}
        {filteredBooks.length === 0 ? (
          <div className="text-center py-20" data-testid="empty-library">
            <BookOpen className={`w-20 h-20 ${darkMode ? 'text-gray-600' : 'text-[#8D6E63]'} mx-auto mb-4 opacity-50`} />
            <h3 className={`text-2xl font-semibold ${darkMode ? 'text-white' : 'text-[#212121]'} mb-2`}>
              {searchQuery || selectedCategory !== "all"
                ? "Nenhum livro encontrado"
                : "Sua biblioteca está vazia"}
            </h3>
            <p className={`${darkMode ? 'text-gray-400' : 'text-[#424242]'} mb-6`}>
              {searchQuery || selectedCategory !== "all"
                ? "Tente ajustar seus filtros de busca"
                : "Comece adicionando seu primeiro livro"}
            </p>
          </div>
        ) : (
          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            data-testid="books-grid"
          >
            {filteredBooks.map((book) => {
              const progress = readingProgress[book.id] || 0;
              const isFavorite = favorites.includes(book.id);
              const rating = book.rating || 4.0;

              return (
                <div
                  key={book.id}
                  className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl hover:scale-102 transition-all duration-300 group relative`}
                  data-testid={`book-card-${book.id}`}
                >
                  {/* Favorite Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(book.id);
                    }}
                    className="absolute top-3 right-3 z-10 bg-white/90 backdrop-blur-sm p-2 rounded-full hover:scale-110 transition-transform"
                    data-testid={`favorite-btn-${book.id}`}
                  >
                    <Heart
                      className={`w-5 h-5 ${
                        isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600'
                      } transition-all`}
                    />
                  </button>

                  {/* Badges */}
                  {book.trending && (
                    <Badge className="absolute top-3 left-3 z-10 bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      Em Alta
                    </Badge>
                  )}

                  {/* Cover Image */}
                  <div
                    onClick={() => navigate(`/reader/${book.id}`)}
                    className="aspect-[3/4] relative overflow-hidden cursor-pointer"
                  >
                    {book.cover_url ? (
                      <>
                        <img
                          src={book.cover_url}
                          alt={book.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      </>
                    ) : (
                      <div className={`w-full h-full flex items-center justify-center ${darkMode ? 'bg-gradient-to-br from-gray-700 to-gray-600' : 'bg-gradient-to-br from-[#8D6E63]/10 to-[#8D6E63]/5'}`}>
                        <BookOpen className={`w-16 h-16 ${darkMode ? 'text-gray-500' : 'text-[#8D6E63]'} opacity-30`} />
                      </div>
                    )}

                    {/* Progress Bar */}
                    {progress > 0 && (
                      <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-black/30">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Book Info */}
                  <div className="p-4">
                    <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-[#212121]'} mb-1 line-clamp-2`}>
                      {book.title}
                    </h3>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-[#8D6E63]'} mb-3`}>
                      {book.author}
                    </p>

                    {/* Rating */}
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 ${
                              i < Math.floor(rating)
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {rating.toFixed(1)} ({book.reviews || 0})
                      </span>
                    </div>

                    {/* Action Button */}
                    <Button
                      onClick={() => navigate(`/reader/${book.id}`)}
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                      size="sm"
                      data-testid={`read-btn-${book.id}`}
                    >
                      {progress > 0 ? `Continuar (${Math.round(progress)}%)` : 'Começar a Ler'}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default LibraryPage;
