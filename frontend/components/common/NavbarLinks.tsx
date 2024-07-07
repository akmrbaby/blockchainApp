import { NavLink } from "@mantine/core";
import { IconHome2, IconCards, IconBulb } from "@tabler/icons-react";
import Link from "next/link";
import { useState } from "react";

export const NavbarLinks = () => {
  const links = [
    { icon: <IconHome2 size={20} />, color: "green", label: "Home", path: "/" },
    {
      icon: <IconCards size={20} />,
      color: "green",
      label: "My NFT",
      path: "/mynft",
    },
    {
      icon: <IconBulb size={20} />,
      color: "green",
      label: "My Governor",
      path: "/mygovernor",
    },
  ];

  const [active, setActive] = useState(0);
  const linkElements = links.map((item, index) => (
    <NavLink
      component={Link}
      href={item.path}
      key={item.label}
      active={index === active}
      label={item.label}
      leftSection={item.icon}
      onClick={() => setActive(index)}
    />
  ));
  return <div>{linkElements}</div>;
};
