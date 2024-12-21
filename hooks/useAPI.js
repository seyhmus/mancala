"use client";

import { nanoid } from "nanoid";

import useMessagingContext from "@/context/MessageContext";

const useAPI = () => {
  const { userId, userAlias, getToken } = useMessagingContext();

  const createHeaders = async (forceRefresh = false) => {
    const token = await getToken(forceRefresh);
    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  };

  const handleResponse = async (response) => {
    if (!response.ok) {
      switch (response.status) {
        case 401:
          // Token might be expired, try once with a forced refresh
          return null; // Return null to trigger retry with fresh token
        case 403:
          throw new Error("Forbidden - You don't have permission");
        case 404:
          throw new Error("Resource not found");
        case 429:
          throw new Error("Too many requests");
        default:
          throw new Error(`HTTP error! status: ${response.status}`);
      }
    }
    return await response.json();
  };

  const fetchWithRetry = async (url, options, retryWithFreshToken = true) => {
    try {
      const response = await fetch(url, options);
      const result = await handleResponse(response);

      // If null is returned and retry is allowed, try once with fresh token
      if (result === null && retryWithFreshToken) {
        const newHeaders = await createHeaders(true); // Force token refresh
        const newOptions = {
          ...options,
          headers: { ...options.headers, ...newHeaders },
        };
        const retryResponse = await fetch(url, newOptions);
        return await handleResponse(retryResponse);
      }

      return result;
    } catch (error) {
      console.error("Fetch error:", error);
      throw error;
    }
  };

  const fetchAPI = async (method, url, data = null, options = {}) => {
    const headers = await createHeaders();

    const defaultOptions = {
      method,
      headers,
      ...options,
    };

    // Add body for methods that support it
    if (data && ["POST", "PUT", "PATCH"].includes(method.toUpperCase())) {
      if (data instanceof FormData) {
        // Remove Content-Type header for FormData to let browser set it with boundary
        delete defaultOptions.headers["Content-Type"];
        defaultOptions.body = data;
      } else if (typeof data === "object") {
        defaultOptions.body = JSON.stringify(data);
      } else {
        defaultOptions.body = data;
      }
    }

    return fetchWithRetry(url, defaultOptions);
  };

  // API methods
  const post = async (url, data = {}, options = {}) => {
    return fetchAPI("POST", url, data, options);
  };

  const postEvent = async (event) => {
    try {
      const result = await post("/api/pusher/event", event);
      return result;
    } catch (error) {
      console.error("Error posting event:", error);
      throw error;
    }
  };

  // private communication: push signal
  const postSignal = async (message) => {
    message.method = "pusher";
    message.eventType = "signal";
    try {
      await postEvent(message);
    } catch (error) {
      console.error("Error sending signal:", error);
    }
  };

  // push game request through global channel
  const postGameRequest = async (to) => {
    try {
      await postEvent({
        senderId: userId,
        receiverId: to,
        eventType: "game-request",
      });
    } catch (error) {
      console.error("Error sending game request:", error);
    }
  };

  const postGameAccept = async (gameId, gameRequester) => {
    await postEvent({
      senderId: userId,
      receiverId: gameRequester,
      gameId,
      eventType: "game-accepted",
    });
  };

  // push move through private channel specific to gameid
  const postMove = async (gameId, gameState) => {
    try {
      await postEvent({
        senderId: userId,
        gameId,
        gameState,
        eventType: "game-move",
      });
    } catch (error) {
      console.error("Error posting move:", error);
    }
  };

  return {
    postGameRequest,
    postGameAccept,
    postMove,
    // convenience http methods - not used in this project:
    get: (url, options) => fetchAPI("GET", url, null, options),
    post,
    put: (url, data, options) => fetchAPI("PUT", url, data, options),
    delete: (url, options) => fetchAPI("DELETE", url, null, options),
    patch: (url, data, options) => fetchAPI("PATCH", url, data, options),
  };
};

export default useAPI;
