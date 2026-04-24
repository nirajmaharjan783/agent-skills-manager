"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { updateSkill } from "@/action/skills";

interface PageProps {
    params: { id: string };
}

export default function EditSkillPage({ params }: PageProps) {
    const router = useRouter();
    const { user, isAuthenticated, isLoading } = useAuth();

    // ✅ FIX: no state needed for id
    const skillId = parseInt(params.id);

    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [content, setContent] = useState("");
    const [isPublic, setIsPublic] = useState(true);
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [loadingSkill, setLoadingSkill] = useState(true);

    // Redirect if not authenticated
    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push("/login");
        }
    }, [isLoading, isAuthenticated, router]);

    // Fetch skill data
    useEffect(() => {
        if (isNaN(skillId) || !user) return;

        const fetchSkill = async () => {
            try {
                const response = await fetch(`/api/skills/${skillId}`, {
                    credentials: "include",
                });

                if (response.ok) {
                    const data = await response.json();

                    if (data.skill) {
                        setName(data.skill.name);
                        setDescription(data.skill.description);
                        setContent(data.skill.content);
                        setIsPublic(data.skill.isPublic);
                    } else {
                        setError("Skill not found");
                    }
                } else if (response.status === 403) {
                    setError("You don't have permission to edit this skill");
                } else if (response.status === 404) {
                    setError("Skill not found");
                }
            } catch (err) {
                setError("Failed to load skill");
            } finally {
                setLoadingSkill(false);
            }
        };

        fetchSkill();
    }, [skillId, user]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!name.trim() || !description.trim() || !content.trim()) {
            setError("All fields are required");
            return;
        }

        if (isNaN(skillId) || !user) return;

        setIsSubmitting(true);

        try {
            const result = await updateSkill(
                skillId,
                {
                    name: name.trim(),
                    description: description.trim(),
                    content: content.trim(),
                    isPublic,
                },
                user.id
            );

            if (result.success) {
                router.push("/dashboard");
            } else {
                setError(result.error || "Failed to update skill");
            }
        } catch (error) {
            console.error("Update error:", error);
            setError("Something went wrong");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading || loadingSkill) {
        return (
            <div className="flex justify-center items-center min-h-[50vh]">
                <span className="loading loading-spinner loading-lg"></span>
            </div>
        );
    }

    if (error && !name) {
        return (
            <div className="container mx-auto px-4 py-8 max-w-2xl">
                <div className="alert alert-error">
                    <span>{error}</span>
                </div>
                <Link href="/dashboard" className="btn btn-ghost mt-4">
                    ← Back to Dashboard
                </Link>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-2xl">
            <div className="mb-6">
                <Link href="/dashboard" className="btn btn-ghost btn-sm gap-2">
                    ← Back to Dashboard
                </Link>
            </div>

            <div className="card bg-base-200 shadow-xl">
                <div className="card-body">
                    <h1 className="card-title text-2xl">Edit Skill</h1>
                    <p className="text-base-content/70">
                        Update your agent skill content
                    </p>

                    <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                        {error && (
                            <div className="alert alert-error">
                                <span>{error}</span>
                            </div>
                        )}

                        <input
                            className="input input-bordered w-full"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Skill Name"
                            required
                        />

                        <input
                            className="input input-bordered w-full"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Description"
                            required
                        />

                        <textarea
                            className="textarea textarea-bordered w-full h-64"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="Content"
                            required
                        />

                        <label className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={isPublic}
                                onChange={(e) => setIsPublic(e.target.checked)}
                            />
                            Make Public
                        </label>

                        <div className="flex justify-end gap-3 pt-4">
                            <Link href="/dashboard" className="btn btn-ghost">
                                Cancel
                            </Link>

                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? "Saving..." : "Save Changes"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}