import { Card, CardContent, CardHeader } from "./card";

interface SubstitutionItemProps {
  data: string[];
}

export function SubstitutionItem({ data }: SubstitutionItemProps) {
  const [hour, time, classes, subject, room, teacher, info, substText] = data;

  return (
    <Card className="max-w-xl w-full">
      <CardHeader className="p-3 bg-gray-50 dark:bg-gray-800">
        <div className="flex justify-between items-center">
          <div>
            <span className="font-bold">{hour}</span>
            <span className="text-gray-500 ml-2 text-sm">{time}</span>
          </div>
          <div className="text-sm font-medium">{classes}</div>
        </div>
      </CardHeader>
      <CardContent className="p-3 space-y-1.5">
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
          <div>
            <span className="font-semibold">Fach: </span>
            <span>{subject}</span>
          </div>
          <div>
            <span className="font-semibold">Raum: </span>
            <span dangerouslySetInnerHTML={{ __html: room }} />
          </div>
          <div>
            <span className="font-semibold">Lehrkraft: </span>
            <span dangerouslySetInnerHTML={{ __html: teacher }} />
          </div>
          <div>
            <span className="font-semibold">Info: </span>
            <span dangerouslySetInnerHTML={{ __html: info || "-" }} />
          </div>
        </div>
        <div className="text-sm border-t pt-1.5 mt-1.5">
          <span className="font-semibold">Vertretungstext: </span>
          <span>{substText || "Kein Vertretungstext"}</span>
        </div>
      </CardContent>
    </Card>
  );
} 