import "./globals.css";

export const metadata = {
  title: "Letrando",
  description: "Plataforma web gamificada de ortografia para escolas",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body className="bg-letra-bg font-body text-letra-ink antialiased">
        {children}
      </body>
    </html>
  );
}
