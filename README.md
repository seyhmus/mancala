![mancala](https://github.com/user-attachments/assets/3b541e42-4655-4330-a61d-331749647f42)

## About the game

This is the modern Kalah version of the Mancala series of games. The game provides a board and a number of stones. The board has 6 small pits, called houses, on each side; and a big pit, called store, at each end. The object of the game is to capture more stones than one's opponent.

1. At the beginning of the game, four stones are placed in each house.
2. Each player controls the six houses and the stones on their side of the board. The player's score is the number of stones in the store to their right.
3. Players take turns sowing their stones. On a turn, the player removes all stones from one of the houses under their control. Moving counter-clockwise, the player drops one seed in each house in turn, including the player's own store but not their opponent's.
4. If the last sown seed lands in an empty house owned by the player, and the opposite house contains stones, both the last seed and the opposite stones are captured and placed in the player's store.
5. If the last sown seed lands in the player's store, the player gets an additional move. There is no limit on the number of moves a player can make in their turn.
6. When one player no longer has any stones in any of their houses, the game ends. The other player moves all remaining stones to their store, and the player with the most stones in their store wins.

It is possible for the game to end in a draw.

# Tech Stack

The application is built using Next.js and incorporates various technologies to provide a seamless gaming experience. It includes both single-player mode with AI opponent and multiplayer mode for playing against other users.

## Repository Structure

```
.
├── app/
│   ├── api/
│   │   ├── pusher/
│   ├── lobby/
├── components/
├── contexts/
├── hooks/
├── lib/
└── __tests__/
```

### Key Files:

- `app/page.js`: Main entry point for the application
- `components/MangalaGame.jsx`: Core game logic implementation
- `components/MultiPlayerGame.jsx`: MangalaGame adjusted for multi player interaction
- `components/MakeMove.js`: Game move logic
- `contexts/MessageContext.js`: Messaging context provider
- `hooks/useAPI.js`: API methods for triggering pusher events
- `app/api/pusher/auth/route.js`: pusher client channel subscription authorization api route
- `app/api/pusher/event/route.js`: pusher event triggering api route

### Important Integration Points:

#### Firebase: authentication

- `lib/firebase`: client authentication
- `lib/firebaseAdmin`: service account for token verification in the server

The app does not require login, or more pricesely it anonymously logs in the user.

#### Pusher: real time communication

- `lib/pusher`: client subscription to pusher channels
- `lib/pusherServer`: service account for client authorization in the server

## Usage Instructions

### Installation

Prerequisites:

- Node.js (v14 or later)
- npm (v6 or later)

Steps:

1. Clone the repository
2. Run `npm install` to install dependencies
3. Set up environment variables (see Configuration section)
4. Run `npm run dev` to start the development server

### Configuration

Create a `.env.local` file in the root directory with the following variables:

```
# Firebase Client
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key

# Firebase Service Account
FIREBASE_PROJECT_ID=
FIREBASE_PRIVATE_KEY_ID=
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n ... \n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk- ... @ ... .iam.gserviceaccount.com

# Pusher
NEXT_PUBLIC_PUSHER_APP_KEY=your_pusher_app_key
PUSHER_APP_ID=your_pusher_app_id
PUSHER_SECRET=your_pusher_secret

```

#### Playing Against AI

1. Navigate to the game page
2. Enable AI using the toggle switch
3. Make your moves by clicking on the pits

#### Playing Multiplayer

1. Navigate to the lobby
2. Send a game request to another online user
3. Once accepted, you'll be redirected to the game room
4. Play the game by taking turns making moves

### Testing

Run the test suite using:

```
npm run test
```

This will execute the unit tests for the game logic.

### Troubleshooting

#### Issue: Unable to connect to Pusher

- Ensure your Pusher credentials are correct in the `.env.local` file
- Check if your firewall is blocking WebSocket connections

#### Debugging

To enable verbose logging:

1. Open the browser console
2. Set `localStorage.debug = '*'` to enable all debug logs
3. Refresh the page

Log files are located in the browser's console and network tab.

## Data Flow

The application uses a combination of server-side and client-side data flow to manage game state and real-time communication.

1. User actions (e.g., making a move) trigger client-side state updates
2. Updated state is sent to the server via Pusher
3. Server validates and broadcasts the state to other connected clients
4. Clients receive the updated state and re-render the game board

```
[Client] -> User Action
    |
    v
[Client] -> Update Local State
    |
    v
[Client] -> Send Update to Server (Pusher)
    |
    v
[Server] -> Validate Update
    |
    v
[Server] -> Broadcast to Other Client
    |
    v
[Clients] -> Receive Update
    |
    v
[Clients] -> Update Local State and Re-render
```
