
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Home } from "lucide-react"; // Using Home icon as Building is not available
import { THANAS_BD, DISTRICTS_BD } from "@/lib/constants";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function AdminThanasPage() {
  const getDistrictName = (districtId: string) => {
    return DISTRICTS_BD.find(d => d.id === districtId)?.name || 'Unknown District';
  };

  return (
    <div className="space-y-8 py-4">
      <h1 className="text-3xl font-bold flex items-center gap-3">
        <Home className="h-8 w-8 text-primary"/>
        Manage Thanas/Upazillas (Bangladesh)
      </h1>
      <Card>
        <CardHeader>
          <CardTitle>Administrative Thanas/Upazillas</CardTitle>
          <CardDescription>
            Below is a list of thanas/upazillas in Bangladesh configured in the system. These are currently static.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {THANAS_BD.length > 0 ? (
            <ScrollArea className="h-[500px] rounded-md border p-4">
              <ul className="space-y-2">
                {THANAS_BD.map(thana => (
                  <li key={thana.id} className="p-3 border rounded-md hover:bg-muted/50">
                     <div className="font-medium text-md">{thana.name}</div>
                    <div className="text-xs text-muted-foreground">
                       ID: {thana.id} | District: {getDistrictName(thana.districtId)} (ID: {thana.districtId})
                    </div>
                  </li>
                ))}
              </ul>
            </ScrollArea>
          ) : (
            <p className="text-muted-foreground">No thanas/upazillas found in the system.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
