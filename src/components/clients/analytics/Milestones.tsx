import { Check } from "lucide-react";
import { format } from "date-fns";

const Milestones = ({ milestones }: { milestones: any[] }) => {
    return (
        <div className="space-y-4 relative">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Milestones
            </h2>

            {/* Scrollable wrapper with inner shadow */}
            <div className="relative max-h-72 overflow-y-auto pr-2 no-scrollbar pb-10">

                {milestones.map((m) => (
                    <div
                        key={m.id}
                        className="
                            bg-white dark:bg-gray-800 
                            rounded-xl 
                            p-4 
                            shadow-sm 
                            border border-gray-200 dark:border-gray-600
                            mb-4
                        "
                    >
                        {/* Title + date + check */}
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

                {/* Bottom Inner Shadow */}
                <div className="pointer-events-none absolute inset-x-0 right-2 bottom-6 rounded-xl h-13 bg-gradient-to-t from-gray-100 dark:from-gray-800/60 to-transparent"></div>
            </div>
        </div>
    );
};

export default Milestones;