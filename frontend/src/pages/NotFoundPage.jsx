import React from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { BookOpen } from "lucide-react";

const NotFoundPage = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-100 to-purple-50 p-8">
      <div className="flex flex-col items-center gap-4">
        <BookOpen className="w-16 h-16 text-purple-600" />
        <h1 className="text-4xl font-bold text-gray-900">404 - Página não encontrada</h1>
        <p className="text-lg text-gray-600">O recurso solicitado não foi encontrado.<br />Verifique o endereço ou volte para a página inicial.</p>
        <Button onClick={() => navigate("/")} className="mt-4 px-8 py-4 text-lg bg-purple-600 text-white rounded-xl shadow-lg">
          Voltar para Home
        </Button>
      </div>
    </div>
  );
};

export default NotFoundPage;
