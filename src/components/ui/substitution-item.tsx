import { Card, CardContent, CardHeader } from "./card";
import { Badge } from "./badge";
import { cn } from "@/lib/utils";
import { Skeleton } from "./skeleton";

interface SubstitutionItemProps {
  data: string[];
  isLoading?: boolean;
}

export function SubstitutionItem({ data, isLoading }: SubstitutionItemProps) {
  if (isLoading) {
    return (
      <Card className="max-w-xl w-full">
        <CardHeader className="p-3 bg-secondary">
          <div className="flex justify-between items-center">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-5 w-16" />
          </div>
        </CardHeader>
        <CardContent className="p-3 space-y-2">
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-full" />
          </div>
          <Skeleton className="h-5 w-full mt-4" />
        </CardContent>
      </Card>
    );
  }

  const [hour, time, classes, subject, room, teacher, info, substText] = data;
  const isEntfall = info?.toLowerCase().includes("entfall");

  return (
    <Card className={cn(
      "max-w-xl w-full transition-all duration-200",
      isEntfall && "order-first border-destructive"
    )}>
      <CardHeader className="p-3 bg-secondary">
        <div className="flex justify-between items-center">
          <div>
            <span className="text-lg font-bold tracking-tight">{hour}</span>
            <span className="text-muted-foreground ml-2">{time}</span>
          </div>
          <div className="text-base font-medium">{classes}</div>
        </div>
      </CardHeader>
      <CardContent className="p-3 space-y-2">
        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
          <div>
            <span className="font-semibold text-base">Fach: </span>
            <span className="text-base">{subject}</span>
          </div>
          <div>
            <span className="font-semibold text-base">Raum: </span>
            <span className="text-base" dangerouslySetInnerHTML={{ __html: room }} />
          </div>
          <div>
            <span className="font-semibold text-base">Lehrkraft: </span>
            <span className="text-base" dangerouslySetInnerHTML={{ __html: teacher }} />
          </div>
          <div>
            <span className="font-semibold text-base">Info: </span>
            {info ? (
              <Badge variant={isEntfall ? "destructive" : "secondary"} className="ml-1">
                <span dangerouslySetInnerHTML={{ __html: info }} />
              </Badge>
            ) : (
              "-"
            )}
          </div>
        </div>
        {substText && (
          <div className="text-base border-t border-border pt-2 mt-2">
            <span className="font-semibold">Vertretungstext: </span>
            <span>{substText}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 