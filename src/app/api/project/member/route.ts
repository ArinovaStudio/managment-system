import db from "@/lib/client";

//get member of a project
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url)
        const projectId = searchParams.get("projectId");

        if (!projectId) {
            return Response.json(
                { success: false, message: "projectId required" },
                { status: 400 }
            );
        }

        const members = await db.projectMember.findMany({
            where: { projectId },
            include: {
                user: {
                    select: { id: true, name: true, email: true, image: true }
                }
            }
        });

        return Response.json({ success: true, members });

    } catch (error) {
        console.error(error);
        return Response.json(
            { success: false, message: "Failed to fetch teammates", error },
            { status: 500 }
        );
    }
}

//set role + leader to a member
export async function POST(req: Request) {
    try {
        const { projectId, userId, role, isLeader } = await req.json();

        if (!projectId || !userId) {
            return Response.json(
                { success: false, message: "projectId and userId are required" },
                { status: 400 }
            );
        }

        //  Find member using both IDs
        const existingMember = await db.projectMember.findFirst({
            where: {
                projectId,
                userId,
            },
        });

        if (!existingMember) {
            return Response.json(
                { success: false, message: "Member not found for this project" },
                { status: 404 }
            );
        }

        //  If Leader is updated to true → Set all others to false
        if (isLeader === true) {
            await db.projectMember.updateMany({
                where: { projectId },
                data: { isLeader: false },
            });
        }

        //  Update the member
        const updatedMember = await db.projectMember.update({
            where: { id: existingMember.id },
            data: {
                role,
                isLeader,
            },
        });

        return Response.json({
            success: true,
            message: "Member updated successfully",
            member: updatedMember,
        });

    } catch (error) {
        console.error(error);
        return Response.json(
            { success: false, message: "Failed to update member", error },
            { status: 500 }
        );
    }
}
