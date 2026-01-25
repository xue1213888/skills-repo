import Link from "next/link";

import type { RegistrySkill } from "@/lib/types";

export function SkillCard({ skill }: { skill: RegistrySkill }) {
  return (
    <Link href={`/s/${skill.id}`} className="card interactive skillCard">
      <div className="skillCardTop">
        <h3 className="skillCardTitle">{skill.title}</h3>
        <span className="chip accent">
          {skill.category}/{skill.subcategory}
        </span>
      </div>

      <p className="muted skillCardDesc">{skill.description}</p>

      <div className="skillCardMeta">
        {(skill.tags ?? []).slice(0, 6).map((t) => (
          <span key={t} className="chip">
            #{t}
          </span>
        ))}
        {(skill.agents ?? []).slice(0, 3).map((a) => (
          <span key={a} className="chip">
            {a}
          </span>
        ))}
      </div>
    </Link>
  );
}
