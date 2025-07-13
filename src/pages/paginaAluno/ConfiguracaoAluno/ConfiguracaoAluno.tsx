import "./ConfiguracaoAluno.css";
import AlunoForm from "../../../components/FormularioConfiguracao/Form";
import { useState, useEffect } from "react";
import { useClerk } from "@clerk/clerk-react";
import { User, Settings, Shield, Edit3, UserCheck } from "lucide-react";

export default function ConfiguracaoAluno() {
  const { user } = useClerk();
  const [firstName, setFirstName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || "");
    }
  }, [user]);

  // Simular carregamento dos dados do formulário (igual ao PortalAluno)
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando configurações...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="config-container">
        {/* Header Principal */}
        <header className="config-header">
          <div className="config-header-content">
            <div className="config-welcome-section">
              <div className="config-avatar">
                <User className="w-6 h-6" />
              </div>
              <div className="config-welcome-text">
                <h1 className="config-welcome-title">
                  Olá, {firstName}! <span className="welcome-emoji">⚙️</span>
                </h1>
                <p className="config-welcome-subtitle">
                  Gerencie suas informações pessoais
                </p>
              </div>
            </div>

            <div className="header-actions">
              <div className="notification-icon">
                <Settings className="w-5 h-5" />
              </div>
            </div>
          </div>
        </header>

        {/* Seção de Estatísticas - Compacta */}
        <section className="config-stats-section">
          <div className="config-stats-grid">
            <div className="config-stat-card">
              <div className="config-stat-icon">
                <UserCheck className="w-4 h-4" />
              </div>
              <div className="config-stat-content">
                <p className="config-stat-label">Status</p>
                <p className="config-stat-value">Ativo</p>
              </div>
            </div>

            <div className="config-stat-card">
              <div className="config-stat-icon">
                <Shield className="w-4 h-4" />
              </div>
              <div className="config-stat-content">
                <p className="config-stat-label">Segurança</p>
                <p className="config-stat-value">Protegido</p>
              </div>
            </div>

            <div className="config-stat-card">
              <div className="config-stat-icon">
                <Edit3 className="w-4 h-4" />
              </div>
              <div className="config-stat-content">
                <p className="config-stat-label">Última Edição</p>
                <p className="config-stat-value">Hoje</p>
              </div>
            </div>
          </div>
        </section>

        {/* Conteúdo Principal */}
        <main className="config-main-content">
          <div className="config-form-section">
            <div className="config-form-header">
              <div className="config-form-title-section">
                <Settings className="w-6 h-6" />
                <h2 className="config-form-title">Informações Pessoais</h2>
              </div>
              <p className="config-form-subtitle">
                Atualize seus dados pessoais e mantenha seu perfil sempre
                atualizado
              </p>
            </div>

            <div className="config-form-container">
              <div className="config-form-wrapper">
                <AlunoForm />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
