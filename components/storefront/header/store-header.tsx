import { AnnouncementBar } from "./announcement-bar";
import { DesktopHeader } from "./desktop-header";
import { MobileHeader } from "./mobile-header";

export function StoreHeader() {
  return (
    <header className="sticky top-0 z-50 w-full">
      <AnnouncementBar />

      <DesktopHeader />

      <MobileHeader />
    </header>
  );
}