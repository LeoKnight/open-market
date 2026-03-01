import { RunningCosts } from "@/types/motorcycle";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Calculator } from "lucide-react";

interface RunningCostsDisplayProps {
  runningCosts: RunningCosts | null;
}

export default function RunningCostsDisplay({ runningCosts }: RunningCostsDisplayProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Estimated Annual Costs</CardTitle>
      </CardHeader>
      <CardContent>
        {!runningCosts ? (
          <div className="text-center py-8 text-muted-foreground">
            <Calculator className="mx-auto h-12 w-12 mb-4 opacity-40" />
            <p className="text-sm">Calculate costs to see annual expenses</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-green-50 p-4 rounded-lg text-center">
              <p className="text-sm text-green-600 font-medium mb-1">Total Annual Running Cost</p>
              <p className="text-2xl font-bold text-green-700">S${runningCosts.total.toLocaleString()}</p>
            </div>

            <Separator />

            <div className="space-y-3">
              {Object.entries(runningCosts.breakdown).map(([key, item]) => (
                <div key={key} className="flex justify-between items-center p-3 bg-muted rounded-lg">
                  <p className="text-sm font-medium">{item.label}</p>
                  <p className="text-sm font-semibold">S${item.amount.toLocaleString()}</p>
                </div>
              ))}
            </div>

            <Alert className="bg-amber-50 border-amber-200 text-amber-700">
              <AlertDescription>
                <strong>Note:</strong> Annual costs are estimates and may vary based on usage, insurance provider, and maintenance needs.
              </AlertDescription>
            </Alert>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
