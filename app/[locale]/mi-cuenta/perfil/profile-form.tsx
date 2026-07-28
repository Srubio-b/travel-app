"use client";

import { useActionState, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { updateProfile } from "@/app/actions/auth";
import type { AuthResult } from "@/lib/auth/errors";
import { uploadAvatar } from "@/app/actions/auth";

const initialState = { success: false, error: "" } as AuthResult;

type Props = {
  defaultName: string;
  defaultPhone: string;
  avatarUrl: string | null;
};

export function ProfileForm({ defaultName, defaultPhone, avatarUrl }: Props) {
  const t = useTranslations("profile");
  const [state, action, pending] = useActionState(updateProfile, initialState);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(avatarUrl);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const [fileError, setFileError] = useState<string | null>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!["image/png", "image/jpeg", "image/webp", "image/gif"].includes(file.type)) {
      setFileError(t("avatarTypeError"));
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setFileError(t("avatarSizeError"));
      return;
    }

    setFileError(null);

    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  }

  const [avatarState, avatarAction, avatarPending] = useActionState(
    async (_prev: AuthResult | null, formData: FormData) => {
      if (!avatarFile) return { success: true } as AuthResult;
      formData.append("avatar", avatarFile);
      setAvatarFile(null);
      return uploadAvatar(_prev, formData);
    },
    initialState,
  );

  return (
    <div className="space-y-6">
      {/* Avatar upload */}
      <form action={avatarAction} className="space-y-3">
        <div>
          <label className="mb-1 block text-sm font-medium">
            {t("avatarLabel")}
          </label>

          {avatarPreview && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={avatarPreview}
              alt="Vista previa"
              className="mb-2 h-20 w-20 rounded-full object-cover"
            />
          )}

          <input
            ref={fileRef}
            name="avatar"
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            onChange={handleFileChange}
            className="block text-sm text-muted-foreground file:mr-2 file:rounded file:border-0 file:bg-primary-subtle file:px-3 file:py-1 file:text-sm file:font-medium file:text-primary"
          />
        </div>

        {avatarFile && (
          <button
            type="submit"
            disabled={avatarPending}
            className="rounded bg-primary px-4 py-1 text-sm text-white transition hover:bg-primary/90 disabled:opacity-50"
          >
            {avatarPending ? `${t("avatarChange")}…` : t("avatarChange")}
          </button>
        )}

        {fileError && (
          <p className="text-sm text-red-600" role="alert">{fileError}</p>
        )}

        {avatarState?.success === false && (
          <p className="text-sm text-red-600" role="alert">{avatarState.error}</p>
        )}
      </form>

      {/* Profile fields */}
      <form action={action} className="space-y-4">
        <div>
          <label
            htmlFor="full_name"
            className="mb-1 block text-sm font-medium"
          >
            {t("fullNameLabel")}
          </label>
          <input
            id="full_name"
            name="full_name"
            type="text"
            defaultValue={defaultName}
            required
            minLength={2}
            className="w-full rounded-lg border border-border px-4 py-2 focus:border-primary focus:outline-none"
          />
        </div>

        <div>
          <label htmlFor="phone" className="mb-1 block text-sm font-medium">
            {t("phoneLabel")}
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            defaultValue={defaultPhone}
            pattern="[\d\s+\-()]{7,20}"
            className="w-full rounded-lg border border-border px-4 py-2 focus:border-primary focus:outline-none"
          />
        </div>

        {state?.success === false && (
          <p className="text-sm text-red-600" role="alert">
            {state.field === "phone"
              ? t("phoneError")
              : state.error}
          </p>
        )}

        {state?.success && (
          <p className="text-sm text-green-600" role="status">
            {t("saved")}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-primary px-4 py-2 font-medium text-white transition hover:bg-primary/90 disabled:opacity-50"
        >
          {pending ? `${t("save")}…` : t("save")}
        </button>
      </form>
    </div>
  );
}
