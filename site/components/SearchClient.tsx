"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import type { RegistrySkill } from "@/lib/types";

import { SkillCard } from "@/components/SkillCard";

export function SearchClient({ skills }: { skills: RegistrySkill[] }) {
  const [q, setQ] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key !== "/" || e.metaKey || e.ctrlKey || e.altKey) return;
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName?.toLowerCase() ?? "";
      if (tag === "input" || tag === "textarea" || target?.isContentEditable) return;
      e.preventDefault();
      inputRef.current?.focus();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const results = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return skills.slice(0, 18);

    return skills
      .filter((s) => {
        const haystack = [s.id, s.title, s.description, s.summary, (s.tags ?? []).join(" "), (s.agents ?? []).join(" ")]
          .filter(Boolean)
          .join("\n")
          .toLowerCase();
        return haystack.includes(query);
      })
      .slice(0, 24);
  }, [q, skills]);

  return (
    <section className="card strong" style={{ padding: 16 }}>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div style={{ minWidth: 260, flex: "1 1 420px" }}>
          <label style={{ display: "block", fontWeight: 800, letterSpacing: "-0.01em" }}>Search skills</label>
          <div className="muted" style={{ marginTop: 6, fontSize: 13 }}>
            Tip: press <span className="chip">/</span> to focus the search box
          </div>
          <input
            ref={inputRef}
            className="input"
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="keyword / tag / agent / id…"
            aria-label="Search skills"
            style={{ marginTop: 8 }}
          />
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <div className="chip">{q.trim() ? `${results.length} / ${skills.length}` : `${skills.length} total`}</div>
          {q.trim() ? (
            <button className="btn" onClick={() => setQ("")} type="button" style={{ padding: "9px 12px" }}>
              Clear
            </button>
          ) : null}
        </div>
      </div>

      <div className="cards" style={{ marginTop: 14 }}>
        {results.map((s) => (
          <SkillCard key={s.id} skill={s} />
        ))}
      </div>
    </section>
  );
}
