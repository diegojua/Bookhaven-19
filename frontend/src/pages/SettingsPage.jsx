import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { ArrowLeft, User, Palette, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";

const SettingsPage = ({ user, setUser }) => {
  const navigate = useNavigate();
  const [preferences, setPreferences] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    try {
      const response = await api.get("/preferences");
      setPreferences(response.data);
    } catch (error) {
      toast.error("Erro ao carregar preferências");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put("/preferences", preferences);
      toast.success("Preferências salvas com sucesso!");
    } catch (error) {
      toast.error("Erro ao salvar preferências");
    } finally {
      setSaving(false);
    }
  };

  const updatePreference = (key, value) => {
    setPreferences({ ...preferences, [key]: value });
  };

  if (loading || !preferences) {
    return <div className="flex items-center justify-center h-screen bg-[#FDFBF5]">Carregando...</div>;
  }

  return (
    <div className="min-h-screen paper-texture">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-[#8D6E63]/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/library")}
              data-testid="back-btn"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-2xl font-bold text-[#212121]">Configurações</h1>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="paper-card rounded-2xl p-8 space-y-8">
          {/* User Info */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <User className="w-5 h-5 text-[#8D6E63]" />
              <h2 className="text-xl font-semibold text-[#212121]">Perfil</h2>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-[#424242]">Nome de usuário:</span>
                <span className="font-medium text-[#212121]">{user?.username}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#424242]">Email:</span>
                <span className="font-medium text-[#212121]">{user?.email}</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Reading Preferences */}
          <div>
            <div className="flex items-center gap-2 mb-6">
              <Palette className="w-5 h-5 text-[#8D6E63]" />
              <h2 className="text-xl font-semibold text-[#212121]">Preferências de Leitura</h2>
            </div>

            <div className="space-y-6">
              {/* Theme */}
              <div className="space-y-2">
                <Label>Tema</Label>
                <Select
                  value={preferences.theme}
                  onValueChange={(value) => updatePreference("theme", value)}
                >
                  <SelectTrigger data-testid="theme-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="soft-beige">Soft Beige (Padrão)</SelectItem>
                    <SelectItem value="light-gray">Cinza Claro</SelectItem>
                    <SelectItem value="dark-mode">Modo Escuro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Font Family */}
              <div className="space-y-2">
                <Label>Fonte</Label>
                <Select
                  value={preferences.font_family}
                  onValueChange={(value) => updatePreference("font_family", value)}
                >
                  <SelectTrigger data-testid="font-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Merriweather">Merriweather</SelectItem>
                    <SelectItem value="Georgia">Georgia</SelectItem>
                    <SelectItem value="Times New Roman">Times New Roman</SelectItem>
                    <SelectItem value="Inter">Inter</SelectItem>
                    <SelectItem value="Arial">Arial</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Font Size */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Tamanho da Fonte</Label>
                  <span className="text-sm text-[#424242]">{preferences.font_size}px</span>
                </div>
                <Slider
                  value={[preferences.font_size]}
                  onValueChange={([value]) => updatePreference("font_size", value)}
                  min={12}
                  max={28}
                  step={1}
                  data-testid="font-size-slider"
                />
              </div>

              {/* Line Spacing */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Espaçamento entre Linhas</Label>
                  <span className="text-sm text-[#424242]">{preferences.line_spacing.toFixed(1)}</span>
                </div>
                <Slider
                  value={[preferences.line_spacing]}
                  onValueChange={([value]) => updatePreference("line_spacing", value)}
                  min={1.0}
                  max={3.0}
                  step={0.1}
                  data-testid="line-spacing-slider"
                />
              </div>

              {/* Margin Size */}
              <div className="space-y-2">
                <Label>Tamanho das Margens</Label>
                <Select
                  value={preferences.margin_size}
                  onValueChange={(value) => updatePreference("margin_size", value)}
                >
                  <SelectTrigger data-testid="margin-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="small">Pequena</SelectItem>
                    <SelectItem value="medium">Média</SelectItem>
                    <SelectItem value="large">Grande</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Brightness */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Brilho</Label>
                  <span className="text-sm text-[#424242]">{preferences.brightness}%</span>
                </div>
                <Slider
                  value={[preferences.brightness]}
                  onValueChange={([value]) => updatePreference("brightness", value)}
                  min={50}
                  max={100}
                  step={5}
                  data-testid="brightness-slider"
                />
              </div>

              {/* Auto Night Mode */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Modo Noturno Automático</Label>
                  <p className="text-sm text-[#424242]">Ativar automaticamente à noite</p>
                </div>
                <Switch
                  checked={preferences.auto_night_mode}
                  onCheckedChange={(checked) => updatePreference("auto_night_mode", checked)}
                  data-testid="night-mode-switch"
                />
              </div>

              {/* Page Turn Animation */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Animação de Virar Página</Label>
                  <p className="text-sm text-[#424242]">Transição suave entre páginas</p>
                </div>
                <Switch
                  checked={preferences.page_turn_animation}
                  onCheckedChange={(checked) => updatePreference("page_turn_animation", checked)}
                  data-testid="animation-switch"
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Save Button */}
          <Button
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-[#8D6E63] hover:bg-[#6D4C41] text-white"
            data-testid="save-settings-btn"
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? "Salvando..." : "Salvar Alterações"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
