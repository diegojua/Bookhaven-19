import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/App";
import { toast } from "sonner";
import { BookOpen, Mail, Lock, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const AuthPage = ({ setUser }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // Login state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Register state
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerUsername, setRegisterUsername] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");

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
    <div className="min-h-screen paper-texture flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <BookOpen className="w-10 h-10 text-[#8D6E63]" />
            <span className="text-3xl font-bold text-[#212121]">BookHaven</span>
          </div>
          <p className="text-[#424242]">Sua biblioteca pessoal aguarda</p>
        </div>

        <div className="paper-card p-8 rounded-2xl">
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login" data-testid="login-tab">Entrar</TabsTrigger>
              <TabsTrigger value="register" data-testid="register-tab">Criar Conta</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4" data-testid="login-form">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 w-4 h-4 text-[#8D6E63]" />
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="seu@email.com"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      className="pl-10"
                      required
                      data-testid="login-email-input"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="login-password">Senha</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 w-4 h-4 text-[#8D6E63]" />
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="••••••••"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="pl-10"
                      required
                      data-testid="login-password-input"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-[#8D6E63] hover:bg-[#6D4C41] text-white"
                  disabled={loading}
                  data-testid="login-submit-btn"
                >
                  {loading ? "Entrando..." : "Entrar"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="register">
              <form onSubmit={handleRegister} className="space-y-4" data-testid="register-form">
                <div className="space-y-2">
                  <Label htmlFor="register-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 w-4 h-4 text-[#8D6E63]" />
                    <Input
                      id="register-email"
                      type="email"
                      placeholder="seu@email.com"
                      value={registerEmail}
                      onChange={(e) => setRegisterEmail(e.target.value)}
                      className="pl-10"
                      required
                      data-testid="register-email-input"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-username">Nome de Usuário</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 w-4 h-4 text-[#8D6E63]" />
                    <Input
                      id="register-username"
                      type="text"
                      placeholder="seu_usuario"
                      value={registerUsername}
                      onChange={(e) => setRegisterUsername(e.target.value)}
                      className="pl-10"
                      required
                      data-testid="register-username-input"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-password">Senha</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 w-4 h-4 text-[#8D6E63]" />
                    <Input
                      id="register-password"
                      type="password"
                      placeholder="••••••••"
                      value={registerPassword}
                      onChange={(e) => setRegisterPassword(e.target.value)}
                      className="pl-10"
                      required
                      data-testid="register-password-input"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-[#8D6E63] hover:bg-[#6D4C41] text-white"
                  disabled={loading}
                  data-testid="register-submit-btn"
                >
                  {loading ? "Criando..." : "Criar Conta"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </div>

        <div className="text-center mt-6">
          <button
            onClick={() => navigate("/")}
            className="text-[#8D6E63] hover:underline"
            data-testid="back-to-home-btn"
          >
            Voltar para a página inicial
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
