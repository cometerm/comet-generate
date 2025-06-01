"use client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function Features({ features }) {
  return (
    <div className="max-w-7xl mx-auto px-8 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((feature, index) => {
          const IconComponent = feature.icon;
          return (
            <Card key={index} className="bg-neutral-900 border-none">
              <CardHeader>
                <div className="mb-2 flex items-center">
                  <div className="bg-lime-500/10 rounded-md p-3">
                    <IconComponent size={28} className="text-lime-300" />
                  </div>
                </div>
                <CardTitle className="text-neutral-200">
                  {feature.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-neutral-400">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
