import { CostResults } from "@/types/motorcycle";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { DollarSign } from "lucide-react";

interface PurchaseCostDisplayProps {
  results: CostResults | null;
}

export default function PurchaseCostDisplay({ results }: PurchaseCostDisplayProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Purchase Cost Breakdown</CardTitle>
      </CardHeader>
      <CardContent>
        {!results ? (
          <div className="text-center py-8 text-muted-foreground">
            <DollarSign className="mx-auto h-12 w-12 mb-4 opacity-40" />
            <p className="text-sm">Enter motorcycle details to see cost breakdown</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-primary/5 p-4 rounded-lg text-center">
              <p className="text-sm text-primary font-medium mb-1">Total Purchase Cost</p>
              <p className="text-3xl font-bold text-primary">S${results.totalCost.toLocaleString()}</p>
            </div>

            <Separator />

            <div className="space-y-3">
              {Object.entries(results.breakdown).map(([key, item]) => (
                <div key={key} className="flex justify-between items-center p-3 bg-muted rounded-lg">
                  <div>
                    <p className="text-sm font-medium">{item.label}</p>
                    {"note" in item && <p className="text-xs text-muted-foreground">{item.note}</p>}
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">S${item.amount.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">{item.percentage.toFixed(1)}%</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
