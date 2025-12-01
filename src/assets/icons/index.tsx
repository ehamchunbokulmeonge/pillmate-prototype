import ChatCircleDotsPrSvg from "./ChatCircleDots-pr.svg";
import ChatCircleDotsSvg from "./ChatCircleDots.svg";
import ClockCountdownPrSvg from "./ClockCountdown-pr.svg";
import ClockCountdownSvg from "./ClockCountdown.svg";
import HousePrSvg from "./House-pr.svg";
import HouseSvg from "./House.svg";
import PillPrSvg from "./Pill-pr.svg";
import PillSvg from "./Pill.svg";

interface IconProps {
  width?: number;
  height?: number;
  isActive?: boolean;
}

export const HomeIcon: React.FC<IconProps> = ({
  width = 32,
  height = 32,
  isActive = false,
}) =>
  isActive ? (
    <HousePrSvg width={width} height={height} />
  ) : (
    <HouseSvg width={width} height={height} />
  );

export const PillIcon: React.FC<IconProps> = ({
  width = 32,
  height = 32,
  isActive = false,
}) =>
  isActive ? (
    <PillPrSvg width={width} height={height} />
  ) : (
    <PillSvg width={width} height={height} />
  );

export const ClockIcon: React.FC<IconProps> = ({
  width = 32,
  height = 32,
  isActive = false,
}) =>
  isActive ? (
    <ClockCountdownPrSvg width={width} height={height} />
  ) : (
    <ClockCountdownSvg width={width} height={height} />
  );

export const ChatIcon: React.FC<IconProps> = ({
  width = 32,
  height = 32,
  isActive = false,
}) =>
  isActive ? (
    <ChatCircleDotsPrSvg width={width} height={height} />
  ) : (
    <ChatCircleDotsSvg width={width} height={height} />
  );
