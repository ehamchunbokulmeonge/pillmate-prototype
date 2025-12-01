import { ChatIcon, ClockIcon, HomeIcon, PillIcon } from "@/assets/icons/index";
import { Href, router, usePathname } from "expo-router";
import { JSX } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import styled from "styled-components/native";

const TabBarContainer = styled.View<{ bottomInset: number }>`
  flex-direction: row;
  background-color: #fff;
  border-top-width: 0;
  height: ${(props) => 74 + props.bottomInset}px;
  padding-top: 16px;
  padding-bottom: ${(props) => 12 + props.bottomInset}px;
  padding-left: 40px;
  padding-right: 40px;
`;

const TabButton = styled.TouchableOpacity`
  flex: 1;
  align-items: center;
  justify-content: center;
`;

const TabLabel = styled.Text<{ isActive: boolean }>`
  font-size: 12px;
  font-weight: 500;
  margin-top: 4px;
  color: ${(props) => (props.isActive ? "#FF6249" : "#9B9B9B")};
`;

interface TabItem {
  path: Href;
  label: string;
  icon: (props: { color: string }) => JSX.Element;
}

const tabs: TabItem[] = [
  {
    path: "/" as Href,
    label: "홈",
    icon: ({ color }) => <HomeIcon width={32} height={32} color={color} />,
  },
  {
    path: "/" as Href,
    label: "약",
    icon: ({ color }) => <PillIcon width={32} height={32} color={color} />,
  },
  {
    path: "/schedule" as Href,
    label: "일정",
    icon: ({ color }) => <ClockIcon width={32} height={32} color={color} />,
  },
  {
    path: "/chat" as Href,
    label: "AI 상담",
    icon: ({ color }) => <ChatIcon width={32} height={32} color={color} />,
  },
];

export default function TabBar() {
  const insets = useSafeAreaInsets();
  const pathname = usePathname();

  return (
    <TabBarContainer bottomInset={insets.bottom}>
      {tabs.map((tab, index) => {
        const isActive = pathname === tab.path;
        const color = isActive ? "#FF6249" : "#9B9B9B";

        return (
          <TabButton
            key={`${tab.label}-${index}`}
            onPress={() => router.push(tab.path)}
          >
            {tab.icon({ color })}
            <TabLabel isActive={isActive}>{tab.label}</TabLabel>
          </TabButton>
        );
      })}
    </TabBarContainer>
  );
}
