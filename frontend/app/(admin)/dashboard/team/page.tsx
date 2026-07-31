"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Users, UserPlus, X } from "lucide-react";
import { projectsService } from "@/services/projects.service";
import { TeamPerson } from "@/types/team.types";

function initialOf(person: TeamPerson) {
  const label = person.user.fullname || person.user.email || "?";
  return label.charAt(0).toUpperCase();
}

function PersonCard({
  person,
  removable,
  onRemove,
  removingKey,
}: {
  person: TeamPerson;
  removable: boolean;
  onRemove?: (projectId: string) => void;
  removingKey?: string | null;
}) {
  return (
    <div className="flex items-start gap-3 p-4 rounded-xl border border-border bg-card">
      {person.user.profileImage ? (
        <img src={person.user.profileImage} alt="" className="w-10 h-10 rounded-full object-cover shrink-0" />
      ) : (
        <div className="w-10 h-10 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center text-sm font-semibold shrink-0">
          {initialOf(person)}
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-foreground truncate">{person.user.fullname || "—"}</p>
        <p className="text-xs text-muted-foreground truncate">{person.user.email}</p>
        <div className="flex flex-wrap gap-1.5 mt-2.5">
          {person.projects.map((p) => (
            <span
              key={p._id}
              className="inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded-md bg-secondary text-secondary-foreground"
            >
              <Link href={`/dashboard/projects/${p.slug}`} className="hover:text-primary transition">
                {p.name}
              </Link>
              {removable && (
                <button
                  onClick={() => onRemove?.(p._id)}
                  disabled={removingKey === `${person.user._id}:${p._id}`}
                  className="hover:text-destructive transition disabled:opacity-40"
                  title={`Remove from ${p.name}`}
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function TeamPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [removingKey, setRemovingKey] = useState<string | null>(null);

  const query = useQuery({
    queryKey: ["myTeam"],
    queryFn: () => projectsService.getMyTeam(),
  });

  const removeMutation = useMutation({
    mutationFn: ({ projectId, memberId }: { projectId: string; memberId: string }) =>
      projectsService.removeMember(projectId, memberId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myTeam"] });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      toast.success("Removed from project");
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || "Could not remove this person."),
    onSettled: () => setRemovingKey(null),
  });

  const handleRemove = (person: TeamPerson, projectId: string) => {
    if (!confirm(`Remove ${person.user.fullname || person.user.email} from this project?`)) return;
    setRemovingKey(`${person.user._id}:${projectId}`);
    removeMutation.mutate({ projectId, memberId: person.user._id });
  };

  const myTeam = query.data?.data.myTeam ?? [];
  const sharedWithMe = query.data?.data.sharedWithMe ?? [];

  const matches = (p: TeamPerson) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (p.user.fullname || "").toLowerCase().includes(q) || p.user.email.toLowerCase().includes(q);
  };

  const filteredMyTeam = myTeam.filter(matches);
  const filteredShared = sharedWithMe.filter(matches);

  return (
    <div className="p-6 md:p-10">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="pb-6 border-b border-border flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Team</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Everyone you collaborate with, across every project, in one place.
            </p>
          </div>
          <Link
            href="/dashboard/projects"
            className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground text-xs font-medium px-3.5 py-2 rounded-lg hover:opacity-90 transition shrink-0"
          >
            <UserPlus className="w-3.5 h-3.5" /> Invite someone
          </Link>
        </div>

        {(myTeam.length > 0 || sharedWithMe.length > 0) && (
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full px-3.5 py-2.5 bg-card border border-border rounded-lg text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition"
          />
        )}

        {query.isLoading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
          </div>
        ) : (
          <>
            <section className="space-y-3">
              <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Your team {myTeam.length ? `(${myTeam.length})` : ""}
              </h2>
              {filteredMyTeam.length === 0 ? (
                <div className="text-center py-10 border border-dashed border-border rounded-xl bg-card/30">
                  <Users className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    {myTeam.length === 0
                      ? "You haven't invited anyone to your projects yet."
                      : "No one matches that search."}
                  </p>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-3">
                  {filteredMyTeam.map((person) => (
                    <PersonCard
                      key={person.user._id}
                      person={person}
                      removable
                      removingKey={removingKey}
                      onRemove={(projectId) => handleRemove(person, projectId)}
                    />
                  ))}
                </div>
              )}
            </section>

            <section className="space-y-3">
              <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Shared with you {sharedWithMe.length ? `(${sharedWithMe.length})` : ""}
              </h2>
              {filteredShared.length === 0 ? (
                <div className="text-center py-10 border border-dashed border-border rounded-xl bg-card/30">
                  <Users className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    {sharedWithMe.length === 0
                      ? "No one has shared a project with you yet."
                      : "No one matches that search."}
                  </p>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-3">
                  {filteredShared.map((person) => (
                    <PersonCard key={person.user._id} person={person} removable={false} />
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </div>
  );
}
