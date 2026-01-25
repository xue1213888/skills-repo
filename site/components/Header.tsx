import Link from "next/link";

import { REPO_URL, SITE_NAME } from "@/lib/config";

export function Header() {
  return (
    <header className="siteHeader">
      <div className="container headerInner">
        <Link href="/" className="brand" aria-label={`${SITE_NAME} home`}>
          <span className="brandMark" aria-hidden="true" />
          <span className="brandName">{SITE_NAME}</span>
          <span className="chip">registry</span>
        </Link>

        <nav className="nav" aria-label="Primary">
          <Link className="btn" href="/categories">
            Categories
          </Link>
          <Link className="btn primary" href="/import">
            Import
          </Link>
          {REPO_URL ? (
            <a className="btn" href={REPO_URL} target="_blank" rel="noreferrer">
              GitHub
            </a>
          ) : null}
        </nav>
      </div>
    </header>
  );
}
