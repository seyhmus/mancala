import "./globals.css";
import { Container, Theme } from "@radix-ui/themes";
import "@radix-ui/themes/styles.css";
import NavBar from "@/components/NavBar";
import { MessagingProvider } from "@/context/MessageContext";

export const metadata = {
  title: "Mancala",
  description: "Kalah version of the game with Real-Time Multiplayer Chat",
  keywords:
    "mancala, kalah, board game, multiplayer game, websockets, pusher, firebase, webrtc, p2p, peer, chat",
  openGraph: {
    title: "Mancala",
    description: "Kalah version of the game with Real-Time Multiplayer Chat",
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inspiration&family=Jolly+Lodger&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <Theme
          accentColor="amber"
          grayColor="sand"
          radius="medium"
          scaling="95%"
          appearance="dark"
        >
          <Container>
            <MessagingProvider>
              <header>
                <NavBar />
              </header>

              <main>{children}</main>
            </MessagingProvider>

            <footer></footer>
          </Container>
        </Theme>
      </body>
    </html>
  );
}
