import { ReactNode } from "react";
import styled from "styled-components/native";

const Container = styled.View`
  flex: 1;
  background-color: #fff;
`;

interface PageLayoutProps {
  children: ReactNode;
}

export default function PageLayout({ children }: PageLayoutProps) {
  return <Container>{children}</Container>;
}
