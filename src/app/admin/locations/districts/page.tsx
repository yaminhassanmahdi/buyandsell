
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin } from "lucide-react";
import { DISTRICTS_BD, DIVISIONS_BD } from "@/lib/constants";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function AdminDistrictsPage() {
  const getDivisionName = (divisionId: string) => {
    return DIVISIONS_BD.find(d => d.id === divisionId)?.name || 'Unknown Division';
  };

  return (
    <div className="space-y-8 py-4">
      <h1 className="text-3xl font-bold flex items-center gap-3">
        <MapPin className="h-8 w-8 text-primary"/>
        Manage Districts (Bangladesh)
      </h1>
      <Card>
        <CardHeader>
          <CardTitle>Administrative Districts</CardTitle>
          <CardDescription>
            Below is a list of districts in Bangladesh configured in the system. These are currently static.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {DISTRICTS_BD.length > 0 ? (
            <ScrollArea className="h-[500px] rounded-md border p-4">
              <ul className="space-y-2">
                {DISTRICTS_BD.map(district => (
                  <li key={district.id} className="p-3 border rounded-md hover:bg-muted/50">
                    <div className="font-medium text-md">{district.name}</div>
                    <div className="text-xs text-muted-foreground">
                      ID: {district.id} | Division: {getDivisionName(district.divisionId)} (ID: {district.divisionId})
                    </div>
                  </li>
                ))}
              </ul>
            </ScrollArea>
          ) : (
            <p className="text-muted-foreground">No districts found in the system.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
