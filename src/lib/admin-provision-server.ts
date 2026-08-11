import { createServerFn } from "@tanstack/react-start";

export interface ServerShop {
  id: string;
  name: string;
  email: string;
  contact?: string | null;
  gst?: string | null;
  address?: string | null;
  owner_id?: string | null;
  password?: string | null;
  created_at: string;
}

export const serverShopStore = new Map<string, ServerShop>();

// Seed default shop profile if store is empty
if (serverShopStore.size === 0) {
  serverShopStore.set("konandysh25@gmail.com", {
    id: "shop-aqua1-demo",
    name: "AQUA1",
    email: "konandysh25@gmail.com",
    contact: "8667881160",
    owner_id: "otp-user-" + btoa("konandysh25@gmail.com"),
    created_at: new Date().toISOString(),
  });
}

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

    const ADMIN_EMAIL = "aknandysh26@gmail.com";
    if (email !== ADMIN_EMAIL) {
      return { success: false, message: `Access restricted. ${email} is not authorized for admin access.` };
    }

    try {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

      // Check if user exists in auth.users
      let userId: string | null = null;
      const { data: usersData, error: listErr } = await supabaseAdmin.auth.admin.listUsers();
      if (!listErr && usersData?.users) {
        const existing = usersData.users.find((u) => u.email?.toLowerCase() === email);
        if (existing) {
          userId = existing.id;
        }
      }

      if (userId) {
        // Update password and confirm email
        await supabaseAdmin.auth.admin.updateUserById(userId, {
          password,
          email_confirm: true,
        });
      } else {
        // Create user with email confirmed
        const { data: newUserData, error: createErr } = await supabaseAdmin.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
          user_metadata: { shop_name: "STOCKERZ RO ADMIN" },
        });

        if (createErr) {
          console.warn("Admin user create notice:", createErr.message);
        } else if (newUserData?.user) {
          userId = newUserData.user.id;
        }
      }

      if (userId) {
        return { success: true, message: "Admin account provisioned successfully." };
      }

      // Fallback to RPC if admin client list/create did not yield user ID
      const { error: rpcErr } = await (supabaseAdmin.rpc as any)("setup_admin_credentials", {
        _email: email,
        _password: password,
      });

      if (!rpcErr) {
        return { success: true, message: "Admin account provisioned via RPC." };
      }

      return { success: false, message: "Could not provision admin account." };
    } catch (err: any) {
      console.error("provisionAdminServerFn error:", err);
      return { success: false, message: err?.message || "Provisioning error." };
    }
  });

export const getAdminMasterDataServerFn = createServerFn({ method: "GET" })
  .handler(async () => {
    try {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const [shops, sales, services, serviceItems, products, technicians, authLogs, authUsersRes] = await Promise.all([
        supabaseAdmin.from("shops").select("*").order("created_at", { ascending: false }),
        supabaseAdmin.from("sales").select("*").order("created_at", { ascending: false }),
        supabaseAdmin.from("services").select("*").order("created_at", { ascending: false }),
        supabaseAdmin.from("service_items").select("*"),
        supabaseAdmin.from("products").select("*").order("model", { ascending: true }),
        supabaseAdmin.from("technicians").select("*"),
        supabaseAdmin.from("auth_logs").select("*").order("created_at", { ascending: false }).limit(200),
        supabaseAdmin.auth.admin.listUsers().catch((e) => {
          console.warn("listUsers notice:", e);
          return { data: { users: [] }, error: null };
        }),
      ]);

      const dbShops = shops.data ?? [];
      const localShops = Array.from(serverShopStore.values());
      const authUsers = (authUsersRes as any)?.data?.users ?? [];

      const shopMap = new Map<string, any>();

      // 1. Load local server shops
      for (const s of localShops) {
        if (s.email) shopMap.set(s.email.toLowerCase(), { ...s });
      }

      // 2. Load Supabase database shops
      for (const s of dbShops) {
        if (s.email) {
          const cleanEmail = s.email.toLowerCase();
          shopMap.set(cleanEmail, { ...shopMap.get(cleanEmail), ...s });
        }
      }

      // 3. Merge/Backfill from Supabase Auth Users list (shows all registered users)
      for (const u of authUsers) {
        if (!u.email) continue;
        const cleanEmail = u.email.toLowerCase();
        const existing = shopMap.get(cleanEmail);
        const derivedShopName =
          u.user_metadata?.shop_name ||
          u.user_metadata?.name ||
          (existing?.name && existing.name !== "MY SHOP" ? existing.name : cleanEmail.split("@")[0].toUpperCase() + " SHOWROOM");

        const mergedShop = {
          id: existing?.id || "shop-" + u.id,
          name: derivedShopName,
          email: cleanEmail,
          contact: existing?.contact || u.phone || u.user_metadata?.phone || null,
          gst: existing?.gst || null,
          address: existing?.address || null,
          owner_id: u.id || existing?.owner_id || "owner-" + Date.now(),
          created_at: existing?.created_at || u.created_at || new Date().toISOString(),
          last_login_at: existing?.last_login_at || u.last_sign_in_at || u.created_at || new Date().toISOString(),
        };

        shopMap.set(cleanEmail, mergedShop);

        // Auto-persist to DB if missing from shops table
        if (!existing) {
          try {
            await supabaseAdmin.from("shops").upsert(
              {
                id: mergedShop.id,
                name: mergedShop.name,
                email: mergedShop.email,
                contact: mergedShop.contact,
                owner_id: mergedShop.owner_id,
                created_at: mergedShop.created_at,
                last_login_at: mergedShop.last_login_at,
              },
              { onConflict: "email" }
            );
          } catch (upsertErr) {
            console.warn("Auto-sync shop notice:", upsertErr);
          }
        }
      }

      const mergedShops = Array.from(shopMap.values());

      // 4. Combine DB auth logs + synthetic logs for existing users who joined before log table creation
      const dbLogs = authLogs.data ?? [];
      const logEmailSet = new Set(dbLogs.map((l: any) => l.email?.toLowerCase()));

      const syntheticLogs: any[] = [];
      for (const s of mergedShops) {
        if (s.email && !logEmailSet.has(s.email.toLowerCase())) {
          syntheticLogs.push({
            id: "synth-reg-" + s.id,
            email: s.email,
            shop_name: s.name,
            event_type: "registration",
            status: "success",
            created_at: s.created_at || new Date().toISOString(),
          });
          if (s.last_login_at && s.last_login_at !== s.created_at) {
            syntheticLogs.push({
              id: "synth-login-" + s.id,
              email: s.email,
              shop_name: s.name,
              event_type: "login_password",
              status: "success",
              created_at: s.last_login_at,
            });
          }
        }
      }

      const combinedLogs = [...dbLogs, ...syntheticLogs].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      return {
        success: true,
        shops: mergedShops,
        sales: sales.data ?? [],
        services: services.data ?? [],
        serviceItems: serviceItems.data ?? [],
        products: products.data ?? [],
        technicians: technicians.data ?? [],
        authLogs: combinedLogs,
      };
    } catch (err: any) {
      console.error("getAdminMasterDataServerFn error:", err);
      return {
        success: true,
        shops: Array.from(serverShopStore.values()),
        sales: [],
        services: [],
        serviceItems: [],
        products: [],
        technicians: [],
        authLogs: [],
      };
    }
  });

export const adminCreateShopServerFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => {
    const name = extractString(data, "name").trim();
    const email = extractString(data, "email").trim().toLowerCase();
    const password = extractString(data, "password") || "password123";
    const contact = extractString(data, "contact").trim();
    const gst = extractString(data, "gst").trim();
    const address = extractString(data, "address").trim();
    const logo_url = extractString(data, "logo_url").trim();
    return { name, email, password, contact, gst, address, logo_url };
  })
  .handler(async ({ data }) => {
    const { name, email, password, contact, gst, address, logo_url } = data;
    if (!name) return { success: false, message: "Shop name is required." };
    if (!email) return { success: false, message: "Shop email is required." };

    try {
      const shopId = "shop-" + Date.now();
      const newShop: ServerShop = {
        id: shopId,
        name,
        email,
        contact: contact || null,
        gst: gst || null,
        address: address || null,
        password: password || "password123",
        owner_id: "owner-" + Date.now(),
        created_at: new Date().toISOString(),
      };

      serverShopStore.set(email, newShop);

      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

      // Check if a shop with this email already exists
      const { data: existingShop } = await supabaseAdmin
        .from("shops")
        .select("id, name")
        .eq("email", email)
        .maybeSingle();

      if (existingShop) {
        return { success: false, message: `A shop (${existingShop.name}) already exists for ${email}. One email for one shop only.` };
      }

      await supabaseAdmin.from("shops").insert({
        id: newShop.id,
        name: newShop.name,
        email: newShop.email,
        contact: newShop.contact,
        gst: newShop.gst,
        address: newShop.address,
        logo_url: logo_url || null,
        owner_id: newShop.owner_id || "owner-" + Date.now(),
      });

      return { success: true, shop: newShop, message: `Shop "${name}" provisioned successfully.` };
    } catch (err: any) {
      console.error("adminCreateShopServerFn error:", err);
      return { success: false, message: err?.message || "Failed to create shop." };
    }
  });

export const adminDeleteShopServerFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => {
    const shopId = extractString(data, "shopId").trim();
    return { shopId };
  })
  .handler(async ({ data }) => {
    const { shopId } = data;
    if (!shopId) return { success: false, message: "Shop ID is required." };

    try {
      // Remove from serverShopStore
      for (const [email, shop] of serverShopStore.entries()) {
        if (shop.id === shopId) {
          serverShopStore.delete(email);
        }
      }

      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

      await Promise.all([
        supabaseAdmin.from("sales").delete().eq("shop_id", shopId),
        supabaseAdmin.from("services").delete().eq("shop_id", shopId),
        supabaseAdmin.from("products").delete().eq("shop_id", shopId),
        supabaseAdmin.from("technicians").delete().eq("shop_id", shopId),
        supabaseAdmin.from("emi_plans").delete().eq("shop_id", shopId),
      ]);

      const { error: shopDelErr } = await supabaseAdmin.from("shops").delete().eq("id", shopId);
      if (shopDelErr) console.warn("Shop delete DB notice:", shopDelErr);

      return { success: true, message: "Shop and related data deleted successfully." };
    } catch (err: any) {
      console.error("adminDeleteShopServerFn error:", err);
      return { success: false, message: err?.message || "Failed to delete shop." };
    }
  });

export const getShopByEmailServerFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => {
    const email = extractString(data, "email").trim().toLowerCase();
    return { email };
  })
  .handler(async ({ data }) => {
    const { email } = data;
    if (!email) return { success: false, shop: null };

    const local = serverShopStore.get(email);

    try {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { data: dbShop } = await supabaseAdmin
        .from("shops")
        .select("*")
        .eq("email", email)
        .maybeSingle();

      if (dbShop) {
        const merged = { ...local, ...dbShop };
        return { success: true, shop: merged };
      }
    } catch (err) {
      console.warn("getShopByEmailServerFn notice:", err);
    }

    return { success: !!local, shop: local || null };
  });

export const registerShopUserServerFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => {
    const email = extractString(data, "email").trim().toLowerCase();
    const password = extractString(data, "password");
    const shopName = extractString(data, "shopName").trim();
    const contact = extractString(data, "contact").trim();
    const gst = extractString(data, "gst").trim();
    const address = extractString(data, "address").trim();
    return { email, password, shopName, contact, gst, address };
  })
  .handler(async ({ data }) => {
    const { email, password, shopName, contact, gst, address } = data;
    if (!email) return { success: false, message: "Email is required." };

    const existing = serverShopStore.get(email);
    const targetShopName = shopName || existing?.name || "MY SHOP";
    const shopId = existing?.id || "shop-" + Date.now();
    const targetOwnerId = existing?.owner_id || "otp-user-" + btoa(email);

    const updatedShop: ServerShop = {
      id: shopId,
      name: targetShopName,
      email,
      contact: contact || existing?.contact || null,
      gst: gst || existing?.gst || null,
      address: address || existing?.address || null,
      password: password || existing?.password || null,
      owner_id: targetOwnerId,
      created_at: existing?.created_at || new Date().toISOString(),
    };

    serverShopStore.set(email, updatedShop);

    try {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

      // Save user to Supabase Auth if password provided
      if (password) {
        let userId: string | null = null;
        const { data: usersData } = await supabaseAdmin.auth.admin.listUsers();
        if (usersData?.users) {
          const u = usersData.users.find((x) => x.email?.toLowerCase() === email);
          if (u) userId = u.id;
        }

        if (userId) {
          await supabaseAdmin.auth.admin.updateUserById(userId, {
            password,
            email_confirm: true,
          });
        } else {
          await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: { shop_name: targetShopName },
          });
        }
      }

      // Save/Upsert shop to Supabase shops table
      await supabaseAdmin.from("shops").upsert(
        {
          id: updatedShop.id,
          name: updatedShop.name,
          email: updatedShop.email,
          contact: updatedShop.contact,
          gst: updatedShop.gst,
          address: updatedShop.address,
          owner_id: updatedShop.owner_id || "owner-" + Date.now(),
          last_login_at: new Date().toISOString(),
        },
        { onConflict: "email" }
      );

      // Log registration event to auth_logs
      await supabaseAdmin.from("auth_logs").insert({
        email,
        event_type: "registration",
        shop_name: targetShopName,
        status: "success",
        created_at: new Date().toISOString(),
      });
    } catch (err: any) {
      console.warn("registerShopUserServerFn Supabase notice:", err);
    }

    return { success: true, shop: updatedShop, message: "User credentials registered successfully." };
  });

export interface AuthLogPayload {
  email: string;
  eventType: "registration" | "login_password" | "login_otp" | "admin_login" | "password_reset" | "login_failed";
  shopName?: string | null;
  userId?: string | null;
  status?: "success" | "failed";
}

export const logAuthActivityServerFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => {
    const email = extractString(data, "email").trim().toLowerCase();
    const eventType = (extractString(data, "eventType") || "login_password") as AuthLogPayload["eventType"];
    const shopName = extractString(data, "shopName") || null;
    const userId = extractString(data, "userId") || null;
    const status = (extractString(data, "status") || "success") as "success" | "failed";
    return { email, eventType, shopName, userId, status };
  })
  .handler(async ({ data }) => {
    const { email, eventType, shopName, userId, status } = data;
    if (!email) return { success: false, message: "Email is required for logging." };

    try {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

      // 1. Insert into auth_logs table
      await supabaseAdmin.from("auth_logs").insert({
        email,
        event_type: eventType,
        shop_name: shopName,
        user_id: userId && !userId.startsWith("otp-") && !userId.startsWith("admin-") ? userId : null,
        status,
        created_at: new Date().toISOString(),
      });

      // 2. If login or registration successful, update last_login_at in shops table
      if (status === "success" && (eventType === "login_password" || eventType === "login_otp" || eventType === "registration")) {
        await supabaseAdmin
          .from("shops")
          .update({ last_login_at: new Date().toISOString() })
          .eq("email", email);
      }

      return { success: true };
    } catch (err: any) {
      console.warn("logAuthActivityServerFn notice:", err);
      return { success: false, message: err?.message };
    }
  });

