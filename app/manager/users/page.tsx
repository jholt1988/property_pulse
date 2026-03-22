"use client";

import { useEffect, useMemo, useState } from "react";
import { createUser, deleteUser, getUsers, updateUser } from "@/lib/api";

type Role = "TENANT" | "PROPERTY_MANAGER";

export default function ManagerUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"" | Role>("");
  const [skip, setSkip] = useState(0);
  const [take] = useState(10);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [form, setForm] = useState({ username: "", password: "", role: "TENANT" as Role });

  const token = typeof document !== "undefined" ? document.cookie.match(/(?:^|; )session_token=([^;]+)/)?.[1] : undefined;

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const q = new URLSearchParams({ skip: String(skip), take: String(take) });
      if (roleFilter) q.append("role", roleFilter);
      const d = await getUsers(q.toString(), token);
      const rows = d?.data || d?.items || d || [];
      setUsers(Array.isArray(rows) ? rows : []);
      setTotal(d?.total ?? (Array.isArray(rows) ? rows.length : 0));
    } catch (e: any) {
      setError(e?.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, [skip, roleFilter]);

  const filtered = useMemo(() => users.filter((u) => String(u.username || "").toLowerCase().includes(search.toLowerCase())), [users, search]);

  const openCreate = () => {
    setEditing(null);
    setForm({ username: "", password: "", role: "TENANT" });
    setCreating(true);
  };

  const openEdit = (u: any) => {
    setEditing(u);
    setForm({ username: u.username, password: "", role: u.role });
    setCreating(false);
  };

  const saveCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createUser(form, token);
      setCreating(false);
      setForm({ username: "", password: "", role: "TENANT" });
      await fetchUsers();
    } catch (e: any) {
      setError(e?.message || "Failed to create user");
    }
  };

  const saveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    try {
      const payload: any = {};
      if (form.password) payload.password = form.password;
      if (form.role !== editing.role) payload.role = form.role;
      await updateUser(editing.id, payload, token);
      setEditing(null);
      setForm({ username: "", password: "", role: "TENANT" });
      await fetchUsers();
    } catch (e: any) {
      setError(e?.message || "Failed to update user");
    }
  };

  const remove = async (id: number) => {
    if (!confirm("Delete this user?")) return;
    try {
      await deleteUser(id, token);
      await fetchUsers();
    } catch (e: any) {
      setError(e?.message || "Failed to delete user");
    }
  };

  return (
    <main className="space-y-6 p-6">
      <header className="flex items-center justify-between">
        <div><h1 className="text-2xl font-semibold">Manager Users</h1><p className="text-sm text-gray-500">Manage tenants and property manager accounts.</p></div>
        <button className="rounded bg-black px-4 py-2 text-sm text-white" onClick={openCreate}>Create User</button>
      </header>

      {error && <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}

      <section className="flex gap-3">
        <input className="flex-1 rounded border px-3 py-2 text-sm" placeholder="Search users..." value={search} onChange={(e) => setSearch(e.target.value)} />
        <select className="rounded border px-3 py-2 text-sm" value={roleFilter} onChange={(e) => { setRoleFilter(e.target.value as any); setSkip(0); }}>
          <option value="">All Roles</option><option value="TENANT">Tenant</option><option value="PROPERTY_MANAGER">Property Manager</option>
        </select>
      </section>

      <section className="rounded border">
        {loading ? <p className="p-4 text-sm text-gray-500">Loading users...</p> : (
          <table className="min-w-full text-sm"><thead><tr className="border-b"><th className="px-3 py-2 text-left">ID</th><th className="px-3 py-2 text-left">Username</th><th className="px-3 py-2 text-left">Role</th><th className="px-3 py-2 text-left">Last Login</th><th className="px-3 py-2 text-left">Actions</th></tr></thead><tbody>{filtered.map((u) => <tr key={u.id} className="border-b"><td className="px-3 py-2">{u.id}</td><td className="px-3 py-2">{u.username}</td><td className="px-3 py-2">{u.role}</td><td className="px-3 py-2">{u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleDateString() : "Never"}</td><td className="px-3 py-2"><button className="mr-2 rounded border px-2 py-1" onClick={() => openEdit(u)}>Edit</button><button className="rounded border px-2 py-1" onClick={() => remove(Number(u.id))}>Delete</button></td></tr>)}</tbody></table>
        )}
      </section>

      <section className="flex items-center justify-between text-sm">
        <button className="rounded border px-3 py-1 disabled:opacity-50" disabled={skip === 0} onClick={() => setSkip(Math.max(0, skip - take))}>Previous</button>
        <span>Showing {skip + 1} to {Math.min(skip + take, total)} of {total}</span>
        <button className="rounded border px-3 py-1 disabled:opacity-50" disabled={skip + take >= total} onClick={() => setSkip(skip + take)}>Next</button>
      </section>

      {(creating || editing) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <form onSubmit={creating ? saveCreate : saveEdit} className="w-full max-w-md rounded bg-white p-4 space-y-3">
            <h2 className="text-lg font-semibold">{creating ? "Create User" : "Edit User"}</h2>
            <input className="w-full rounded border px-3 py-2" value={form.username} onChange={(e) => setForm((p) => ({ ...p, username: e.target.value }))} placeholder="Username" disabled={!!editing} required />
            <input className="w-full rounded border px-3 py-2" type="password" value={form.password} onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))} placeholder={creating ? "Password" : "New Password (optional)"} minLength={8} required={creating} />
            <select className="w-full rounded border px-3 py-2" value={form.role} onChange={(e) => setForm((p) => ({ ...p, role: e.target.value as Role }))}><option value="TENANT">Tenant</option><option value="PROPERTY_MANAGER">Property Manager</option></select>
            <div className="flex gap-2"><button className="flex-1 rounded bg-black px-3 py-2 text-white" type="submit">{creating ? "Create" : "Update"}</button><button className="flex-1 rounded border px-3 py-2" type="button" onClick={() => { setCreating(false); setEditing(null); }}>Cancel</button></div>
          </form>
        </div>
      )}
    </main>
  );
}
