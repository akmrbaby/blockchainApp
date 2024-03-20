"use client";
import { ethers } from "ethers";
import { useEffect, useState } from "react";
import artifacts from "../abi/MyToken.sol/MyToken.json";

const contractAddress = "0x5fbdb2315678afecb367f032d93f642f64180aa3";

export default function Home() {
  const [windowEthereum, setWindowEthereum] = useState();
  const [inputValue, setInputValue] = useState("");

  useEffect(() => {
    const { ethereum } = window as any;
    setWindowEthereum(ethereum);
  }, []);

  const handleButtonClick = async () => {
    if (windowEthereum) {
      const provider = new ethers.BrowserProvider(windowEthereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        contractAddress,
        artifacts.abi,
        provider
      );
      const walletAddress = await signer.getAddress();
      const balance = await contract.balanceOf(walletAddress);
      setInputValue(balance.toString());
    }
  };

  return (
    <div>
      <h1>Blockchain sample app</h1>
      <button onClick={handleButtonClick}>Tokens owned</button>
      <input type="text" value={inputValue} readOnly />
    </div>
  );
}
