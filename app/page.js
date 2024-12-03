'use client';

import { useState } from 'react';

export default function Home() {
  const [participants, setParticipants] = useState([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [secretPairs, setSecretPairs] = useState({});

  const addParticipant = () => {
    if (name && email) {
      setParticipants([...participants, { name, email }]);
      setName('');
      setEmail('');
    }
  };

  const generatePairs = async () => {
    // Embaralha os participantes
    const shuffledParticipants = [...participants];
    for (let i = shuffledParticipants.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledParticipants[i], shuffledParticipants[j]] = [shuffledParticipants[j], shuffledParticipants[i]]; // Troca os elementos
    }

    const pairs = {};
    let isValid = false;

    // Tenta encontrar um sorteio válido, onde ninguém sorteie a si mesmo
    while (!isValid) {
      isValid = true;
      for (let i = 0; i < participants.length; i++) {
        const participant = participants[i];
        const secretIndex = (i + 1) % participants.length; // Garantir que ninguém tire a si mesmo
        if (shuffledParticipants[secretIndex].name === participant.name) {
          isValid = false; // Se alguém tirar a si mesmo, tenta novamente
          break;
        }
        pairs[participant.name] = shuffledParticipants[secretIndex].name;
      }
    }

    setSecretPairs(pairs);

    // Enviar email para todos os participantes após o sorteio
    for (const participant of participants) {
      const secretFriend = pairs[participant.name];
      await sendEmail(participant.name, participant.email, secretFriend);
    }
  };

  const sendEmail = async (name, email, secretFriend) => {
    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          name,
          secretFriend,
        }),
      });

      if (response.ok) {
        console.log(`Email enviado para ${name}`);
      } else {
        console.error(`Erro ao enviar email para ${name}`);
      }
    } catch (error) {
      console.error("Erro na requisição de envio de email:", error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 py-10 px-4">
      <h1 className="text-4xl font-bold text-gray-800 mb-8">Amigo Secreto</h1>

      <div className="bg-white rounded-lg shadow-md p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Adicionar Participantes</h2>
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Nome"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="text-black w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="text-black w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={addParticipant}
            className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition"
          >
            Adicionar
          </button>
        </div>
      </div>

      <div className="mt-8 bg-white rounded-lg shadow-md p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Participantes</h2>
        <ul className="space-y-2">
          {participants.map((p, index) => (
            <li key={index} className="text-gray-800">
              {p.name}
            </li>
          ))}
        </ul>
        <button
          onClick={generatePairs}
          className="w-full bg-green-500 text-white py-2 mt-4 rounded-lg hover:bg-green-600 transition"
        >
          Sortear e Enviar Emails
        </button>
      </div>
    </div>
  );
}
