import { forwardRef } from 'react';
import type { ResumeData } from '../types';

interface Props {
    data: ResumeData;
}

export const ResumePreview = forwardRef<HTMLDivElement, Props>(({ data }, ref) => {
    return (
        <div
            className="bg-white p-0 shadow-2xl mx-auto overflow-hidden"
            style={{ width: '210mm', minHeight: '297mm', backgroundColor: '#ffffff' }}
        >
            <div
                ref={ref}
                className="p-[15mm]"
                style={{
                    fontFamily: '"Times New Roman", Times, serif',
                    lineHeight: '1.4',
                    color: '#000000',
                    backgroundColor: '#ffffff'
                }}
            >
                {/* Header */}
                <header className="text-center mb-6" style={{ color: '#000000' }}>
                    <h1 className="text-4xl font-bold mb-2" style={{ color: '#000000' }}>{data.personalInfo.fullName}</h1>
                    <div className="text-sm space-y-1">
                        <p>{data.personalInfo.location}</p>
                        <p>
                            {data.personalInfo.phone} — {data.personalInfo.email}
                        </p>
                        <p>
                            <a href={data.personalInfo.linkedin} className="no-underline" style={{ color: '#000000' }}>{data.personalInfo.linkedin}</a> —
                            <a href={data.personalInfo.github} className="no-underline ml-1" style={{ color: '#000000' }}>{data.personalInfo.github}</a>
                        </p>
                    </div>
                </header>

                {/* Summary */}
                <section className="mb-5">
                    <h2 className="text-lg font-bold uppercase mb-2 tracking-tight" style={{ borderBottom: '1px solid #000000', color: '#000000' }}>Professional Summary</h2>
                    <p className="text-sm text-justify" style={{ color: '#000000' }}>{data.summary}</p>
                </section>

                {/* Skills */}
                <section className="mb-5">
                    <h2 className="text-lg font-bold uppercase mb-2 tracking-tight" style={{ borderBottom: '1px solid #000000', color: '#000000' }}>Technical Skills</h2>
                    <ul className="text-sm space-y-1" style={{ color: '#000000' }}>
                        {data.skills.map((skill, i) => (
                            <li key={i} className="flex gap-2">
                                <span className="font-bold shrink-0">• {skill.category}:</span>
                                <span>{skill.items}</span>
                            </li>
                        ))}
                    </ul>
                </section>

                {/* Experience */}
                <section className="mb-5">
                    <h2 className="text-lg font-bold uppercase mb-2 tracking-tight" style={{ borderBottom: '1px solid #000000', color: '#000000' }}>Work Experience</h2>
                    <div className="space-y-4">
                        {data.experience.map((exp, i) => (
                            <div key={i} style={{ color: '#000000' }}>
                                <div className="flex justify-between font-bold text-sm">
                                    <span>{exp.role}</span>
                                    <span>{exp.period}</span>
                                </div>
                                <div className="italic text-sm mb-1">{exp.company}, {exp.location}</div>
                                <ul className="text-sm space-y-0.5 ml-4 list-disc">
                                    {exp.description.map((desc, j) => (
                                        <li key={j}>{desc}</li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Projects */}
                <section className="mb-5">
                    <h2 className="text-lg font-bold uppercase mb-2 tracking-tight" style={{ borderBottom: '1px solid #000000', color: '#000000' }}>Projects</h2>
                    <div className="space-y-4">
                        {data.projects.map((project, i) => (
                            <div key={i} style={{ color: '#000000' }}>
                                <div className="font-bold text-sm">{project.title}</div>
                                <div className="italic text-sm mb-1">{project.techStack}</div>
                                <ul className="text-sm space-y-0.5 ml-4 list-disc">
                                    {project.description.map((desc, j) => (
                                        <li key={j}>{desc}</li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Education */}
                <section className="mb-5">
                    <h2 className="text-lg font-bold uppercase mb-2 tracking-tight" style={{ borderBottom: '1px solid #000000', color: '#000000' }}>Education</h2>
                    {data.education.map((edu, i) => (
                        <div key={i} className="mb-2" style={{ color: '#000000' }}>
                            <div className="flex justify-between font-bold text-sm">
                                <span>{edu.degree}</span>
                                <span>{edu.period}</span>
                            </div>
                            <div className="text-sm italic">{edu.institution}, {edu.location}</div>
                        </div>
                    ))}
                </section>

                {/* Achievements */}
                {data.achievements.length > 0 && (
                    <section className="mb-5">
                        <h2 className="text-lg font-bold uppercase mb-2 tracking-tight" style={{ borderBottom: '1px solid #000000', color: '#000000' }}>Achievements</h2>
                        <ul className="text-sm space-y-0.5 ml-4 list-disc" style={{ color: '#000000' }}>
                            {data.achievements.map((ach, i) => (
                                <li key={i}>{ach}</li>
                            ))}
                        </ul>
                    </section>
                )}
            </div>
        </div>
    );
});

ResumePreview.displayName = 'ResumePreview';
