import type { ReactNode } from "react";

function Svg({ children, size = 16 }: { children: ReactNode; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {children}
    </svg>
  );
}

type P = { size?: number };

export const IconPlus = ({ size }: P) => <Svg size={size}><path d="M12 5v14M5 12h14" /></Svg>;
export const IconSearch = ({ size }: P) => <Svg size={size}><circle cx="11" cy="11" r="6.5" /><path d="m16 16 4 4" /></Svg>;
export const IconMenu = ({ size }: P) => <Svg size={size}><path d="M4 7h16M4 12h16M4 17h16" /></Svg>;
export const IconPanel = ({ size }: P) => <Svg size={size}><rect x="3.5" y="4.5" width="17" height="15" rx="2.5" /><path d="M14.5 4.5v15" /></Svg>;
export const IconSidebar = ({ size }: P) => <Svg size={size}><rect x="3.5" y="4.5" width="17" height="15" rx="2.5" /><path d="M9.5 4.5v15" /></Svg>;
export const IconShare = ({ size }: P) => <Svg size={size}><path d="M12 15V4M8 8l4-4 4 4M5 13v5.5A1.5 1.5 0 0 0 6.5 20h11a1.5 1.5 0 0 0 1.5-1.5V13" /></Svg>;
export const IconCopy = ({ size }: P) => <Svg size={size}><rect x="8.5" y="8.5" width="11" height="11" rx="2" /><path d="M15.5 8.5V6A1.5 1.5 0 0 0 14 4.5H6A1.5 1.5 0 0 0 4.5 6v8A1.5 1.5 0 0 0 6 15.5h2.5" /></Svg>;
export const IconCheck = ({ size }: P) => <Svg size={size}><path d="m5 12.5 4.5 4.5L19 7.5" /></Svg>;
export const IconRefresh = ({ size }: P) => <Svg size={size}><path d="M19.5 12a7.5 7.5 0 1 1-2.3-5.4M19.5 4.5v4h-4" /></Svg>;
export const IconUp = ({ size }: P) => <Svg size={size}><path d="M12 19V5M6 11l6-6 6 6" /></Svg>;
export const IconStop = ({ size }: P) => <svg width={size ?? 14} height={size ?? 14} viewBox="0 0 24 24" fill="currentColor" aria-hidden><rect x="6" y="6" width="12" height="12" rx="2" /></svg>;
export const IconThumbUp = ({ size }: P) => <Svg size={size}><path d="M7.5 11v8.5h-3V11h3Zm0 0 3.8-7c1.6 0 2.4 1 2.1 2.4L12.8 10H19a1.5 1.5 0 0 1 1.5 1.8l-1.3 6.5a2 2 0 0 1-2 1.7H7.5" /></Svg>;
export const IconThumbDown = ({ size }: P) => <Svg size={size}><path d="M7.5 13V4.5h-3V13h3Zm0 0 3.8 7c1.6 0 2.4-1 2.1-2.4L12.8 14H19a1.5 1.5 0 0 0 1.5-1.8l-1.3-6.5a2 2 0 0 0-2-1.7H7.5" /></Svg>;
export const IconDoc = ({ size }: P) => <Svg size={size}><path d="M7 3.5h7l4.5 4.5v12.5H7V3.5Z" /><path d="M14 3.5V8h4.5" /></Svg>;
export const IconPencil = ({ size }: P) => <Svg size={size}><path d="m5 19 1-4L16.5 4.5a1.8 1.8 0 0 1 2.5 0l.5.5a1.8 1.8 0 0 1 0 2.5L9 18l-4 1Z" /></Svg>;
export const IconTrash = ({ size }: P) => <Svg size={size}><path d="M5 7h14M10 7V4.5h4V7M7 7l.8 12h8.4L17 7" /></Svg>;
export const IconSettings = ({ size }: P) => <Svg size={size}><circle cx="12" cy="12" r="3" /><path d="M12 3.5v2M12 18.5v2M3.5 12h2M18.5 12h2M6 6l1.4 1.4M16.6 16.6 18 18M6 18l1.4-1.4M16.6 7.4 18 6" /></Svg>;
export const IconMore = ({ size }: P) => <svg width={size ?? 16} height={size ?? 16} viewBox="0 0 24 24" fill="currentColor" aria-hidden><circle cx="5.5" cy="12" r="1.6" /><circle cx="12" cy="12" r="1.6" /><circle cx="18.5" cy="12" r="1.6" /></svg>;
export const IconClose = ({ size }: P) => <Svg size={size}><path d="m6 6 12 12M18 6 6 18" /></Svg>;
export const IconBack = ({ size }: P) => <Svg size={size}><path d="M19 12H5M11 6l-6 6 6 6" /></Svg>;
