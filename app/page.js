'use client';

import { useState } from 'react';

export default function Home() {
  const [participants, setParticipants] = useState([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [secretPairs, setSecretPairs] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const addParticipant = () => {
    if (name && email) {
      setParticipants([...participants, { name, email }]);
      setName('');
      setEmail('');
    }
  };

  const removeParticipant = (index) => {
    const newParticipants = [...participants];
    newParticipants.splice(index, 1);
    setParticipants(newParticipants);
  };

  const generatePairs = async () => {
    if (participants.length < 2) {
      alert('É necessário ter pelo menos 2 participantes para realizar o sorteio!');
      return;
    }

    setIsLoading(true);

    const shuffledParticipants = [...participants];
    for (let i = shuffledParticipants.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledParticipants[i], shuffledParticipants[j]] = [shuffledParticipants[j], shuffledParticipants[i]];
    }

    const pairs = {};
    let isValid = false;

    while (!isValid) {
      isValid = true;
      for (let i = 0; i < participants.length; i++) {
        const participant = participants[i];
        const secretIndex = (i + 1) % participants.length;
        if (shuffledParticipants[secretIndex].name === participant.name) {
          isValid = false;
          break;
        }
        pairs[participant.name] = shuffledParticipants[secretIndex].name;
      }
    }

    setSecretPairs(pairs);

    try {
      for (const participant of participants) {
        const secretFriend = pairs[participant.name];
        await sendEmail(participant.name, participant.email, secretFriend);
      }
      alert('Sorteio realizado e emails enviados com sucesso!');
    } catch (error) {
      alert('Erro ao enviar alguns emails. Por favor, tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const sendEmail = async (name, email, secretFriend) => {
    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name, secretFriend }),
      });

      if (!response.ok) {
        throw new Error(`Erro ao enviar email para ${name}`);
      }
    } catch (error) {
      console.error("Erro na requisição de envio de email:", error);
      throw error;
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && name && email) {
      addParticipant();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Amigo Secreto
          </h1>
          <p className="text-gray-600">
            Organize seu sorteio de forma fácil e divertida!
          </p>
        </div>

        {/* Formulário de Adição */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-blue-500 text-xl">👤</span>
            <h2 className="text-xl font-semibold text-gray-800">
              Adicionar Participante
            </h2>
          </div>

          <div className="space-y-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Nome do Participante"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyPress={handleKeyPress}
                className="text-black w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder:text-gray-400"
              />
            </div>

            <div className="relative">
              <input
                type="email"
                placeholder="Email do Participante"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyPress={handleKeyPress}
                className="text-black w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder:text-gray-400"
              />
            </div>

            <button
              onClick={addParticipant}
              disabled={!name || !email}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>👤</span>
              Adicionar Participante
            </button>
          </div>
        </div>

        {/* Lista de Participantes */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <span className="text-purple-500 text-xl">👥</span>
              <h2 className="text-xl font-semibold text-gray-800">
                Participantes ({participants.length})
              </h2>
            </div>
          </div>

          <div className="space-y-2 mb-6">
            {participants.length === 0 ? (
              <p className="text-center text-gray-500 py-4">
                Nenhum participante adicionado ainda
              </p>
            ) : (
              participants.map((p, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-medium">
                      {p.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-gray-700 font-medium">{p.name}</span>
                      <span className="text-gray-500 text-sm">{p.email}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => removeParticipant(index)}
                    className="text-gray-400 hover:text-red-500 transition-colors duration-200 p-2"
                  >
                    ❌
                  </button>
                </div>
              ))
            )}
          </div>

          <button
            onClick={generatePairs}
            disabled={participants.length < 2 || isLoading}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Sorteando...
              </>
            ) : (
              <>
                <span>🎁</span>
                Realizar Sorteio e Enviar Emails
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}