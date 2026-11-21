import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import NewWebsiteAnnouncement, { ANNOUNCEMENT_SESSION_KEY } from "@/components/NewWebsiteAnnouncement";

beforeEach(() => {
  sessionStorage.clear();
  HTMLDialogElement.prototype.showModal = function () { this.setAttribute("open", ""); };
  HTMLDialogElement.prototype.close = function () { this.removeAttribute("open"); };
  vi.stubGlobal("ResizeObserver", class { observe() {} disconnect() {} });
});
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

describe("new website announcement", () => {
  it("opens immediately in a fresh browsing session", () => {
    render(<NewWebsiteAnnouncement />);
    expect(screen.getByRole("dialog").hasAttribute("open")).toBe(true);
    expect(document.body.style.overflow).toBe("hidden");
  });
  it("sends the primary CTA to the new website in the same tab", () => {
    render(<NewWebsiteAnnouncement />);
    const link = screen.getByRole("link", { name: /Explore/ });
    expect(link.getAttribute("href")).toBe("https://antamhomes.cz/");
    expect(link.getAttribute("target")).toBeNull();
  });
  it.each(["Stay on the Current Website", "Close announcement"])("%s reveals the persistent banner", (name) => {
    render(<NewWebsiteAnnouncement />);
    fireEvent.click(screen.getByRole("button", { name }));
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(screen.getByRole("complementary")).toBeTruthy();
    expect(sessionStorage.getItem(ANNOUNCEMENT_SESSION_KEY)).toBe("1");
    expect(document.body.style.overflow).toBe("");
  });
  it("Escape dismissal reveals the same banner", () => {
    render(<NewWebsiteAnnouncement />);
    fireEvent(screen.getByRole("dialog"), new Event("cancel", { cancelable: true }));
    expect(screen.getByRole("complementary")).toBeTruthy();
  });
  it("keeps the banner after a page remount within the session", () => {
    const first = render(<NewWebsiteAnnouncement />);
    fireEvent.click(screen.getByRole("button", { name: "Close announcement" }));
    first.unmount();
    render(<NewWebsiteAnnouncement />);
    expect(screen.queryByRole("dialog")).toBeNull();
    const link = screen.getByRole("link", { name: /Visit Our New Website/ });
    expect(link.getAttribute("href")).toBe("https://antamhomes.cz/");
    expect(link.getAttribute("target")).toBeNull();
  });
});