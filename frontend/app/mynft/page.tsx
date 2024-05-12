"use client";
import { ethers } from "ethers";
import { useContext, useEffect, useRef, useState } from "react";
import artifact from "../../abi/MyERC721.sol/MyERC721.json";
import { Web3SignerContext } from "@/context/web3.context";
import {
  Alert,
  Avatar,
  Button,
  Card,
  Container,
  Group,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { IconCubePlus } from "@tabler/icons-react";

const contractAddress = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";

export default function MyNFT() {
  const { signer } = useContext(Web3SignerContext);

  const [myNFTContract, setMyERC721Contract] = useState<ethers.Contract | null>(
    null
  );

  useEffect(() => {
    const contract = new ethers.Contract(contractAddress, artifact.abi, signer);
    setMyERC721Contract(contract);

    const fillAddress = async () => {
      if (ref.current) {
        const myAddress = await signer?.getAddress();
        if (myAddress) {
          ref.current.value = myAddress!;
        }
      }
    };
    fillAddress();
  }, [signer]);

  const ref = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const handleButtonClick = async () => {
    setLoading(true);
    try {
      const account = ref.current!.value;
      await myNFTContract?.safeMint(account, "https://example.com/nft.json");
      setShowAlert(true);
      setAlertMessage(
        `NFT minted and sent to the wallet ${
          account?.slice(0, 6) + "..." + account?.slice(-2)
        }. Enjoy your NFT!`
      );
    } finally {
      setLoading(false);
    }
  };

  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  return (
    <div>
      <Title order={1} style={{ paddingBottom: 12 }}>
        My NFT Management
      </Title>
      {showAlert ? (
        <Container py={8}>
          <Alert
            variant="light"
            color="teal"
            title="NFT Minted Successfully!"
            withCloseButton
            onClose={() => setShowAlert(false)}
            icon={<IconCubePlus />}
          >
            {alertMessage}
          </Alert>
        </Container>
      ) : null}
      <SimpleGrid cols={{ base: 1, sm: 3, lg: 5 }}>
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Card.Section>
            <Container py={12}>
              <Group justify="center">
                <Avatar color="blue" radius="xl">
                  <IconCubePlus size="1.5rem" />
                </Avatar>
              </Group>
            </Container>
          </Card.Section>
          <Stack>
            <TextInput
              ref={ref}
              label="Wallet address"
              placeholder="0x0000..."
            />
            <Button loading={loading} onClick={handleButtonClick}>
              Mint NFT
            </Button>
          </Stack>
        </Card>
      </SimpleGrid>
    </div>
  );
}
