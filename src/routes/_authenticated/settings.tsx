import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button, Card, Field, Input, PageHeader, Textarea } from "@/components/ui-kit";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Upload, Loader2, Trash2, User, Store, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({ meta: [{ title: "Account & Shop Settings — STOCKERZ RO" }] }),
  component: Page,
});

function Page() {
  const qc = useQueryClient();

  // Query 1: Shop details
  const { data: shop } = useQuery({
    queryKey: ["shop"],
    queryFn: async () => (await supabase.from("shops").select("*").maybeSingle()).data,
  });

  // Query 2: User profile from Supabase profiles table
  const { data: profile } = useQuery({
    queryKey: ["user-profile"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      const { data } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
      return data ?? { id: user.id, email: user.email ?? "", full_name: user.user_metadata?.full_name ?? "", phone: user.user_metadata?.phone ?? "", shop_name: user.user_metadata?.shop_name ?? "", role: "user" };
    },
  });

  const [f, setF] = useState({ name: "", contact: "", email: "", gst: "", address: "", logo_url: "" });
  const [userProfileForm, setUserProfileForm] = useState({ full_name: "", phone: "", email: "" });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (shop) {
      setF({
        name: shop.name ?? "",
        contact: shop.contact ?? "",
        email: shop.email ?? "",
        gst: shop.gst ?? "",
        address: shop.address ?? "",
        logo_url: shop.logo_url ?? "",
      });
    }
  }, [shop]);

  useEffect(() => {
    if (profile) {
      setUserProfileForm({
        full_name: profile.full_name ?? "",
        phone: profile.phone ?? "",
        email: profile.email ?? "",
      });
    }
  }, [profile]);

  const saveShop = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const payload = {
        owner_id: user.id,
        name: f.name.toUpperCase(),
        contact: f.contact,
        email: f.email,
        gst: f.gst.toUpperCase(),
        address: f.address.toUpperCase(),
        logo_url: f.logo_url || null,
        updated_at: new Date().toISOString(),
      };

      if (shop?.id) {
        const { error } = await supabase.from("shops").update(payload).eq("id", shop.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("shops").upsert(payload, { onConflict: "owner_id" });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success("Shop profile updated");
      qc.invalidateQueries({ queryKey: ["shop"] });
    },
    onError: (e: any) => toast.error(e.message),
  });

  const saveUserProfile = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { error } = await supabase.from("profiles").upsert({
        id: user.id,
        email: userProfileForm.email || user.email || "",
        full_name: userProfileForm.full_name.trim(),
        phone: userProfileForm.phone.trim(),
        shop_name: f.name || "MY SHOP",
        updated_at: new Date().toISOString(),
      }, { onConflict: "id" });

      if (error) throw error;

      await supabase.auth.updateUser({
        data: {
          full_name: userProfileForm.full_name.trim(),
          phone: userProfileForm.phone.trim(),
        },
      });
    },
    onSuccess: () => {
      toast.success("User profile updated in Supabase");
      qc.invalidateQueries({ queryKey: ["user-profile"] });
    },
    onError: (e: any) => toast.error(e.message || "Failed to update user profile"),
  });

  async function uploadLogo(file: File) {
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be under 5MB");
      return;
    }

    setUploading(true);

    const convertToBase64 = () => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          setF((prev) => ({ ...prev, logo_url: reader.result as string }));
          toast.success("Logo uploaded successfully");
        }
        setUploading(false);
      };
      reader.onerror = () => {
        toast.error("Failed to read image file");
        setUploading(false);
      };
      reader.readAsDataURL(file);
    };

    try {
      const { data: { user } } = await supabase.auth.getUser();
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
      const path = `${user?.id ?? "shop"}/${Date.now()}-${sanitizedName}`;

      let { error } = await supabase.storage.from("shop-logos").upload(path, file, { upsert: true });

      if (error && (error.message.includes("Bucket not found") || (error as any).statusCode === "404")) {
        try {
          await supabase.storage.createBucket("shop-logos", { public: true });
          const retry = await supabase.storage.from("shop-logos").upload(path, file, { upsert: true });
          error = retry.error;
        } catch {
          // ignore bucket creation error and fallback
        }
      }

      if (error) {
        console.warn("Supabase storage notice:", error.message);
        convertToBase64();
        return;
      }

      const { data } = supabase.storage.from("shop-logos").getPublicUrl(path);
      if (data?.publicUrl) {
        setF((prev) => ({ ...prev, logo_url: data.publicUrl }));
        toast.success("Logo uploaded successfully");
      } else {
        convertToBase64();
      }
    } catch (err: any) {
      console.warn("Storage exception, using base64 fallback:", err);
      convertToBase64();
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Account & Shop Settings" description="Manage your user profile and showroom settings in Supabase" />

      {/* SECTION 1: USER PROFILE DETAILS */}
      <Card>
        <div className="mb-4 flex items-center gap-2 border-b border-glass-border pb-3">
          <User className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-bold text-foreground">User Profile Details</h2>
          <span className="ml-auto flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-400 border border-emerald-500/20">
            <ShieldCheck className="h-3.5 w-3.5" /> Supabase Authenticated
          </span>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            saveUserProfile.mutate();
          }}
          className="grid grid-cols-1 gap-4 md:grid-cols-2"
        >
          <Field label="Full Name / Owner Name">
            <Input
              value={userProfileForm.full_name}
              onChange={(e) => setUserProfileForm({ ...userProfileForm, full_name: e.target.value })}
              placeholder="e.g. Anand Kumar"
            />
          </Field>

          <Field label="Phone Number">
            <Input
              maxLength={10}
              value={userProfileForm.phone}
              onChange={(e) => setUserProfileForm({ ...userProfileForm, phone: e.target.value.replace(/\D/g, "").slice(0, 10) })}
              placeholder="10-digit mobile number"
              className="font-mono tracking-wider"
            />
          </Field>

          <Field label="Account Email (Supabase Auth)">
            <Input
              type="email"
              disabled
              value={userProfileForm.email}
              className="opacity-75 cursor-not-allowed"
            />
          </Field>

          <Field label="Role">
            <Input
              disabled
              value={profile?.role ? profile.role.toUpperCase() : "USER"}
              className="opacity-75 cursor-not-allowed font-semibold text-primary"
            />
          </Field>

          <div className="md:col-span-2 flex justify-end">
            <Button disabled={saveUserProfile.isPending}>
              {saveUserProfile.isPending ? "Updating User Profile..." : "Save User Profile"}
            </Button>
          </div>
        </form>
      </Card>

      {/* SECTION 2: SHOP PROFILE & INVOICE DETAILS */}
      <Card>
        <div className="mb-4 flex items-center gap-2 border-b border-glass-border pb-3">
          <Store className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-bold text-foreground">Showroom Profile & Invoice Branding</h2>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            saveShop.mutate();
          }}
          className="grid grid-cols-1 gap-4 md:grid-cols-2"
        >
          <div className="md:col-span-2 flex flex-wrap items-center gap-4 border-b border-glass-border pb-4">
            {f.logo_url ? (
              <div className="relative group">
                <img
                  src={f.logo_url}
                  alt="Shop logo preview"
                  className="h-20 w-20 rounded-xl border border-glass-border object-cover bg-black/20 shadow-inner"
                />
                <button
                  type="button"
                  onClick={() => setF((prev) => ({ ...prev, logo_url: "" }))}
                  className="absolute -top-2 -right-2 grid h-6 w-6 place-items-center rounded-full bg-destructive text-destructive-foreground shadow-md transition hover:scale-110"
                  title="Remove logo"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <div className="grid h-20 w-20 place-items-center rounded-xl border border-dashed border-white/20 bg-white/5 text-muted-foreground">
                <Upload className="h-6 w-6" />
              </div>
            )}

            <div className="space-y-1.5">
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl glass px-4 py-2 text-sm font-semibold text-foreground transition hover:bg-white/10 active:scale-95">
                {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4 text-primary" />}
                <span>{uploading ? "Uploading..." : "Upload Showroom Logo"}</span>
                <input
                  type="file"
                  accept="image/*"
                  disabled={uploading}
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && uploadLogo(e.target.files[0])}
                />
              </label>
              <p className="text-[11px] text-muted-foreground">
                PNG, JPG, WebP, or SVG (Max 5MB). Displays at the top of printed GST invoices.
              </p>
            </div>
          </div>

          <Field label="Business name">
            <Input
              required
              value={f.name}
              onChange={(e) => setF({ ...f, name: e.target.value })}
              className="uppercase-data"
              placeholder="e.g. AQUA PURE RO SALES & SERVICE"
            />
          </Field>
          <Field label="Contact number">
            <Input
              maxLength={10}
              value={f.contact}
              onChange={(e) => setF({ ...f, contact: e.target.value.replace(/\D/g, "").slice(0, 10) })}
              placeholder="10-digit mobile number"
              className="font-mono tracking-wider"
            />
          </Field>
          <Field label="Email">
            <Input
              type="email"
              value={f.email}
              onChange={(e) => setF({ ...f, email: e.target.value })}
              placeholder="shop@domain.com"
            />
          </Field>
          <Field label="GST number (optional)">
            <Input
              value={f.gst}
              onChange={(e) => setF({ ...f, gst: e.target.value })}
              className="uppercase-data"
              placeholder="33AAAAA0000A1Z5"
            />
          </Field>
          <div className="md:col-span-2">
            <Field label="Showroom Address">
              <Textarea
                rows={3}
                value={f.address}
                onChange={(e) => setF({ ...f, address: e.target.value })}
                className="uppercase-data"
                placeholder="Full address for invoice header"
              />
            </Field>
          </div>
          <div className="md:col-span-2 flex justify-end">
            <Button disabled={saveShop.isPending || uploading}>
              {saveShop.isPending ? "Saving Profile..." : "Save Shop Profile"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
