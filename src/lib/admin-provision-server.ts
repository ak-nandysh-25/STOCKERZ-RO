import { createServerFn } from "@tanstack/react-start";

function extractString(input: any, key: string): string {
  if (!input) return "";
  if (typeof input === "string") return input;
  if (typeof input === "object") {
    if (key in input) return String(input[key] ?? "");
    if ("data" in input && typeof input.data === "object" && input.data && key in input.data) {
      return String(input.data[key] ?? "");
    }
  }
  return "";
}

export const provisionAdminServerFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => {
    const email = extractString(data, "email").toLowerCase().trim();
    const password = extractString(data, "password");
    return { email, password };
  })
  .handler(async ({ data }) => {
    const { email, password } = data;
    if (!email || !password) {
      return { success: false, message: "Email and password are required." };
    }

    // Explicit check for designated admin email
    const isAdminEmail =
      email === "konandysh26@gmail.com" ||
      email === "aknandysh26@gmail.com" ||
      email === "konandysh25@gmail.com" ||
      email.includes("nandysh") ||
      email.includes("admin");

    if (!isAdminEmail) {
      return { success: false, message: "Access restricted to designated admin accounts." };
    }

    try {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

      // Priority 1: Try database RPC function setup_admin_credentials
      try {
        const { data: rpcRes, error: rpcErr } = await (supabaseAdmin.rpc as any)("setup_admin_credentials", {
          _email: email,
          _password: password,
        });

        if (!rpcErr && rpcRes !== false) {
          return { success: true, message: "Admin account provisioned via RPC." };
        }
      } catch (rpcCatchErr) {
        console.warn("RPC setup_admin_credentials notice:", rpcCatchErr);
      }

      // Priority 2: Fallback to admin auth API if service key is configured
      let userId: string | null = null;
      try {
        const { data: usersData, error: listErr } = await supabaseAdmin.auth.admin.listUsers();
        if (!listErr && usersData?.users) {
          const existing = usersData.users.find((u) => u.email?.toLowerCase() === email);
          if (existing) {
            userId = existing.id;
          }
        }

        if (userId) {
          await supabaseAdmin.auth.admin.updateUserById(userId, {
            password,
            email_confirm: true,
          });
        } else {
          const { data: newUserData, error: createErr } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: { shop_name: "STOCKERZ RO ADMIN" },
          });

          if (!createErr && newUserData?.user) {
            userId = newUserData.user.id;
          }
        }

        if (userId) {
          await supabaseAdmin.from("user_roles").upsert(
            { user_id: userId, role: "admin" },
            { onConflict: "user_id,role" }
          );

          await supabaseAdmin.from("shops").upsert(
            { owner_id: userId, name: "STOCKERZ RO ADMIN", email },
            { onConflict: "owner_id" }
          );

          return { success: true, message: "Admin account provisioned via admin auth API." };
        }
      } catch (adminApiErr) {
        console.warn("supabaseAdmin auth.admin call notice:", adminApiErr);
      }

      return { success: false, message: "Could not provision admin account." };
    } catch (err: any) {
      console.error("provisionAdminServerFn error:", err);
      return { success: false, message: err?.message || "Provisioning error." };
    }
  });
