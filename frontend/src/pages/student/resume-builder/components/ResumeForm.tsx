import React from 'react';
import { Plus, Trash2, ChevronDown, ChevronUp, User, FileText, Bot, GraduationCap, Users, ArrowUp, ArrowDown } from 'lucide-react';
import { Button } from '../../../../components/ui/Button';
import type { ResumeData } from '../types';

interface Props {
    data: ResumeData;
    onChange: (data: ResumeData) => void;
}

export const ResumeForm: React.FC<Props> = ({ data, onChange }) => {
    const [openSection, setOpenSection] = React.useState<string | null>('personal');

    const updatePersonalInfo = (field: keyof ResumeData['personalInfo'], value: string) => {
        onChange({
            ...data,
            personalInfo: { ...data.personalInfo, [field]: value }
        });
    };

    const addSkill = () => {
        onChange({
            ...data,
            skills: [...data.skills, { category: '', items: '' }]
        });
    };

    const removeSkill = (index: number) => {
        onChange({
            ...data,
            skills: data.skills.filter((_, i) => i !== index)
        });
    };

    const updateSkill = (index: number, field: 'category' | 'items', value: string) => {
        const newSkills = [...data.skills];
        newSkills[index] = { ...newSkills[index], [field]: value };
        onChange({ ...data, skills: newSkills });
    };

    const addExperience = () => {
        onChange({
            ...data,
            experience: [...data.experience, { role: '', company: '', location: '', period: '', description: [''] }]
        });
    };

    const updateExperience = (index: number, field: string, value: any) => {
        const newExp = [...data.experience];
        newExp[index] = { ...newExp[index], [field]: value };
        onChange({ ...data, experience: newExp });
    };

    const removeExperience = (index: number) => {
        onChange({
            ...data,
            experience: data.experience.filter((_, i) => i !== index)
        });
    };

    const moveExperience = (index: number, direction: 'up' | 'down') => {
        const newExp = [...data.experience];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= newExp.length) return;
        [newExp[index], newExp[targetIndex]] = [newExp[targetIndex], newExp[index]];
        onChange({ ...data, experience: newExp });
    };

    const moveProject = (index: number, direction: 'up' | 'down') => {
        const newProj = [...data.projects];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= newProj.length) return;
        [newProj[index], newProj[targetIndex]] = [newProj[targetIndex], newProj[index]];
        onChange({ ...data, projects: newProj });
    };

    const moveEducation = (index: number, direction: 'up' | 'down') => {
        const newEdu = [...data.education];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= newEdu.length) return;
        [newEdu[index], newEdu[targetIndex]] = [newEdu[targetIndex], newEdu[index]];
        onChange({ ...data, education: newEdu });
    };

    const addExpBullet = (expIndex: number) => {
        const newExp = [...data.experience];
        newExp[expIndex] = {
            ...newExp[expIndex],
            description: [...newExp[expIndex].description, '']
        };
        onChange({ ...data, experience: newExp });
    };

    const updateExpBullet = (expIndex: number, bulletIndex: number, value: string) => {
        const newExp = [...data.experience];
        const newBullets = [...newExp[expIndex].description];
        newBullets[bulletIndex] = value;
        newExp[expIndex] = { ...newExp[expIndex], description: newBullets };
        onChange({ ...data, experience: newExp });
    };

    const removeExpBullet = (expIndex: number, bulletIndex: number) => {
        const newExp = [...data.experience];
        newExp[expIndex] = {
            ...newExp[expIndex],
            description: newExp[expIndex].description.filter((_, i) => i !== bulletIndex)
        };
        onChange({ ...data, experience: newExp });
    };

    const SectionHeader = ({ id, title, icon: Icon }: { id: string, title: string, icon: any }) => (
        <button
            onClick={() => setOpenSection(openSection === id ? null : id)}
            className={`w-full flex items-center justify-between p-4 rounded-xl mb-2 transition-all duration-300 ${openSection === id
                ? 'bg-primary-50 dark:bg-primary-900/20 border-primary-200 dark:border-primary-800 shadow-sm'
                : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800'
                } border`}
        >
            <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${openSection === id ? 'bg-primary-100 dark:bg-primary-900/40 text-primary-600' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'}`}>
                    <Icon className="w-4 h-4" />
                </div>
                <span className={`font-bold text-sm ${openSection === id ? 'text-primary-900 dark:text-primary-100' : 'text-gray-700 dark:text-gray-300'}`}>
                    {title}
                </span>
            </div>
            {openSection === id ? <ChevronUp className="w-4 h-4 text-primary-500" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
        </button>
    );

    return (
        <div className="space-y-4">
            {/* Personal Information */}
            <div>
                <SectionHeader id="personal" title="Personal Information" icon={User} />
                {openSection === 'personal' && (
                    <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-800 space-y-4 mb-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1">Full Name</label>
                                <input
                                    type="text"
                                    value={data.personalInfo.fullName}
                                    onChange={(e) => updatePersonalInfo('fullName', e.target.value)}
                                    className="w-full p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1">Location</label>
                                <input
                                    type="text"
                                    value={data.personalInfo.location}
                                    onChange={(e) => updatePersonalInfo('location', e.target.value)}
                                    className="w-full p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1">Phone</label>
                                <input
                                    type="text"
                                    value={data.personalInfo.phone}
                                    onChange={(e) => updatePersonalInfo('phone', e.target.value)}
                                    className="w-full p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1">Email</label>
                                <input
                                    type="email"
                                    value={data.personalInfo.email}
                                    onChange={(e) => updatePersonalInfo('email', e.target.value)}
                                    className="w-full p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm"
                                />
                            </div>
                            <div className="col-span-2">
                                <label className="block text-xs font-bold text-gray-500 mb-1">LinkedIn URL</label>
                                <input
                                    type="text"
                                    value={data.personalInfo.linkedin}
                                    onChange={(e) => updatePersonalInfo('linkedin', e.target.value)}
                                    className="w-full p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm"
                                />
                            </div>
                            <div className="col-span-2">
                                <label className="block text-xs font-bold text-gray-500 mb-1">GitHub URL</label>
                                <input
                                    type="text"
                                    value={data.personalInfo.github}
                                    onChange={(e) => updatePersonalInfo('github', e.target.value)}
                                    className="w-full p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm"
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Summary */}
            <div>
                <SectionHeader id="summary" title="Professional Summary" icon={FileText} />
                {openSection === 'summary' && (
                    <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-800 mb-4">
                        <textarea
                            value={data.summary}
                            onChange={(e) => onChange({ ...data, summary: e.target.value })}
                            rows={4}
                            className="w-full p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm"
                        />
                    </div>
                )}
            </div>

            {/* Skills */}
            <div>
                <SectionHeader id="skills" title="Technical Skills" icon={Bot} />
                {openSection === 'skills' && (
                    <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-800 mb-4 space-y-4">
                        {data.skills.map((skill, index) => (
                            <div key={index} className="space-y-2 pb-4 border-b border-gray-200 dark:border-gray-800 last:border-0 last:pb-0">
                                <div className="flex justify-between items-center">
                                    <input
                                        placeholder="Category (e.g. Languages)"
                                        value={skill.category}
                                        onChange={(e) => updateSkill(index, 'category', e.target.value)}
                                        className="font-bold text-sm bg-transparent border-0 outline-none w-1/2"
                                    />
                                    <Button variant="ghost" size="sm" onClick={() => removeSkill(index)}>
                                        <Trash2 className="w-4 h-4 text-red-500" />
                                    </Button>
                                </div>
                                <textarea
                                    placeholder="Items (comma separated)"
                                    value={skill.items}
                                    onChange={(e) => updateSkill(index, 'items', e.target.value)}
                                    rows={2}
                                    className="w-full p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm"
                                />
                            </div>
                        ))}
                        <Button variant="outline" size="sm" className="w-full gap-2" onClick={addSkill}>
                            <Plus className="w-4 h-4" /> Add Skill Category
                        </Button>
                    </div>
                )}
            </div>

            {/* Experience */}
            <div>
                <SectionHeader id="experience" title="Work Experience" icon={Users} />
                {openSection === 'experience' && (
                    <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-800 mb-4 space-y-6">
                        {data.experience.map((exp, index) => (
                            <div key={index} className="space-y-4 pb-6 border-b border-gray-200 dark:border-gray-800 last:border-0 last:pb-0 relative">
                                <div className="absolute top-0 right-0 flex gap-1">
                                    <Button variant="ghost" size="sm" disabled={index === 0} onClick={() => moveExperience(index, 'up')}>
                                        <ArrowUp className="w-4 h-4" />
                                    </Button>
                                    <Button variant="ghost" size="sm" disabled={index === data.experience.length - 1} onClick={() => moveExperience(index, 'down')}>
                                        <ArrowDown className="w-4 h-4" />
                                    </Button>
                                    <Button variant="ghost" size="sm" onClick={() => removeExperience(index)}>
                                        <Trash2 className="w-4 h-4 text-red-500" />
                                    </Button>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-1">Role</label>
                                        <input
                                            value={exp.role}
                                            onChange={(e) => updateExperience(index, 'role', e.target.value)}
                                            className="w-full p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-1">Period</label>
                                        <input
                                            value={exp.period}
                                            onChange={(e) => updateExperience(index, 'period', e.target.value)}
                                            className="w-full p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-1">Company</label>
                                        <input
                                            value={exp.company}
                                            onChange={(e) => updateExperience(index, 'company', e.target.value)}
                                            className="w-full p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-1">Location</label>
                                        <input
                                            value={exp.location}
                                            onChange={(e) => updateExperience(index, 'location', e.target.value)}
                                            className="w-full p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-xs font-bold text-gray-500 mb-1">Bullet Points</label>
                                    {exp.description.map((bullet, bIndex) => (
                                        <div key={bIndex} className="flex gap-2">
                                            <input
                                                value={bullet}
                                                onChange={(e) => updateExpBullet(index, bIndex, e.target.value)}
                                                className="flex-1 p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm"
                                            />
                                            <Button variant="ghost" size="sm" onClick={() => removeExpBullet(index, bIndex)}>
                                                <Trash2 className="w-4 h-4 text-gray-400" />
                                            </Button>
                                        </div>
                                    ))}
                                    <Button variant="ghost" size="sm" className="w-full border border-dashed border-gray-200 dark:border-gray-800 rounded-lg text-xs" onClick={() => addExpBullet(index)}>
                                        <Plus className="w-3 h-3 mr-1" /> Add Bullet Point
                                    </Button>
                                </div>
                            </div>
                        ))}
                        <Button variant="outline" size="sm" className="w-full gap-2" onClick={addExperience}>
                            <Plus className="w-4 h-4" /> Add Experience
                        </Button>
                    </div>
                )}
            </div>

            {/* Projects */}
            <div>
                <SectionHeader id="projects" title="Projects" icon={FileText} />
                {openSection === 'projects' && (
                    <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-800 mb-4 space-y-6">
                        {data.projects.map((proj, index) => (
                            <div key={index} className="space-y-4 pb-6 border-b border-gray-200 dark:border-gray-800 last:border-0 last:pb-0 relative">
                                <div className="absolute top-0 right-0 flex gap-1">
                                    <Button variant="ghost" size="sm" disabled={index === 0} onClick={() => moveProject(index, 'up')}>
                                        <ArrowUp className="w-4 h-4" />
                                    </Button>
                                    <Button variant="ghost" size="sm" disabled={index === data.projects.length - 1} onClick={() => moveProject(index, 'down')}>
                                        <ArrowDown className="w-4 h-4" />
                                    </Button>
                                    <Button variant="ghost" size="sm" onClick={() => {
                                        const newProj = data.projects.filter((_, i) => i !== index);
                                        onChange({ ...data, projects: newProj });
                                    }}>
                                        <Trash2 className="w-4 h-4 text-red-500" />
                                    </Button>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="col-span-2">
                                        <label className="block text-xs font-bold text-gray-500 mb-1">Project Title</label>
                                        <input
                                            value={proj.title}
                                            onChange={(e) => {
                                                const newProj = [...data.projects];
                                                newProj[index].title = e.target.value;
                                                onChange({ ...data, projects: newProj });
                                            }}
                                            className="w-full p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm"
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-xs font-bold text-gray-500 mb-1">Tech Stack</label>
                                        <input
                                            value={proj.techStack}
                                            onChange={(e) => {
                                                const newProj = [...data.projects];
                                                newProj[index].techStack = e.target.value;
                                                onChange({ ...data, projects: newProj });
                                            }}
                                            className="w-full p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-xs font-bold text-gray-500 mb-1">Project Details</label>
                                    {proj.description.map((bullet, bIndex) => (
                                        <div key={bIndex} className="flex gap-2">
                                            <input
                                                value={bullet}
                                                onChange={(e) => {
                                                    const newProj = [...data.projects];
                                                    newProj[index].description[bIndex] = e.target.value;
                                                    onChange({ ...data, projects: newProj });
                                                }}
                                                className="flex-1 p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm"
                                            />
                                            <Button variant="ghost" size="sm" onClick={() => {
                                                const newProj = [...data.projects];
                                                newProj[index] = {
                                                    ...newProj[index],
                                                    description: newProj[index].description.filter((_, i) => i !== bIndex)
                                                };
                                                onChange({ ...data, projects: newProj });
                                            }}>
                                                <Trash2 className="w-4 h-4 text-gray-400" />
                                            </Button>
                                        </div>
                                    ))}
                                    <Button variant="ghost" size="sm" className="w-full border border-dashed border-gray-200 dark:border-gray-800 rounded-lg text-xs" onClick={() => {
                                        const newProj = [...data.projects];
                                        newProj[index] = {
                                            ...newProj[index],
                                            description: [...newProj[index].description, '']
                                        };
                                        onChange({ ...data, projects: newProj });
                                    }}>
                                        <Plus className="w-3 h-3 mr-1" /> Add Detail
                                    </Button>
                                </div>
                            </div>
                        ))}
                        <Button variant="outline" size="sm" className="w-full gap-2" onClick={() => {
                            onChange({
                                ...data,
                                projects: [...data.projects, { title: '', techStack: '', description: [''] }]
                            });
                        }}>
                            <Plus className="w-4 h-4" /> Add Project
                        </Button>
                    </div>
                )}
            </div>

            {/* Education */}
            <div>
                <SectionHeader id="education" title="Education" icon={GraduationCap} />
                {openSection === 'education' && (
                    <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-800 mb-4 space-y-6">
                        {data.education.map((edu, index) => (
                            <div key={index} className="space-y-4 pb-6 border-b border-gray-200 dark:border-gray-800 last:border-0 last:pb-0 relative">
                                <div className="absolute top-0 right-0 flex gap-1">
                                    <Button variant="ghost" size="sm" disabled={index === 0} onClick={() => moveEducation(index, 'up')}>
                                        <ArrowUp className="w-4 h-4" />
                                    </Button>
                                    <Button variant="ghost" size="sm" disabled={index === data.education.length - 1} onClick={() => moveEducation(index, 'down')}>
                                        <ArrowDown className="w-4 h-4" />
                                    </Button>
                                    <Button variant="ghost" size="sm" onClick={() => {
                                        const newEdu = data.education.filter((_, i) => i !== index);
                                        onChange({ ...data, education: newEdu });
                                    }}>
                                        <Trash2 className="w-4 h-4 text-red-500" />
                                    </Button>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="col-span-2">
                                        <label className="block text-xs font-bold text-gray-500 mb-1">Degree</label>
                                        <input
                                            value={edu.degree}
                                            onChange={(e) => {
                                                const newEdu = [...data.education];
                                                newEdu[index].degree = e.target.value;
                                                onChange({ ...data, education: newEdu });
                                            }}
                                            className="w-full p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-1">Institution</label>
                                        <input
                                            value={edu.institution}
                                            onChange={(e) => {
                                                const newEdu = [...data.education];
                                                newEdu[index].institution = e.target.value;
                                                onChange({ ...data, education: newEdu });
                                            }}
                                            className="w-full p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-1">Period</label>
                                        <input
                                            value={edu.period}
                                            onChange={(e) => {
                                                const newEdu = [...data.education];
                                                newEdu[index].period = e.target.value;
                                                onChange({ ...data, education: newEdu });
                                            }}
                                            className="w-full p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm"
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-xs font-bold text-gray-500 mb-1">Location</label>
                                        <input
                                            value={edu.location}
                                            onChange={(e) => {
                                                const newEdu = [...data.education];
                                                newEdu[index].location = e.target.value;
                                                onChange({ ...data, education: newEdu });
                                            }}
                                            className="w-full p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm"
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                        <Button variant="outline" size="sm" className="w-full gap-2" onClick={() => {
                            onChange({
                                ...data,
                                education: [...data.education, { degree: '', institution: '', location: '', period: '' }]
                            });
                        }}>
                            <Plus className="w-4 h-4" /> Add Education
                        </Button>
                    </div>
                )}
            </div>

            {/* Achievements */}
            <div>
                <SectionHeader id="achievements" title="Achievements" icon={GraduationCap} />
                {openSection === 'achievements' && (
                    <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-800 mb-4 space-y-4">
                        {data.achievements.map((ach, index) => (
                            <div key={index} className="flex gap-2">
                                <input
                                    value={ach}
                                    onChange={(e) => {
                                        const newAch = [...data.achievements];
                                        newAch[index] = e.target.value;
                                        onChange({ ...data, achievements: newAch });
                                    }}
                                    className="flex-1 p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm"
                                />
                                <Button variant="ghost" size="sm" onClick={() => {
                                    const newAch = data.achievements.filter((_, i) => i !== index);
                                    onChange({ ...data, achievements: newAch });
                                }}>
                                    <Trash2 className="w-4 h-4 text-red-500" />
                                </Button>
                            </div>
                        ))}
                        <Button variant="outline" size="sm" className="w-full gap-2" onClick={() => {
                            onChange({ ...data, achievements: [...data.achievements, ''] });
                        }}>
                            <Plus className="w-4 h-4" /> Add Achievement
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};
