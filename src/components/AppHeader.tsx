import LogoSvg from "@/assets/icons/logo.svg";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import styled from "styled-components/native";

const HeaderContainer = styled.View<{ topInset: number }>`
  flex-direction: row;
  align-items: center;
  padding-top: ${(props) => props.topInset + 20}px;
  padding-bottom: 20px;
  padding-left: 20px;
  padding-right: 20px;
  border-bottom-width: 1px;
  border-bottom-color: #c0c0c0;
`;

const LogoContainer = styled.View`
  padding: 2px;
`;

const LogoText = styled.Text`
  font-size: 32px;
  font-weight: 700;
  color: #000;
  margin-left: 10px;
`;

export default function AppHeader() {
  const insets = useSafeAreaInsets();

  return (
    <HeaderContainer topInset={insets.top}>
      <LogoContainer>
        <LogoSvg width={32} height={33} />
      </LogoContainer>
      <LogoText>PillMate</LogoText>
    </HeaderContainer>
  );
}
