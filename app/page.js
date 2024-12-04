'use client';

import { useState } from 'react';

export default function Home() {
  const [participants, setParticipants] = useState([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [secretPairs, setSecretPairs] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [currentSending, setCurrentSending] = useState('');
  const [emailStatus, setEmailStatus] = useState({});

  const addParticipant = () => {
    if (name && email) {
      setParticipants([...participants, { name, email }]);
      setName('');
      setEmail('');
    }
  };

  const generatePairs = async () => {
    setIsLoading(true);
    setEmailStatus({});

    try {
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

      // Envia emails sequencialmente
      for (const participant of participants) {
        const secretFriend = pairs[participant.name];
        setCurrentSending(participant.name);

        try {
          await sendEmail(participant.name, participant.email, secretFriend);
          setEmailStatus(prev => ({
            ...prev,
            [participant.name]: 'success'
          }));
        } catch (error) {
          setEmailStatus(prev => ({
            ...prev,
            [participant.name]: 'error'
          }));
        }
      }
    } catch (error) {
      console.error("Erro no sorteio:", error);
    } finally {
      setIsLoading(false);
      setCurrentSending('');
    }
  };

  const sendEmail = async (name, email, secretFriend) => {
    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        name,
        secretFriend,
      }),
    });

    if (!response.ok) {
      throw new Error(`Erro ao enviar email para ${name}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-12 px-4">
      <div className="max-w-md mx-auto space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Amigo Secreto
          </h1>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Adicionar Participante
          </h2>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Nome"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-800"
            />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-800"
            />
            <button
              onClick={addParticipant}
              disabled={isLoading}
              className="w-full py-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-lg transition-all duration-200 shadow-md disabled:opacity-50"
            >
              Adicionar
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Participantes ({participants.length})
          </h2>
          {participants.length > 0 ? (
            <ul className="divide-y divide-gray-100">
              {participants.map((p, index) => (
                <li key={index} className="py-3 text-gray-700 flex items-center space-x-3">
                  <span className="w-8 h-8 flex items-center justify-center bg-purple-100 text-purple-600 rounded-full text-sm font-medium">
                    {p.name.charAt(0)}
                  </span>
                  <span className="flex-1">{p.name}</span>
                  {emailStatus[p.name] && (
                    <span className={`text-sm ${emailStatus[p.name] === 'success' ? 'text-green-500' : 'text-red-500'}`}>
                      {emailStatus[p.name] === 'success' ? '✓ Enviado' : '× Erro'}
                    </span>
                  )}
                  {currentSending === p.name && (
                    <span className="text-sm text-blue-500">Enviando...</span>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-center text-gray-500 py-4">
              Nenhum participante adicionado
            </p>
          )}
          <button
            onClick={generatePairs}
            disabled={participants.length < 3 || isLoading}
            className="w-full mt-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-lg transition-all duration-200 shadow-md disabled:opacity-50 disabled:cursor-not-allowed relative"
          >
            {isLoading ? (
              <span>Enviando emails...</span>
            ) : participants.length < 3 ? (
              "Mínimo de 3 participantes"
            ) : (
              "Sortear e Enviar Emails"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}