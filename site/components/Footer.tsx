import { REPO_URL } from "@/lib/config";

export function Footer() {
  return (
    <footer className="siteFooter">
      <div className="container footerInner">
        <span style={{ fontSize: 13 }}>Built from repo metadata. Static. SEO-friendly. Forkable.</span>
        {REPO_URL ? (
          <a href={REPO_URL} target="_blank" rel="noreferrer" style={{ fontSize: 13, textDecoration: "underline" }}>
            Contribute on GitHub
          </a>
        ) : null}
      </div>
    </footer>
  );
}
