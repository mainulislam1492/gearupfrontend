export function SiteFooter() {
  return (
    <footer className="border-t py-8 text-center text-sm text-muted-foreground">
      &copy; {new Date().getFullYear()} GearUp. Rent gear, not hassle.
    </footer>
  );
}