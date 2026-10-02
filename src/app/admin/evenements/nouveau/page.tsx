import { EventForm } from "@/components/admin/event-form";
import { assertAdminPage } from "@/lib/admin";

export default async function NewEventPage() {
  await assertAdminPage();
  return (
    <div className="max-w-3xl">
      <h1 className="font-display text-5xl">Nouvel événement</h1>
      <p className="mt-2 mb-8 text-sm text-muted">Créez la galerie, puis importez les photos à l&apos;étape suivante.</p>
      <EventForm />
    </div>
  );
}
