import { Check } from "lucide-react";
import { format } from "date-fns";

const Milestones = ({ milestones }: { milestones: any[] }) => {
    return (
        <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Milestones
            </h2>

            {milestones.map((m) => (
                <div
                    key={m.id}
                    className="
            bg-white dark:bg-gray-800 
            rounded-xl 
            p-4 
            shadow-sm 
            border border-gray-200 dark:border-gray-600
          "
                >
                    {/* Title + date & check */}
                    <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                            {m.title}
                        </h3>

                        <div className="flex items-center gap-2">
                            <span className="bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300 px-3 py-1 rounded-full text-xs font-medium">
                                {format(new Date(m.createdAt), "dd/MM/yyyy")}
                            </span>
                            <Check className="w-4 h-4 text-green-500" />
                        </div>
                    </div>

                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 leading-relaxed">
                        {m.description}
                    </p>
                </div>
            ))}
        </div>
    );
};

export default Milestones;
