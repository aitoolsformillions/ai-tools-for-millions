"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

type AppShellProps = {
  children: React.ReactNode;
};

const navigationItems = [
  {
    href: "/dashboard",
    label: "Dashboard",
  },
  {
    href: "/tools",
    label: "Explore AI Tools",
  },
  {
    href: "/opportunities",
    label: "Opportunities",
  },
  {
    href: "/learn",
    label: "Learn AI",
  },
  {
    href: "/favorites",
    label: "Favorites",
  },
  {
    href: "/stacks",
    label: "AI Stacks",
  },
  {
    href: "/profile",
    label: "Profile",
  },
  {
    href: "/settings",
    label: "Settings",
  },
];

export function AppShell({
  children,
}: AppShellProps) {
  const pathname = usePathname();

  const [mobileOpen, setMobileOpen] =
    useState(false);

  const [isMobile, setIsMobile] =
    useState(false);

  useEffect(() => {
    function updateScreenSize() {
      setIsMobile(
        window.innerWidth < 900
      );
    }

    updateScreenSize();

    window.addEventListener(
      "resize",
      updateScreenSize
    );

    return () => {
      window.removeEventListener(
        "resize",
        updateScreenSize
      );
    };
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#020617",
      }}
    >
      {isMobile ? (
        <>
          <header
            style={{
              position: "sticky",
              top: 0,
              zIndex: 50,
              display: "flex",
              justifyContent:
                "space-between",
              alignItems: "center",
              gap: 16,
              minHeight: 68,
              padding: "12px 18px",
              background:
                "rgba(2,6,23,0.96)",
              borderBottom:
                "1px solid rgba(255,255,255,0.08)",
              backdropFilter:
                "blur(14px)",
            }}
          >
            <Link
              href="/dashboard"
              style={{
                color: "#ffffff",
                textDecoration: "none",
                fontWeight: 900,
                fontSize: 17,
                lineHeight: 1.1,
              }}
            >
              AI Tools for Millions
            </Link>

            <button
              type="button"
              aria-label={
                mobileOpen
                  ? "Close navigation"
                  : "Open navigation"
              }
              aria-expanded={
                mobileOpen
              }
              onClick={() =>
                setMobileOpen(
                  (current) =>
                    !current
                )
              }
              style={{
                width: 44,
                height: 44,
                display: "grid",
                placeItems: "center",
                borderRadius: 12,
                border:
                  "1px solid rgba(255,255,255,0.14)",
                background:
                  "rgba(255,255,255,0.05)",
                color: "#ffffff",
                cursor: "pointer",
                fontSize: 22,
                fontWeight: 900,
              }}
            >
              {mobileOpen
                ? "×"
                : "☰"}
            </button>
          </header>

          {mobileOpen ? (
            <div
              style={{
                position: "fixed",
                inset: "68px 0 0 0",
                zIndex: 45,
                background:
                  "rgba(2,6,23,0.98)",
                overflowY: "auto",
                padding:
                  "20px 18px 40px",
              }}
            >
              <MobileNavigation
                pathname={
                  pathname
                }
              />
            </div>
          ) : null}

          <main
            style={{
              width: "100%",
              minWidth: 0,
              padding:
                "28px 18px 70px",
            }}
          >
            {children}
          </main>
        </>
      ) : (
        <div
          style={{
            minHeight: "100vh",
            display: "grid",
            gridTemplateColumns:
              "240px minmax(0, 1fr)",
          }}
        >
          <aside
            style={{
              height: "100vh",
              padding: 24,
              borderRight:
                "1px solid rgba(255,255,255,0.08)",
              position: "sticky",
              top: 0,
              overflowY: "auto",
            }}
          >
            <Link
              href="/dashboard"
              style={{
                color: "#ffffff",
                textDecoration:
                  "none",
                fontWeight: 900,
                fontSize: 20,
                display:
                  "inline-block",
                marginBottom: 26,
              }}
            >
              AI Tools for Millions
            </Link>

            <DesktopNavigation
              pathname={pathname}
            />
          </aside>

          <main
            style={{
              minWidth: 0,
              padding:
                "40px clamp(24px, 5vw, 64px) 80px",
            }}
          >
            {children}
          </main>
        </div>
      )}
    </div>
  );
}

function DesktopNavigation({
  pathname,
}: {
  pathname: string;
}) {
  return (
    <>
      <nav
        style={{
          display: "grid",
          gap: 6,
        }}
      >
        {navigationItems.map(
          (item) => (
            <NavigationLink
              key={item.href}
              href={item.href}
              label={item.label}
              pathname={pathname}
            />
          )
        )}
      </nav>

      <div
        style={{
          marginTop: 24,
          paddingTop: 20,
          borderTop:
            "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <Link
          href="/upgrade"
          style={{
            display: "block",
            padding: "11px 12px",
            borderRadius: 10,
            background:
              pathname ===
              "/upgrade"
                ? "rgba(37,99,235,0.28)"
                : "rgba(37,99,235,0.14)",
            border:
              "1px solid rgba(96,165,250,0.22)",
            color: "#bfdbfe",
            textDecoration:
              "none",
            fontWeight: 800,
          }}
        >
          ★ Upgrade to Pro
        </Link>
      </div>
    </>
  );
}

function MobileNavigation({
  pathname,
}: {
  pathname: string;
}) {
  return (
    <nav
      style={{
        display: "grid",
        gap: 8,
        maxWidth: 520,
        margin: "0 auto",
      }}
    >
      {navigationItems.map(
        (item) => (
          <NavigationLink
            key={item.href}
            href={item.href}
            label={item.label}
            pathname={pathname}
            mobile
          />
        )
      )}

      <Link
        href="/upgrade"
        style={{
          display: "block",
          marginTop: 12,
          padding: "14px 16px",
          borderRadius: 12,
          background:
            "rgba(37,99,235,0.16)",
          border:
            "1px solid rgba(96,165,250,0.24)",
          color: "#bfdbfe",
          textDecoration: "none",
          fontWeight: 800,
        }}
      >
        ★ Upgrade to Pro
      </Link>
    </nav>
  );
}

function NavigationLink({
  href,
  label,
  pathname,
  mobile = false,
}: {
  href: string;
  label: string;
  pathname: string;
  mobile?: boolean;
}) {
  const active =
    pathname === href ||
    (href !== "/dashboard" &&
      pathname.startsWith(
        `${href}/`
      ));

  return (
    <Link
      href={href}
      style={{
        display: "block",
        padding: mobile
          ? "14px 16px"
          : "10px 12px",
        borderRadius: mobile
          ? 12
          : 10,
        background: active
          ? "rgba(37,99,235,0.18)"
          : "transparent",
        border: active
          ? "1px solid rgba(96,165,250,0.2)"
          : "1px solid transparent",
        color: active
          ? "#bfdbfe"
          : "#dbeafe",
        textDecoration: "none",
        fontWeight: active
          ? 800
          : 700,
        fontSize: mobile
          ? 16
          : 14,
      }}
    >
      {label}
    </Link>
  );
}