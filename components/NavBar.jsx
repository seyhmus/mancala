"use client";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { TabNav, Box } from "@radix-ui/themes";

import { getAuth, signInAnonymously } from "firebase/auth";
import useMessagingContext from "@/context/MessageContext";
import { useEffect } from "react";

const NavBar = () => {
  const pathname = usePathname();
  const isActive = (path) => pathname === path;

  const { user } = useMessagingContext();

  useEffect(() => {
    if (!user) {
      signInAnonymously(getAuth());
    }
  }, [user]);

  return (
    <nav className="p-2">
      <TabNav.Root>
        <TabNav.Link href="/">
          <span style={{ fontFamily: "Inspiration", fontSize: "2rem" }}>
            Mancala
          </span>
        </TabNav.Link>
        <Box flexGrow={"1"} />
        {user && (
          <TabNav.Link href="/lobby" active={isActive("/lobby")}>
            Lobby
          </TabNav.Link>
        )}
      </TabNav.Root>
    </nav>
  );
};

export default NavBar;
