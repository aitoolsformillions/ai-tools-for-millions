import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "../auth/actions";
const blocks=[['Continue Learning','AI Foundations · 20% complete'],['My AI Stack','4 tools saved'],['Prompt Vault','12 prompts saved'],['Recommended','AI for Business learning path']];
export default async function Dashboard(){  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }
  const { data: profile } = await supabase
  .from("profiles")
  .select("display_name")
  .eq("id", user.id)
  .single();

const displayName =
  profile?.display_name ||
  user.user_metadata?.display_name ||
  user.email?.split("@")[0] ||
  "there";

  return <main className="container" style={{padding:'56px 0 90px'}}>
  
    <form
  action={signOut}
  style={{
    display: "flex",
    justifyContent: "flex-end",
    marginBottom: "24px",
  }}
>
  <button
    type="submit"
    style={{
      padding: "10px 18px",
      borderRadius: "10px",
      border: "1px solid rgba(255,255,255,0.25)",
      background: "rgba(255,255,255,0.08)",
      color: "white",
      cursor: "pointer",
      fontWeight: 600,
    }}
  >
    Sign Out
  </button>
</form><span style={{color:'var(--blue-2)',fontWeight:800,fontSize:12}}>YOUR AI WORKSPACE</span><h1 style={{fontSize:52,letterSpacing:'-.04em'}}>Good evening, {displayName} 👋</h1><p style={{color:'var(--muted)',fontSize:18}}>Pick up where you left off or discover your next advantage.</p><div className="grid" style={{gridTemplateColumns:'repeat(auto-fit,minmax(250px,1fr))',marginTop:32}}>{blocks.map(([h,p])=><section className="card" key={h} style={{padding:26,minHeight:180}}><h2>{h}</h2><p style={{color:'var(--muted)'}}>{p}</p><button className="btn btn-secondary" style={{marginTop:20}}>Open</button></section>)}</div></main>}
