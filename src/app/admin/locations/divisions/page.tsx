
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Library } from "lucide-react"; // Using Library icon as a stand-in for map/region
import { DIVISIONS_BD } from "@/lib/constants";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function AdminDivisionsPage() {
  return (
    <div className="space-y-8 py-4">
      <h1 className="text-3xl font-bold flex items-center gap-3">
        <Library className="h-8 w-8 text-primary"/>
        Manage Divisions (Bangladesh)
      </h1>
      <Card>
        <CardHeader>
          <CardTitle>Administrative Divisions</CardTitle>
          <CardDescription>
            Below is a list of divisions in Bangladesh configured in the system. These are currently static.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {DIVISIONS_BD.length > 0 ? (
            <ScrollArea className="h-[400px] rounded-md border p-4">
              <ul className="space-y-2">
                {DIVISIONS_BD.map(division => (
                  <li key={division.id} className="p-2 border-b last:border-b-0">
                    <span className="font-medium">{division.name}</span>
                    <span className="text-xs text-muted-foreground ml-2">(ID: {division.id})</span>
                  </li>
                ))}
              </ul>
            </ScrollArea>
          ) : (
            <p className="text-muted-foreground">No divisions found in the system.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
