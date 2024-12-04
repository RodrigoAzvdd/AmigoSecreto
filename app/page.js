'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-12 px-4">
      <div className="max-w-md mx-auto space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Amigo Secreto
          </h1>
        </div>

        <Card className="shadow-lg border-0">
          <CardHeader>
            <CardTitle className="text-xl text-gray-800">
              Adicionar Participante
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              type="text"
              placeholder="Nome"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="border-gray-200 focus:ring-2 focus:ring-purple-500"
            />
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border-gray-200 focus:ring-2 focus:ring-purple-500"
            />
            <Button
              onClick={addParticipant}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-md"
            >
              Adicionar
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-0">
          <CardHeader>
            <CardTitle className="text-xl text-gray-800">
              Participantes ({participants.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {participants.length > 0 ? (
              <ul className="divide-y divide-gray-100">
                {participants.map((p, index) => (
                  <li key={index} className="py-3 text-gray-700 flex items-center space-x-2">
                    <span className="w-8 h-8 flex items-center justify-center bg-purple-100 text-purple-600 rounded-full text-sm font-medium">
                      {p.name.charAt(0)}
                    </span>
                    <span className="flex-1">{p.name}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-center text-gray-500 py-4">
                Nenhum participante adicionado
              </p>
            )}
            <Button
              onClick={generatePairs}
              disabled={participants.length < 3}
              className="w-full mt-4 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {participants.length < 3
                ? "Mínimo de 3 participantes"
                : "Sortear e Enviar Emails"
              }
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}