import sendgrid from '@sendgrid/mail';

// Configure a API Key do SendGrid a partir da variável de ambiente
sendgrid.setApiKey(process.env.SENDGRID_API_KEY);

export async function POST(req) {
    try {
        // Extrai os dados do corpo da requisição
        const { email, name, secretFriend } = await req.json();

        // Envia o email usando o SendGrid
        await sendgrid.send({
            to: email,
            from: process.env.SENDGRID_EMAIL, // Usando o e-mail da variável de ambiente
            subject: 'Seu amigo secreto chegou! 🎁',
            html: `
              <!DOCTYPE html>
              <html>
              <head>
                <style>
                  body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
                  .container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 10px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); overflow: hidden; }
                  .header { background-color: #4caf50; color: #ffffff; text-align: center; padding: 20px; }
                  .header h1 { margin: 0; font-size: 24px; }
                  .content { padding: 20px; color: #333333; line-height: 1.6; }
                  .content p { margin: 0 0 10px; }
                  .highlight { font-size: 18px; font-weight: bold; color: #4caf50; }
                  .footer { text-align: center; background-color: #f4f4f4; padding: 15px; color: #888888; font-size: 14px; }
                  .footer a { color: #4caf50; text-decoration: none; }
                </style>
              </head>
              <body>
                <div class="container">
                  <div class="header">
                    <h1>Amigo Secreto 🎁</h1>
                  </div>
                  <div class="content">
                    <p>Olá <strong>${name}</strong>,</p>
                    <p>Chegou a hora de descobrir quem é o seu amigo secreto! 🥳</p>
                    <p>O seu amigo secreto é:</p>
                    <p class="highlight">${secretFriend}</p>
                    <p>Não conte para ninguém, hein? 😄</p>
                    <p>Que vocês tenham um momento especial e cheio de diversão!</p>
                  </div>
                  <div class="footer">
                    <p>🎄 Boas festas e um ótimo amigo secreto! 🎄</p>
                    <p><a href="#">Saiba mais sobre Amigo Secreto</a></p>
                  </div>
                </div>
              </body>
              </html>
            `,
        });

        // Responde com sucesso
        return new Response(JSON.stringify({ message: 'Email enviado com sucesso!' }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        // Log detalhado do erro
        console.error('Erro ao enviar email:', error.response?.body || error);

        // Retorna erro
        return new Response(JSON.stringify({ error: 'Erro ao enviar o email' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
