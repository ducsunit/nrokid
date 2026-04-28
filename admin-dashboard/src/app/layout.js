export const metadata = {
  title: 'NRO Kid | Admin Dashboard',
  description: 'Server management dashboard for NRO Kid',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
