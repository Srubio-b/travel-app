import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { listClientTrips } from "@/lib/supabase/queries";

type Props = {
  params: Promise<{ locale: string }>;
};

function StatusBadge({
  status,
  t,
}: {
  status: "upcoming" | "completed" | "cancelled";
  t: (key: string) => string;
}) {
  const colors: Record<string, string> = {
    upcoming: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    completed:
      "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    cancelled: "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400",
  };

  return (
    <span
      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${colors[status]}`}
    >
      {t(`trips.status_${status}`)}
    </span>
  );
}

export default async function ViajesPage({ params }: Props) {
  const { locale } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect(`/${locale}/auth/login`);

  const trips = await listClientTrips(supabase, user.id);
  const t = await getTranslations();

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">{t("trips.title")}</h2>

      {trips.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <p className="text-muted-foreground mb-4">{t("trips.empty")}</p>
          <Link
            href={`/${locale}/paquetes`}
            className="inline-block rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background hover:opacity-90"
          >
            {t("trips.emptyCta")}
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {trips.map((trip) => (
            <article
              key={trip.id}
              className="rounded-lg border bg-card text-card-foreground shadow-sm"
            >
              <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-start">
                {trip.primaryImageUrl && (
                  <div className="shrink-0 overflow-hidden rounded-md sm:h-24 sm:w-36">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={trip.primaryImageUrl}
                      alt={trip.packageTitle}
                      className="h-32 w-full object-cover sm:h-full sm:w-36"
                    />
                  </div>
                )}

                <div className="min-w-0 flex-1 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-lg font-semibold leading-tight">
                      {trip.packageSlug ? (
                        <Link
                          href={`/${locale}/paquetes/${trip.packageSlug}`}
                          className="hover:underline"
                        >
                          {trip.packageTitle}
                        </Link>
                      ) : (
                        trip.packageTitle
                      )}
                    </h3>
                    <StatusBadge status={trip.status} t={t} />
                  </div>

                  <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-muted-foreground">
                    <span>
                      {trip.isNational ? t("trips.national") : t("trips.international")}
                    </span>
                    <span>
                      {t("trips.duration", { count: trip.durationDays })}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm">
                    <span>
                      <span className="text-muted-foreground">{t("trips.tripFrom")}: </span>
                      <time dateTime={trip.tripStart}>
                        {new Date(trip.tripStart + "T00:00:00").toLocaleDateString(
                          locale === "en" ? "en-US" : "es-AR",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          },
                        )}
                      </time>
                    </span>
                    {trip.tripEnd && (
                      <span>
                        <span className="text-muted-foreground">{t("trips.tripTo")}: </span>
                        <time dateTime={trip.tripEnd}>
                          {new Date(trip.tripEnd + "T00:00:00").toLocaleDateString(
                            locale === "en" ? "en-US" : "es-AR",
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            },
                          )}
                        </time>
                      </span>
                    )}
                  </div>

                  {trip.notes && (
                    <p className="text-sm text-muted-foreground italic">
                      {t("trips.notes")}: {trip.notes}
                    </p>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
