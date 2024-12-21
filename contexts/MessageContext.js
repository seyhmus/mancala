"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";
import { useRouter } from "next/navigation";

import { auth } from "@/lib/firebase";
import { getPusherClient, disconnectPusher } from "@/lib/pusher";
import GameRequests from "@/components/GameRequests";

const MessagingContext = createContext();

export const MessagingProvider = ({ children }) => {
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [tokenExpiration, setTokenExpiration] = useState(null);

  const [users, setUsers] = useState({});

  const [gameRequests, setGameRequests] = useState([]);

  // Firebase Auth Token Id Management ///////////////////////////////////////

  const parseToken = useCallback((token) => {
    if (!token) return;

    try {
      const [, payloadBase64] = token.split(".");
      const payload = JSON.parse(atob(payloadBase64));
      return payload.exp * 1000;
    } catch (error) {
      console.error("Error decoding token:", error);
    }
  }, []);

  const isTokenExpired = useCallback(
    (bufferMinutes = 5) => {
      if (!tokenExpiration) return true;

      const currentTime = Date.now();
      const bufferTime = bufferMinutes * 60 * 1000;

      return tokenExpiration - currentTime <= bufferTime;
    },
    [tokenExpiration]
  );

  const updateToken = useCallback(
    (newToken) => {
      setToken(newToken);
      setTokenExpiration(parseToken(newToken));
    },
    [parseToken]
  );

  const getToken = useCallback(
    async (forceRefresh = false) => {
      if (!auth.currentUser) return null;

      try {
        if (forceRefresh || isTokenExpired()) {
          const newToken = await auth.currentUser.getIdToken(true);
          updateToken(newToken);
          return newToken;
        }
        return token;
      } catch (error) {
        console.error("Error getting token:", error);
        return null;
      }
    },
    [isTokenExpired, token, updateToken]
  );

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setUser(user);

        const initialToken = await getToken(false);
        updateToken(initialToken);
      } else {
        console.warn("No user in auth state change event");
        setUser(null);
        updateToken(null);
      }
    });

    return () => {
      console.log("Cleaning up auth listener");
      unsubscribe();
      setUser(null);
      updateToken(null);
    };
  }, []);

  useEffect(() => {
    if (token && tokenExpiration) {
      const remainingTime = tokenExpiration - Date.now();
      console.debug(
        `Token will expire in ${Math.floor(remainingTime / 1000)} seconds`
      );
    }
  }, [token, tokenExpiration]);

  useEffect(() => {
    console.log("users", users);
  }, [users]);

  // For some reason the recommended observer did not work, hence we implemented the above hack
  // useEffect(() => {
  //   const unsubscribe = auth.onIdTokenChanged((user) => {
  //     if (user) {
  //       user
  //         .getIdToken()
  //         .then((token) => {
  //           setToken(token);
  //         })
  //         .catch((error) => {
  //           console.error("Error getting token:", error);
  //         });
  //     } else {
  //       console.warn("No user in token change event");
  //       setToken(null);
  //     }
  //   });

  //   return () => {
  //     console.log("Cleaning up token listener");
  //     unsubscribe();
  //     setToken(null);
  //   };
  // }, []);

  // Pusher Client Setup and Presence/Private Channels Subscription
  useEffect(() => {
    if (!user) return;

    const params = {
      userId: user.uid,
    };

    const client = getPusherClient(params, user.accessToken);
    // setSocketId(client.connection.socket_id);

    if (client) {
      const channel = client.subscribe("presence-lobby");

      channel.bind("pusher:subscription_succeeded", (members) => {
        setUsers(members.members);
      });

      channel.bind("pusher:member_added", (member) => {
        // setUsers(channel.members.members);
      });

      channel.bind("pusher:member_removed", (member) => {
        console.log("member_removed", member);
        // setUsers(channel.members.members);
      });

      // My private channel
      const privateChannel = client.subscribe(`private-user-${user.uid}`);

      privateChannel.bind("game-request", (data) => {
        setGameRequests((prev) => [...prev, data]);

        // Auto-remove after 30 seconds
        setTimeout(() => {
          setGameRequests((prev) =>
            prev.filter((req) => req.timestamp !== data.timestamp)
          );
        }, 30000);
      });

      // Listen for game accepted
      privateChannel.bind("game-accepted", (data) => {
        localStorage.setItem(`${data.gameId}:id`, 1);
        router.push(`/lobby/${data.gameId}`);
      });

      return () => {
        channel.unbind_all();
        privateChannel.unbind_all();
        client.unsubscribe("presence-lobby");
        client.unsubscribe(`private-user-${user.uid}`);
        disconnectPusher();
      };
    }
  }, [user]);

  return (
    <MessagingContext.Provider
      value={{
        user,
        userId: user?.uid,
        getToken,
        users,
        setUsers,
        gameRequests,
        setGameRequests,
      }}
    >
      <GameRequests />
      {children}
    </MessagingContext.Provider>
  );
};

export default function useMessagingContext() {
  return useContext(MessagingContext);
}
