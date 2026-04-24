import { NextResponse, NextRequest } from "next/server";
import { verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface RouteParams {
    params: { id: string }
}

export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = params
        const skillId = parseInt(id) // "11" -> 11

        if (isNaN(skillId)) { //abc invalid, 123-> valid
            return NextResponse.json({ error: "Invalid skill Id" }, { status: 400 })
        }
        //Browser send cookies auto,extracting token, ?.-> get token string
        const token = request.cookies.get("auth_token")?.value

        if (!token) { //user is not logged in
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const payload = verifyToken(token)
        if (!payload) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const skill = await prisma.skill.findUnique({
            where: { id: skillId },
            select: {
                id: true,
                name: true,
                description: true,
                content: true,
                isPublic: true,
                authorId: true,
                createdAt: true,
                updatedAt: true
            }
        })
        if (!skill) { //wrong id, delete skill
            return NextResponse.json({ error: "Skill not found" }, { status: 404 })
        }

        //check ownership
        if (skill.authorId !== payload.userId) {
            return NextResponse.json({ error: "Not authorized to edit this skill" }, { status: 403 })
        }

        return NextResponse.json({ skill })

        //DB error, server error
    } catch (error) {
        console.error("Get skill error:", error)
    }
    //Generic fallback error
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
}