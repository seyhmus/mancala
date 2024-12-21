"use client";

import InProgressDialog from "@/components/InProgress";
import useMessagingContext from "@/context/MessageContext";
import useAPI from "@/hooks/useAPI";
import {
  Flex,
  Button,
  ScrollArea,
  Strong,
  Card,
  Separator,
  Tooltip,
} from "@radix-ui/themes";

export default function Lobby() {
  const { userId, users } = useMessagingContext();

  const { postGameRequest } = useAPI();

  if (!userId) return <InProgressDialog notification="Initializing..." />;

  return (
    <Flex direction="column" align="center">
      <Flex
        direction="column"
        align="center"
        height="calc(100vh - 128px)"
        p={"2"}
      >
        <h2>Players</h2>
        <Separator size={"3"} mb={"3"} />
        <ScrollArea>
          <Flex direction={"column"} gap={"2"}>
            {Object.values(users)
              .filter((user) => user.id !== userId)
              .map((user) => (
                <Button
                  key={user.id}
                  variant="solid"
                  onClick={() => postGameRequest(user.id)}
                >
                  {user.id}
                </Button>
              ))}
          </Flex>
        </ScrollArea>
      </Flex>
      <Separator size={"4"} mb={"3"} />
      <Tooltip content="Your ID">
        <Card>
          <Strong>{userId}</Strong>
        </Card>
      </Tooltip>
    </Flex>
  );
}
