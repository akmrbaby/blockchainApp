"use client";
import { ethers } from "ethers";
import { Web3SignerContext } from "@/context/web3.context";
import {
  MyGovernor,
  MyERC20,
  MyGovernor__factory,
  MyERC20__factory,
} from "@/types";
import {
  Alert,
  Avatar,
  Badge,
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
import React, { useContext, useEffect, useState } from "react";
import { IconPlus, IconRefresh } from "@tabler/icons-react";

const governorContractAddress = "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9";
const erc20ContractAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";

enum ProposalStatus {
  Pending = 0,
  Active,
  Canceled,
  Defeated,
  Succeeded,
  Queued,
  Expired,
  Executed,
  Unknown,
}

type Proposal = {
  topic: string;
  status: number;
  proposalId: string;
  description: string;
  targets: string[];
  values: bigint[];
  calldatas: string[];
};

const getStatusString = (status: number) => ProposalStatus[status] || "Unknown";

export default function MyGovernorPage() {
  const { signer } = useContext(Web3SignerContext);

  const [myGovernorContract, setMyGovernorContract] =
    useState<MyGovernor | null>(null);
  const [myERC20Contract, setMyERC20Contract] = useState<MyERC20 | null>(null);
  const [isDelegated, setIsDelegated] = useState(false);

  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const [myProposals, setMyProposals] = useState<Proposal[]>([]);
  const [proposalTopic, setProposalTopic] = useState("");

  useEffect(() => {
    if (signer) {
      const governorContract = MyGovernor__factory.connect(
        governorContractAddress,
        signer
      );
      setMyGovernorContract(governorContract);

      const erc20Contract = MyERC20__factory.connect(
        erc20ContractAddress,
        signer
      );
      setMyERC20Contract(erc20Contract);
    }
  }, [signer]);

  useEffect(() => {
    const checkDelegation = async () => {
      if (myERC20Contract && signer) {
        const delegateAddress = await myERC20Contract.delegates(
          await signer.getAddress()
        );
        setIsDelegated(delegateAddress === (await signer.getAddress()));
      }
    };
    checkDelegation();
  }, [myERC20Contract, signer]);

  const handleDelegate = async () => {
    if (myERC20Contract && signer) {
      await myERC20Contract.delegate(await signer.getAddress());
      setIsDelegated(true);
    }
  };

  const createProposal = async () => {
    setLoading(true);

    try {
      const myERC20Interface = MyERC20__factory.createInterface();
      const calldata = myERC20Interface.encodeFunctionData("mint", [
        "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        BigInt("1000000"),
      ]);
      const target = erc20ContractAddress;
      const value = BigInt("0");

      if (myGovernorContract) {
        const tx = await myGovernorContract.propose(
          [target],
          [value],
          [calldata],
          proposalTopic
        );

        if (tx) {
          const receipt = await tx.wait();
          if (receipt && receipt.logs && receipt.logs.length > 0) {
            const log: any = receipt.logs.find(
              (log: any) => log.fragment.name === "ProposalCreated"
            );
            console.log(log);
            const { proposalId } = log.args;
            console.log("ProposalId:", proposalId);

            if (proposalId) {
              setMyProposals((prevProposals) => [
                ...prevProposals,
                {
                  topic: proposalTopic,
                  status: ProposalStatus.Pending,
                  proposalId: proposalId,
                  description: proposalTopic,
                  targets: [target],
                  values: [value],
                  calldatas: [calldata],
                },
              ]);
              setShowAlert(true);
              setAlertMessage("Proposal Created Successfully!");
            }
          }
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Title order={1} style={{ paddingBottom: 12 }}>
        My Governor Management
      </Title>
      {!isDelegated && <Button onClick={handleDelegate}>Delegate</Button>}
      {showAlert && (
        <Container py={8}>
          <Alert
            variant="light"
            color="teal"
            title="Proposal Created Successfully!"
            withCloseButton
            onClose={() => setShowAlert(false)}
            icon={<IconPlus />}
          >
            {alertMessage}
          </Alert>
        </Container>
      )}
      <SimpleGrid cols={{ base: 1, sm: 3, lg: 5 }}>
        <CreateProposalForm
          proposalTopic={proposalTopic}
          onProposalTopicChange={setProposalTopic}
          onCreateProposal={createProposal}
          loading={loading}
        />
        {myProposals.map((proposal, index) => (
          <ProposalCard
            key={index}
            proposal={proposal}
            myGovernorContract={myGovernorContract}
          />
        ))}
      </SimpleGrid>
    </div>
  );
}

interface CreateProposalFormProps {
  proposalTopic: string;
  onProposalTopicChange: any;
  onCreateProposal: any;
  loading: any;
}

const CreateProposalForm: React.FC<CreateProposalFormProps> = ({
  proposalTopic,
  onProposalTopicChange,
  onCreateProposal,
  loading,
}) => {
  return (
    <Card key={-1} shadow="sm" padding="lg" radius="md" withBorder>
      <Card.Section>
        <Container py={12}>
          <Group justify="center">
            <Avatar color="blue" radius="xl">
              <IconPlus size="1.5rem" />
            </Avatar>
            <Text fw={700}>Create Your Proposal</Text>
          </Group>
        </Container>
      </Card.Section>
      <Stack>
        <TextInput
          label="Proposal Topic"
          placeholder="Enter Proposal Topic..."
          value={proposalTopic}
          onChange={(e: any) => onProposalTopicChange(e.target.value)}
        />
        <Button loading={loading} onClick={onCreateProposal}>
          Create Proposal
        </Button>
      </Stack>
    </Card>
  );
};

interface ProposalCardProps {
  proposal: any;
  myGovernorContract: MyGovernor | null;
}

const ProposalCard: React.FC<ProposalCardProps> = ({
  proposal,
  myGovernorContract,
}) => {
  const [proposalStatus, setProposalStatus] = useState(proposal.status);
  const [votesStatus, setVotesStatus] = useState(proposal.votes);
  const [alertMessage, setAlertMessage] = useState("");

  const updateProposalStatusAndVotesStatus = async () => {
    if (myGovernorContract) {
      const newState = await myGovernorContract.state(proposal.proposalId);
      console.log(newState);
      setProposalStatus(newState);

      const votes = await myGovernorContract.proposalVotes(proposal.proposalId);
      setVotesStatus({
        againstVotes: votes[0],
        forVotes: votes[1],
        abstainVotes: votes[2],
      });
    }
  };

  const castVote = async (support: number) => {
    try {
      if (myGovernorContract) {
        await myGovernorContract.castVote(BigInt(proposal.proposalId), support);
        updateProposalStatusAndVotesStatus();
      }
    } catch (error) {
      setAlertMessage("Cast Vote Unsuccessfully!");
    }
  };

  const handleQueue = async () => {
    try {
      if (myGovernorContract) {
        const descriptionHash = ethers.keccak256(
          ethers.toUtf8Bytes(proposal.description)
        );
        await myGovernorContract.queue(
          proposal.targets,
          proposal.values,
          proposal.calldatas,
          descriptionHash
        );
        setAlertMessage("Queued Successfully!");
      }
    } catch (error) {
      console.error("Error queuing the proposal:", error);
      setAlertMessage("Failed to Queue!");
    }
  };

  const handleExecute = async () => {
    try {
      if (myGovernorContract) {
        const descriptionHash = ethers.keccak256(
          ethers.toUtf8Bytes(proposal.description)
        );
        await myGovernorContract.execute(
          proposal.targets,
          proposal.values,
          proposal.calldatas,
          descriptionHash
        );
        setAlertMessage("Executed Successfully!");
        updateProposalStatusAndVotesStatus();
      }
    } catch (error) {
      console.error("Error executing the proposal!:", error);
      setAlertMessage("Failed to Execute!");
    }
  };

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Card.Section>
        <Container py={12}>
          <Text fw={700} style={{ textAlign: "center" }}>
            {proposal.topic}
          </Text>
        </Container>
      </Card.Section>
      <Group justify="space-between" mt="md" mb="xs">
        <Text fw={500}>{getStatusString(proposalStatus)}</Text>

        <IconRefresh
          size="1.5rem"
          onClick={updateProposalStatusAndVotesStatus}
        />
        {votesStatus && proposalStatus != ProposalStatus.Pending && (
          <Stack>
            <Text size="sm">
              Against Votes: {votesStatus.againstVotes.toString()}
            </Text>
            <Text size="sm">For Votes: {votesStatus.forVotes.toString()}</Text>
            <Text size="sm">
              Abstain Votes: {votesStatus.abstainVotes.toString()}
            </Text>
          </Stack>
        )}

        <Badge color="blue" variant="light">
          proposalId: {proposal.proposalId.toString()}
        </Badge>
      </Group>
      <Text size="sm" c="dimmed">
        {proposal.description}
      </Text>

      {proposalStatus == ProposalStatus.Active && (
        <Stack>
          <Button onClick={() => castVote(0)}>Vote Against</Button>
          <Button onClick={() => castVote(1)}>Vote For</Button>
          <Button onClick={() => castVote(2)}>Abstain</Button>
        </Stack>
      )}

      {proposalStatus == ProposalStatus.Succeeded && (
        <Button onClick={handleQueue}>Queue</Button>
      )}

      {proposalStatus == ProposalStatus.Queued && (
        <Button onClick={handleExecute}>Execute</Button>
      )}

      {alertMessage && (
        <Container py={8}>
          <Alert
            variant="light"
            color={alertMessage.includes("失敗") ? "red" : "teal"}
            title={alertMessage}
            withCloseButton
            onClose={() => setAlertMessage("")}
          >
            {alertMessage}
          </Alert>
        </Container>
      )}
    </Card>
  );
};
