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
          console.warn("Create admin user note:", createErr);
        } else if (newUserData?.user) {
          userId = newUserData.user.id;
        }
      }

      if (userId) {
        // Grant admin role
        await supabaseAdmin.from("user_roles").upsert(
          { user_id: userId, role: "admin" },
          { onConflict: "user_id,role" }
        );

        // Create shop record
        await supabaseAdmin.from("shops").upsert(
          { owner_id: userId, name: "STOCKERZ RO ADMIN", email },
          { onConflict: "owner_id" }
        );

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
      const [shops, sales, services, serviceItems, products, technicians] = await Promise.all([
        supabaseAdmin.from("shops").select("*").order("created_at", { ascending: false }),
        supabaseAdmin.from("sales").select("*").order("created_at", { ascending: false }),
        supabaseAdmin.from("services").select("*").order("created_at", { ascending: false }),
        supabaseAdmin.from("service_items").select("*"),
        supabaseAdmin.from("products").select("*").order("model", { ascending: true }),
        supabaseAdmin.from("technicians").select("*"),
      ]);

      return {
        success: true,
        shops: shops.data ?? [],
        sales: sales.data ?? [],
        services: services.data ?? [],
        serviceItems: serviceItems.data ?? [],
        products: products.data ?? [],
        technicians: technicians.data ?? [],
      };
    } catch (err: any) {
      console.error("getAdminMasterDataServerFn error:", err);
      return {
        success: false,
        shops: [],
        sales: [],
        services: [],
        serviceItems: [],
        products: [],
        technicians: [],
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
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

      // Check if a shop with this email already exists (One email = One shop)
      const { data: existingShop } = await supabaseAdmin
        .from("shops")
        .select("id, name")
        .eq("email", email)
        .maybeSingle();

      if (existingShop) {
        return {
          success: false,
          message: `A shop named "${existingShop.name}" is already registered with email ${email}.`,
        };
      }

      // Check/Create user in auth.users
      let userId: string | null = null;
      const { data: usersData } = await supabaseAdmin.auth.admin.listUsers();
      if (usersData?.users) {
        const existingUser = usersData.users.find((u) => u.email?.toLowerCase() === email);
        if (existingUser) userId = existingUser.id;
      }

      if (!userId) {
        const { data: newUser, error: createErr } = await supabaseAdmin.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
          user_metadata: { shop_name: name },
        });
        if (createErr) {
          console.warn("Create user warning:", createErr);
        } else if (newUser?.user) {
          userId = newUser.user.id;
        }
      }

      const targetOwnerId = userId || "00000000-0000-0000-0000-000000000000";

      const { data: insertedShop, error: shopErr } = await supabaseAdmin
        .from("shops")
        .upsert(
          {
            name,
            email,
            owner_id: targetOwnerId,
            contact: contact || null,
            gst: gst || null,
            address: address || null,
            logo_url: logo_url || null,
          },
          { onConflict: "owner_id" }
        )
        .select("*")
        .single();

      if (shopErr) throw shopErr;

      return { success: true, message: `Shop "${name}" registered successfully.`, shop: insertedShop };
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
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

      // Delete child records first
      await Promise.allSettled([
        supabaseAdmin.from("sales").delete().eq("shop_id", shopId),
        supabaseAdmin.from("services").delete().eq("shop_id", shopId),
        supabaseAdmin.from("service_items").delete().eq("shop_id", shopId),
        supabaseAdmin.from("products").delete().eq("shop_id", shopId),
        supabaseAdmin.from("emi_plans").delete().eq("shop_id", shopId),
        supabaseAdmin.from("technicians").delete().eq("shop_id", shopId),
      ]);

      const { error: shopDelErr } = await supabaseAdmin.from("shops").delete().eq("id", shopId);
      if (shopDelErr) throw shopDelErr;

      return { success: true, message: "Shop and related data deleted successfully." };
    } catch (err: any) {
      console.error("adminDeleteShopServerFn error:", err);
      return { success: false, message: err?.message || "Failed to delete shop." };
    }
  });

