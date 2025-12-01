import ListSvg from "@/assets/icons/List.svg";
import LogoSvg from "@/assets/icons/logo.svg";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import styled from "styled-components/native";

const HeaderContainer = styled.View<{ topInset: number }>`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding-top: ${(props) => props.topInset + 20}px;
  padding-bottom: 20px;
  padding-left: 16px;
  padding-right: 16px;
`;

const LeftSection = styled.View`
  flex-direction: row;
  align-items: center;
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

const ListButton = styled.TouchableOpacity`
  padding: 4px;
`;

export default function AppHeader() {
  const insets = useSafeAreaInsets();

  return (
    <HeaderContainer topInset={insets.top}>
      <LeftSection>
        <LogoContainer>
          <LogoSvg width={30} height={25} />
        </LogoContainer>
        <LogoText>PillMate</LogoText>
      </LeftSection>
      <ListButton>
        <ListSvg width={24} height={24} />
      </ListButton>
    </HeaderContainer>
  );
}
