// src/components/TicketForm.tsx
import { useState, type FormEvent, type ChangeEvent } from "react";
import type { CreateTicketDTO } from "../types/ticket";
import "./TicketForm.css";

interface TicketFormProps {
  onSubmitTicket: (data: CreateTicketDTO) => void;
  isLoading?: boolean;
}

const INITIAL_STATE: CreateTicketDTO = {
  requesterName: "",
  department: "",
  category: "hardware",
  priority: "media",
  description: "",
};

export function TicketForm({
  onSubmitTicket,
  isLoading = false,
}: TicketFormProps) {
  const [formData, setFormData] = useState<CreateTicketDTO>(INITIAL_STATE);

  // Manipulador genérico para campos de texto, select e textarea
  function handleChange(
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    onSubmitTicket(formData);
  }

  return (
    <form className="ticket-form" onSubmit={handleSubmit} noValidate={false}>
      {/* Campo: Nome do Solicitante */}
      <div className="form-group">
        <label htmlFor="requesterName">Seu Nome Completo *</label>
        <input
          type="text"
          id="requesterName"
          name="requesterName"
          value={formData.requesterName}
          onChange={handleChange}
          placeholder="Ex: João da Silva"
          required
          disabled={isLoading}
        />
      </div>

      {/* Campo: Departamento / Setor */}
      <div className="form-group">
        <label htmlFor="department">Departamento / Setor *</label>
        <input
          type="text"
          id="department"
          name="department"
          value={formData.department}
          onChange={handleChange}
          placeholder="Ex: Financeiro, RH, Operações"
          required
          disabled={isLoading}
        />
      </div>

      {/* Linha dupla: Categoria e Prioridade */}
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="category">Categoria do Problema</label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            disabled={isLoading}
          >
            <option value="hardware">
              Hardware (Computador, Monitor, Mouse)
            </option>
            <option value="software">
              Software (Planilhas, Sistemas, Instalação)
            </option>
            <option value="rede">
              Rede / Internet (Sem conexão, Wi-Fi lento)
            </option>
            <option value="acesso">
              Acessos & Senhas (Login, E-mail, Pastas)
            </option>
            <option value="outro">Outro Assunto</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="priority">Impacto / Urgência</label>
          <select
            id="priority"
            name="priority"
            value={formData.priority}
            onChange={handleChange}
            disabled={isLoading}
          >
            <option value="baixa">Baixa (Dúvida ou melhoria)</option>
            <option value="media">
              Média (Consigo trabalhar com limitações)
            </option>
            <option value="alta">Alta (Impacta atividade crítica)</option>
            <option value="urgente">Urgente (Setor totalmente parado)</option>
          </select>
        </div>
      </div>

      {/* Campo: Descrição Detalhada */}
      <div className="form-group">
        <label htmlFor="description">Descrição do Problema *</label>
        <textarea
          id="description"
          name="description"
          rows={4}
          value={formData.description}
          onChange={handleChange}
          placeholder="Descreva o que está acontecendo e, se possível, informe mensagens de erro que apareceram na tela..."
          required
          disabled={isLoading}
        />
      </div>

      {/* Aviso de privacidade (LGPD): o que coletamos, para quê e quem vê */}
      <p className="form-privacy">
        Seu nome, setor e a descrição são usados só para atender este chamado e
        ficam visíveis apenas para a equipe de TI. A consulta pública mostra só
        o andamento, nunca seu nome ou a descrição. Para corrigir ou excluir
        seus dados, fale com o TI.
      </p>

      {/* Botão de Envio */}
      <button type="submit" className="submit-btn" disabled={isLoading}>
        {isLoading ? "Enviando chamado..." : "Registrar Chamado"}
      </button>
    </form>
  );
}
