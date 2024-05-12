"use client";
import { Signer } from "ethers";
import React, { Dispatch, createContext, useState } from "react";

export const Web3SignerContext = createContext<{
  signer: Signer | null;
  setSigner: Dispatch<Signer>;
}>({
  signer: null,
  setSigner: () => {},
});

export const Web3SignerContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [signer, setSigner] = useState<Signer | null>(null);
  return (
    <Web3SignerContext.Provider value={{ signer, setSigner }}>
      {children}
    </Web3SignerContext.Provider>
  );
};
