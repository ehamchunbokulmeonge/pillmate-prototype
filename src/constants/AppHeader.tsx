import LogoSvg from "@/assets/icons/logo.svg";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import styled from "styled-components/native";

const HeaderContainer = styled.View<{ topInset: number }>`
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  padding-top: ${(props) => props.topInset + 10}px;
  padding-bottom: 10px;
  padding-left: 16px;
  padding-right: 16px;
  background-color: #fff;
  border-bottom-width: 1px;
  border-bottom-color: #c0c0c0;
`;

const LogoText = styled.Text`
  font-size: 32px;
  font-weight: 700;
  color: #000;
  margin-left: 6px;
`;

export default function AppHeader() {
  const insets = useSafeAreaInsets();

  return (
    <HeaderContainer topInset={insets.top}>
      <LogoSvg width={39} height={32} />
      <LogoText>PillMate</LogoText>
    </HeaderContainer>
  );
}
