
import { ChatIcon, ClockIcon, HomeIcon, PillIcon } from "@/assets/icons/index";
import { Href, router, usePathname } from "expo-router";
import { JSX } from "react";
import { Platform, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import styled from "styled-components/native";

const TabBarContainer = styled.View<{ bottomInset: number }>`
  flex-direction: row;
  background-color: #fff;
  height: ${(props) => 74 + props.bottomInset}px;
  padding-top: 16px;
  padding-bottom: ${(props) => 12 + props.bottomInset}px;
  padding-left: 24px;
  padding-right: 24px;
  gap: 8px;
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
  color: ${(props) => (props.isActive ? "#FF4242" : "#9B9B9B")};
`;

interface TabItem {
  path: Href;
  label: string;
  icon: (props: { isActive: boolean }) => JSX.Element;
}

const tabs: TabItem[] = [
  {
    path: "/" as Href,
    label: "홈",
    icon: ({ isActive }) => (
      <HomeIcon width={32} height={32} isActive={isActive} />
    ),
  },
  {
    path: "/medicine" as Href,
    label: "약",
    icon: ({ isActive }) => (
      <PillIcon width={32} height={32} isActive={isActive} />
    ),
  },
  {
    path: "/schedule" as Href,
    label: "일정",
    icon: ({ isActive }) => (
      <ClockIcon width={32} height={32} isActive={isActive} />
    ),
  },
  {
    path: "/chat" as Href,
    label: "AI 상담",
    icon: ({ isActive }) => (
      <ChatIcon width={32} height={32} isActive={isActive} />
    ),
  },
];

export default function TabBar() {
  const insets = useSafeAreaInsets();
  const pathname = usePathname();

  return (
    <View style={styles.shadowContainer}>
      <TabBarContainer bottomInset={insets.bottom}>
        {tabs.map((tab, index) => {
          const isActive = pathname === tab.path;

          return (
            <TabButton
              key={`${tab.label}-${index}`}
              onPress={() => router.replace(tab.path)}
            >
              {tab.icon({ isActive })}
              <TabLabel isActive={isActive}>{tab.label}</TabLabel>
            </TabButton>
          );
        })}
      </TabBarContainer>
    </View>
  );
}

const styles = StyleSheet.create({
  shadowContainer: {
    backgroundColor: "#fff",
    ...Platform.select({
      ios: {
        shadowColor: "rgba(155, 155, 155, 0.2)",
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 1,
        shadowRadius: 6,
      },
      android: {
        elevation: 6,
      },
    }),
  },
});
