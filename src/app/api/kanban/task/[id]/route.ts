import { NextResponse } from "next/server";
import db from "@/lib/client";

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const taskId = params.id;

    if (!taskId) {
      return NextResponse.json(
        { error: "Task ID is required" },
        { status: 400 }
      );
    }

    const existingTask = await db.task.findUnique({
      where: { id: taskId },
    });

    if (!existingTask) {
      return NextResponse.json(
        { error: "Task not found" },
        { status: 404 }
      );
    }

    const deleted = await db.task.delete({
      where: { id: taskId },
    });

    return NextResponse.json(
      { message: "Task deleted successfully", deletedTask: deleted },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting task:", error);

    return NextResponse.json(
      { error: "Failed to delete task" },
      { status: 500 }
    );
  }
}
