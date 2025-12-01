import db from "@/lib/client";

export async function POST(req: Request) {
    try {
        const { clientId, projectId, title, description } = await req.json();

        if (!clientId || !projectId || !title || !description) {
            return Response.json({ error: "Missing fields" }, { status: 400 });
        }

        // Check if user exists
        const client = await db.user.findUnique({ where: { id: clientId } });

        if (!client) {
            return Response.json(
                { error: "Client not found (invalid clientId)" },
                { status: 404 }
            );
        }

        // Check if project exists
        const project = await db.project.findUnique({ where: { id: projectId } });

        if (!project) {
            return Response.json(
                { error: "project not found (invalid project)" },
                { status: 404 }
            );
        }

        const feature = await db.featureRequest.create({
            data: {
                clientId,
                projectId,
                title,
                description
            }
        });

        return Response.json(
            { message: "Feature request submitted", feature },
            { status: 200 }
        );
    } catch (err) {
        return Response.json({ error: err }, { status: 500 });
    }
}

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const projectId = searchParams.get("projectId");

        if (!projectId) {
            return Response.json({ error: "projectId is required" }, { status: 400 });
        }
        // Check if project exists
        const project = await db.project.findUnique({ where: { id: projectId } });

        if (!project) {
            return Response.json(
                { error: "project not found (invalid project)" },
                { status: 404 }
            );
        }
        const list = await db.featureRequest.findMany({
            where: { projectId },
            orderBy: { createdAt: "desc" }
        });

        return Response.json({ features: list }, { status: 200 });
    } catch (err) {
        return Response.json({ error: err }, { status: 500 });
    }
}


export async function DELETE() {
  await db.featureRequest.deleteMany();
  return Response.json({ message: "All feature requests deleted" });
}
