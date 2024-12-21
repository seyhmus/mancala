import { useRouter } from "next/navigation";
import useMessagingContext from "@/context/MessageContext";
import useAPI from "@/hooks/useAPI";

export default function GameRequests({}) {
  const router = useRouter();
  const { postGameAccept } = useAPI();

  const { gameRequests, setGameRequests } = useMessagingContext();

  const handleAcceptGame = async (request) => {
    try {
      const gameId = request.senderId + "-" + request.receiverId;
      localStorage.setItem(`${gameId}:id`, 0); // receiving player has the first move

      await postGameAccept(gameId, request.senderId);

      // Remove this request
      setGameRequests((prev) =>
        prev.filter((req) => req.timestamp !== request.timestamp)
      );

      // Navigate to the game page
      router.push(`/lobby/${gameId}`);
    } catch (error) {
      console.error("Error accepting game:", error);
    }
  };

  if (gameRequests.length === 0) {
    return <></>;
  }

  return (
    <div className="fixed top-24 right-4 z-50">
      {gameRequests.map((request, index) => (
        <div
          key={index}
          className="bg-white text-black p-4 rounded-lg shadow-lg mb-2 animate-bounce"
        >
          <p className="font-bold">Game Request {request.senderId}</p>
          <div className="flex gap-2 mt-2">
            <button
              className="bg-green-500 text-white px-4 py-2 rounded"
              onClick={() => handleAcceptGame(request)}
            >
              Accept
            </button>
            <button
              className="bg-red-500 text-white px-4 py-2 rounded"
              onClick={() => {
                // Remove this request
                setGameRequests((prev) => prev.filter((_, i) => i !== index));
              }}
            >
              Decline
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
