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
  const [error, setError] = useState('');
  const [retryQueue, setRetryQueue] = useState([]);

  // All existing functions remain exactly the same
  const addParticipant = () => {
    if (name && email) {
      setParticipants([...participants, { name, email }]);
      setName('');
      setEmail('');
      setError('');
    }
  };

  const retryFailedEmails = async () => {
    setIsLoading(true);
    setError('');

    for (const participant of retryQueue) {
      setCurrentSending(participant.name);
      try {
        await sendEmail(participant.name, participant.email, secretPairs[participant.name]);
        setEmailStatus(prev => ({
          ...prev,
          [participant.name]: 'success'
        }));
        setRetryQueue(prev => prev.filter(p => p.name !== participant.name));
      } catch (error) {
        setError(`Falha ao reenviar email para ${participant.name}. Por favor, tente novamente.`);
      }
    }

    setIsLoading(false);
    setCurrentSending('');
  };

  const generatePairs = async () => {
    if (isLoading) return;

    setIsLoading(true);
    setEmailStatus({});
    setError('');
    setRetryQueue([]);

    try {
      const shuffledParticipants = [...participants];
      let pairs = {};
      let isValid = false;

      while (!isValid) {
        isValid = true;
        for (let i = shuffledParticipants.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [shuffledParticipants[i], shuffledParticipants[j]] = [
            shuffledParticipants[j],
            shuffledParticipants[i],
          ];
        }

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
          setRetryQueue(prev => [...prev, participant]);
        }
      }

      if (retryQueue.length > 0) {
        setError(`Alguns emails falharam. Clique em "Tentar Novamente" para reenviar.`);
      }
    } catch (error) {
      setError('Erro ao realizar o sorteio. Por favor, tente novamente.');
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

    return response.json();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-green-50 py-12 px-4">
      <div className="max-w-md mx-auto space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-red-600 to-green-600 bg-clip-text text-transparent">
            🎄 Amigo Secreto 🎁
          </h1>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4 rounded-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-lg p-6 border border-red-100">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <span className="mr-2">🎅</span>
            Adicionar Participante
          </h2>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Nome"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-800"
              disabled={isLoading}
            />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-800"
              disabled={isLoading}
            />
            <button
              onClick={addParticipant}
              disabled={isLoading || !name || !email}
              className="w-full py-2 bg-gradient-to-r from-red-500 to-green-500 hover:from-red-600 hover:to-green-600 text-white rounded-lg transition-all duration-200 shadow-md disabled:opacity-50"
            >
              Adicionar
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-green-100">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <span className="mr-2">🎄</span>
            Participantes ({participants.length})
          </h2>
          {participants.length > 0 ? (
            <ul className="divide-y divide-gray-100">
              {participants.map((p, index) => (
                <li key={index} className="py-3 text-gray-700 flex items-center space-x-3">
                  <span className="w-8 h-8 flex items-center justify-center bg-red-100 text-red-600 rounded-full text-sm font-medium">
                    {p.name.charAt(0)}
                  </span>
                  <span className="flex-1">{p.name}</span>
                  {emailStatus[p.name] && (
                    <span
                      className={`text-sm ${emailStatus[p.name] === 'success'
                        ? 'text-green-500'
                        : 'text-red-500'
                        }`}
                    >
                      {emailStatus[p.name] === 'success' ? '✓ Enviado' : '× Erro'}
                    </span>
                  )}
                  {currentSending === p.name && (
                    <div className="flex items-center text-sm text-red-500">
                      <svg className="animate-spin h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Enviando...
                    </div>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-center text-gray-500 py-4">
              Nenhum participante adicionado
            </p>
          )}

          <div className="mt-4 space-y-2">
            <button
              onClick={generatePairs}
              disabled={participants.length < 3 || isLoading}
              className="w-full py-2 bg-gradient-to-r from-red-500 to-green-500 hover:from-red-600 hover:to-green-600 text-white rounded-lg transition-all duration-200 shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading && (
                <svg className="animate-spin h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              {isLoading
                ? "Enviando emails..."
                : participants.length < 3
                  ? "Mínimo de 3 participantes"
                  : "🎁 Sortear e Enviar Emails"}
            </button>

            {retryQueue.length > 0 && (
              <button
                onClick={retryFailedEmails}
                disabled={isLoading}
                className="w-full py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition-all duration-200 shadow-md disabled:opacity-50 flex items-center justify-center"
              >
                {isLoading && (
                  <svg className="animate-spin h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
                Tentar Novamente ({retryQueue.length})
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}