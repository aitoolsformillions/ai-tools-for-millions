"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

type AppShellProps = {
  children: React.ReactNode;
};

type NavigationItem = {
  href: string;
  label: string;
  description?: string;
};

const primaryNavigation: NavigationItem[] = [
  {
    href: "/dashboard",
    label: "Dashboard",
    description: "Your personalized home",
  },
  {
    href: "/opportunities",
    label: "Opportunities",
    description: "Find ways to make, save, and build",
  },
  {
    href: "/learn",
    label: "Learn AI",
    description: "Build practical AI skills",
  },
  {
    href: "/tools",
    label: "AI Tools",
    description: "Discover useful AI software",
  },
  {
    href: "/stacks",
    label: "AI Stacks",
    description: "Use tools together in workflows",
  },
  {
    href: "/favorites",
    label: "Favorites",
    description: "Your saved AI tools",
  },
];

const accountNavigation: NavigationItem[] = [
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
              aria-expanded={mobileOpen}
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
                  "rgba(2,6,23,0.985)",
                overflowY: "auto",
                padding:
                  "20px 18px 40px",
              }}
            >
              <MobileNavigation
                pathname={pathname}
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
              "260px minmax(0, 1fr)",
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
              background:
                "rgba(2,6,23,0.88)",
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
                marginBottom: 8,
              }}
            >
              AI Tools for Millions
            </Link>

            <p
              style={{
                margin: "0 0 24px",
                color:
                  "rgba(255,255,255,0.45)",
                fontSize: 12,
                lineHeight: 1.5,
              }}
            >
              Learn. Build. Apply AI.
            </p>

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
      <NavigationSectionLabel>
        Build With AI
      </NavigationSectionLabel>

      <nav
        style={{
          display: "grid",
          gap: 5,
        }}
      >
        {primaryNavigation.map(
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
        }}
      >
        <NavigationSectionLabel>
          Account
        </NavigationSectionLabel>

        <nav
          style={{
            display: "grid",
            gap: 5,
          }}
        >
          {accountNavigation.map(
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
      </div>

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
            padding: "14px",
            borderRadius: 14,
            background:
              pathname ===
              "/upgrade"
                ? "rgba(37,99,235,0.32)"
                : "linear-gradient(180deg, rgba(37,99,235,0.22), rgba(37,99,235,0.12))",
            border:
              "1px solid rgba(96,165,250,0.28)",
            color: "#dbeafe",
            textDecoration:
              "none",
          }}
        >
          <p
            style={{
              margin: 0,
              color: "#bfdbfe",
              fontSize: 12,
              fontWeight: 900,
            }}
          >
            ★ AITFM PRO
          </p>

          <p
            style={{
              margin: "5px 0 0",
              color: "#ffffff",
              fontSize: 14,
              fontWeight: 800,
            }}
          >
            Unlock the full system
          </p>

          <p
            style={{
              margin: "5px 0 0",
              color:
                "rgba(255,255,255,0.58)",
              fontSize: 11,
              lineHeight: 1.45,
            }}
          >
            Premium opportunities, learning,
            workflows, and member intelligence.
          </p>
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
    <div
      style={{
        maxWidth: 520,
        margin: "0 auto",
      }}
    >
      <p
        style={{
          margin: "0 0 8px",
          color:
            "rgba(255,255,255,0.42)",
          fontSize: 11,
          fontWeight: 800,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
        }}
      >
        Build With AI
      </p>

      <nav
        style={{
          display: "grid",
          gap: 8,
        }}
      >
        {primaryNavigation.map(
          (item) => (
            <NavigationLink
              key={item.href}
              href={item.href}
              label={item.label}
              description={
                item.description
              }
              pathname={pathname}
              mobile
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
        <p
          style={{
            margin: "0 0 8px",
            color:
              "rgba(255,255,255,0.42)",
            fontSize: 11,
            fontWeight: 800,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
          }}
        >
          Account
        </p>

        <nav
          style={{
            display: "grid",
            gap: 8,
          }}
        >
          {accountNavigation.map(
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
        </nav>
      </div>

      <Link
        href="/upgrade"
        style={{
          display: "block",
          marginTop: 22,
          padding: "16px",
          borderRadius: 14,
          background:
            "linear-gradient(180deg, rgba(37,99,235,0.22), rgba(37,99,235,0.12))",
          border:
            "1px solid rgba(96,165,250,0.28)",
          color: "#ffffff",
          textDecoration: "none",
        }}
      >
        <p
          style={{
            margin: 0,
            color: "#bfdbfe",
            fontSize: 12,
            fontWeight: 900,
          }}
        >
          ★ UPGRADE TO PRO
        </p>

        <p
          style={{
            margin: "6px 0 0",
            fontSize: 15,
            fontWeight: 800,
          }}
        >
          Unlock the complete AITFM experience
        </p>

        <p
          style={{
            margin: "5px 0 0",
            color:
              "rgba(255,255,255,0.58)",
            lineHeight: 1.5,
            fontSize: 12,
          }}
        >
          Get premium opportunities, learning
          paths, AI Stacks, and deeper
          recommendations.
        </p>
      </Link>
    </div>
  );
}

function NavigationSectionLabel({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <p
      style={{
        margin: "0 0 8px",
        color:
          "rgba(255,255,255,0.38)",
        fontSize: 10,
        fontWeight: 800,
        letterSpacing: "0.12em",
        textTransform: "uppercase",
      }}
    >
      {children}
    </p>
  );
}

function NavigationLink({
  href,
  label,
  description,
  pathname,
  mobile = false,
}: {
  href: string;
  label: string;
  description?: string;
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
          ? "13px 14px"
          : "10px 12px",
        borderRadius: mobile
          ? 12
          : 10,
        background: active
          ? "rgba(37,99,235,0.18)"
          : "transparent",
        border: active
          ? "1px solid rgba(96,165,250,0.22)"
          : "1px solid transparent",
        color: active
          ? "#bfdbfe"
          : "#dbeafe",
        textDecoration: "none",
      }}
    >
      <span
        style={{
          display: "block",
          fontWeight: active
            ? 800
            : 700,
          fontSize: mobile
            ? 16
            : 14,
        }}
      >
        {label}
      </span>

      {mobile && description ? (
        <span
          style={{
            display: "block",
            marginTop: 3,
            color:
              "rgba(255,255,255,0.46)",
            fontSize: 12,
            lineHeight: 1.45,
          }}
        >
          {description}
        </span>
      ) : null}
    </Link>
  );
}