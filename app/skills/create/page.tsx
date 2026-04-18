//app/skills/create/page.tsx
"use client"

import { createSkill } from "@/app/action/skills"
import { useActionState } from "react"

const initialState = {
    message: ""
}

export default function NewSkillPage() {
    const [state, formAction, isPending] = useActionState(createSkill, initialState)

    return (
        <form action={formAction} className="p-4 max-w-md mx-auto form flex flex-col gap-4">
            <input placeholder="SKill name" name="name" className="input input-bordered w-full" />
            <textarea placeholder="Skill description" name="description" rows={3} className="input input-bordered w-full"></textarea>
            <input placeholder="Skill category" name="category" className="input input-bordered w-full" />

            <p aria-live="polite" className="text-red-500">{state?.message}</p>

            <button className="btn btn-primary" disabled={isPending}>
                {isPending ? "Creating..." : "Create Skill"}
            </button>
        </form>
    )
} 