import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { BookOpen, Mail, Lock, User, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const AuthPage = ({ setUser }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  // Login state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Register state
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerUsername, setRegisterUsername] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");

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

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await api.post("/auth/login", {
        email: loginEmail,
        password: loginPassword,
      });
      localStorage.setItem("token", response.data.access_token);
      setUser(response.data.user);
      toast.success("Login realizado com sucesso!");
      navigate("/library");
    } catch (error) {
      toast.error(error.response?.data?.detail || "Erro ao fazer login");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await api.post("/auth/register", {
        email: registerEmail,
        username: registerUsername,
        password: registerPassword,
      });
      localStorage.setItem("token", response.data.access_token);
      setUser(response.data.user);
      toast.success("Conta criada com sucesso!");
      navigate("/library");
    } catch (error) {
      toast.error(error.response?.data?.detail || "Erro ao criar conta");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 ${
      darkMode 
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
        : 'bg-gradient-to-br from-blue-50 via-white to-purple-50'
    }`}>
      {/* Dark Mode Toggle */}
      <button
        onClick={toggleDarkMode}
        className={`fixed top-6 right-6 p-3 rounded-full transition-all ${
          darkMode 
            ? 'bg-gray-800 text-yellow-400 hover:bg-gray-700' 
            : 'bg-white text-gray-700 hover:bg-gray-100'
        } shadow-lg`}
        data-testid="theme-toggle-btn"
      >
        {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
      </button>

      <div className="w-full max-w-md">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="bg-gradient-to-br from-blue-600 to-purple-600 p-3 rounded-2xl shadow-lg">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
            <span className={`text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent`}>
              BookHaven
            </span>
          </div>
          <p className={`text-lg ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Sua biblioteca pessoal aguarda
          </p>
        </div>

        {/* Auth Card */}
        <div className={`rounded-3xl shadow-2xl overflow-hidden ${
          darkMode ? 'bg-gray-800' : 'bg-white'
        }`}>
          <div className="p-8">
            <Tabs defaultValue="login" className="w-full">
              <TabsList className={`grid w-full grid-cols-2 mb-8 p-1 rounded-xl ${
                darkMode ? 'bg-gray-700' : 'bg-gray-100'
              }`}>
                <TabsTrigger 
                  value="login" 
                  data-testid="login-tab"
                  className={`rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white ${
                    darkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}
                >
                  Entrar
                </TabsTrigger>
                <TabsTrigger 
                  value="register" 
                  data-testid="register-tab"
                  className={`rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white ${
                    darkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}
                >
                  Criar Conta
                </TabsTrigger>
              </TabsList>

              {/* Login Tab */}
              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-5" data-testid="login-form">
                  <div className="space-y-2">
                    <Label htmlFor="login-email" className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                      Email
                    </Label>
                    <div className="relative">
                      <Mail className={`absolute left-3 top-3.5 w-5 h-5 ${
                        darkMode ? 'text-gray-400' : 'text-blue-600'
                      }`} />
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="seu@email.com"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        className={`pl-11 h-12 ${
                          darkMode 
                            ? 'bg-gray-700 border-gray-600 text-white placeholder:text-gray-400' 
                            : 'bg-gray-50 border-gray-200'
                        }`}
                        required
                        data-testid="login-email-input"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="login-password" className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                      Senha
                    </Label>
                    <div className="relative">
                      <Lock className={`absolute left-3 top-3.5 w-5 h-5 ${
                        darkMode ? 'text-gray-400' : 'text-blue-600'
                      }`} />
                      <Input
                        id="login-password"
                        type="password"
                        placeholder="••••••••"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        className={`pl-11 h-12 ${
                          darkMode 
                            ? 'bg-gray-700 border-gray-600 text-white placeholder:text-gray-400' 
                            : 'bg-gray-50 border-gray-200'
                        }`}
                        required
                        data-testid="login-password-input"
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-base font-medium shadow-lg"
                    disabled={loading}
                    data-testid="login-submit-btn"
                  >
                    {loading ? "Entrando..." : "Entrar"}
                  </Button>
                </form>
              </TabsContent>

              {/* Register Tab */}
              <TabsContent value="register">
                <form onSubmit={handleRegister} className="space-y-5" data-testid="register-form">
                  <div className="space-y-2">
                    <Label htmlFor="register-email" className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                      Email
                    </Label>
                    <div className="relative">
                      <Mail className={`absolute left-3 top-3.5 w-5 h-5 ${
                        darkMode ? 'text-gray-400' : 'text-blue-600'
                      }`} />
                      <Input
                        id="register-email"
                        type="email"
                        placeholder="seu@email.com"
                        value={registerEmail}
                        onChange={(e) => setRegisterEmail(e.target.value)}
                        className={`pl-11 h-12 ${
                          darkMode 
                            ? 'bg-gray-700 border-gray-600 text-white placeholder:text-gray-400' 
                            : 'bg-gray-50 border-gray-200'
                        }`}
                        required
                        data-testid="register-email-input"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-username" className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                      Nome de Usuário
                    </Label>
                    <div className="relative">
                      <User className={`absolute left-3 top-3.5 w-5 h-5 ${
                        darkMode ? 'text-gray-400' : 'text-blue-600'
                      }`} />
                      <Input
                        id="register-username"
                        type="text"
                        placeholder="seu_usuario"
                        value={registerUsername}
                        onChange={(e) => setRegisterUsername(e.target.value)}
                        className={`pl-11 h-12 ${
                          darkMode 
                            ? 'bg-gray-700 border-gray-600 text-white placeholder:text-gray-400' 
                            : 'bg-gray-50 border-gray-200'
                        }`}
                        required
                        data-testid="register-username-input"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-password" className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                      Senha
                    </Label>
                    <div className="relative">
                      <Lock className={`absolute left-3 top-3.5 w-5 h-5 ${
                        darkMode ? 'text-gray-400' : 'text-blue-600'
                      }`} />
                      <Input
                        id="register-password"
                        type="password"
                        placeholder="••••••••"
                        value={registerPassword}
                        onChange={(e) => setRegisterPassword(e.target.value)}
                        className={`pl-11 h-12 ${
                          darkMode 
                            ? 'bg-gray-700 border-gray-600 text-white placeholder:text-gray-400' 
                            : 'bg-gray-50 border-gray-200'
                        }`}
                        required
                        data-testid="register-password-input"
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-base font-medium shadow-lg"
                    disabled={loading}
                    data-testid="register-submit-btn"
                  >
                    {loading ? "Criando..." : "Criar Conta"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </div>

          {/* Footer */}
          <div className={`px-8 py-6 border-t ${
            darkMode ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-200'
          }`}>
            <button
              onClick={() => navigate("/")}
              className={`text-sm hover:underline ${
                darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-800'
              }`}
              data-testid="back-to-home-btn"
            >
              ← Voltar para a página inicial
            </button>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-8 text-center">
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Ao criar uma conta, você concorda com nossos Termos de Serviço
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
