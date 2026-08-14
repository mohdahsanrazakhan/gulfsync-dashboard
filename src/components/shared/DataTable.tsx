import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

/**
 * Thin, reusable table shell: sticky header, off-white rows, hover highlight.
 * Consumers render their own <TableRow>/<TableCell> children.
 */
export function DataTable({
  headers,
  children,
  className,
}: {
  headers: string[];
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("relative w-full overflow-auto rounded-2xl border border-border/60", className)}>
      <Table>
        <TableHeader className="sticky top-0 z-10 bg-muted">
          <TableRow className="bg-transparent hover:bg-transparent">
            {headers.map((h) => (
              <TableHead key={h} className="whitespace-nowrap font-semibold">
                {h}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>{children}</TableBody>
      </Table>
    </div>
  );
}
