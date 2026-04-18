import { getSkills } from "../SKILLS"
import NotFound from "./not-found"

export default async function SkillsPage({
    params }: {
        params: { identifier: string }
    }) {

    const skills = await getSkills()
    const { identifier } = await params
    const skill = skills.find((skill) => skill.id === identifier)
    if (!skill) {
        return NotFound()
    }

    return <article className="max-w-md mx-auto p-4 flex flex-col gap-4">
        <h1>{skill?.name}</h1>
        <p>{skill?.description}</p>
        <p>{skill?.category}</p>
        <p>{skill?.updatedAt}</p>
        <p>{skill?.createdAt}</p>
    </article>

}