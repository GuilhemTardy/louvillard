import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { site } from "@/content/site";
import NotFoundContent from "./(site)/not-found";

export default function NotFound() {
  return (
    <>
      <SiteHeader name={site.name} />
      <main className="flex-1">
        <NotFoundContent />
      </main>
      <SiteFooter />
    </>
  );
}
