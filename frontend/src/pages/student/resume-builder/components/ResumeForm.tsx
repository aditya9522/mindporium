import React from 'react';
import {
    Plus,
    Trash2,
    ChevronDown,
    ChevronUp,
    User,
    FileText,
    Bot,
    GraduationCap,
    Users,
    ArrowUp,
    ArrowDown,
    Award,
    Eye,
    EyeOff,
    Languages,
    Heart,
    BriefcaseBusiness,
    Sparkles
} from 'lucide-react';
import { Button } from '../../../../components/ui/Button';
import type { ResumeData } from '../types';

interface Props {
    data: ResumeData;
    onChange: (data: ResumeData) => void;
}

const SECTION_OPTIONS: Array<{
    key: keyof ResumeData['sectionVisibility'];
    label: string;
    icon: React.ElementType;
}> = [
    { key: 'summary', label: 'Professional Summary', icon: FileText },
    { key: 'skills', label: 'Technical Skills', icon: Bot },
    { key: 'experience', label: 'Work Experience', icon: Users },
    { key: 'projects', label: 'Projects', icon: FileText },
    { key: 'education', label: 'Education', icon: GraduationCap },
    { key: 'achievements', label: 'Achievements', icon: Award },
    { key: 'certifications', label: 'Certifications', icon: Award },
    { key: 'languages', label: 'Languages', icon: Languages },
    { key: 'interests', label: 'Interests', icon: Heart },
    { key: 'volunteerExperience', label: 'Volunteer Experience', icon: BriefcaseBusiness },
];

const createCustomSection = () => ({
    id: `custom-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    title: 'New Section',
    items: [''],
});

export const ResumeForm: React.FC<Props> = ({ data, onChange }) => {
    const [openSection, setOpenSection] = React.useState<string | null>('personal');

    const updateData = (next: ResumeData) => onChange(next);

    const updatePersonalInfo = (field: keyof ResumeData['personalInfo'], value: string) => {
        updateData({
            ...data,
            personalInfo: { ...data.personalInfo, [field]: value }
        });
    };

    const updateSectionVisibility = (section: keyof ResumeData['sectionVisibility'], visible: boolean) => {
        updateData({
            ...data,
            sectionVisibility: {
                ...data.sectionVisibility,
                [section]: visible
            }
        });

        if (visible) {
            setOpenSection(section);
        } else if (openSection === section) {
            setOpenSection(null);
        }
    };

    const updateStringList = (field: 'achievements' | 'languages' | 'interests', index: number, value: string) => {
        const next = [...data[field]];
        next[index] = value;
        updateData({ ...data, [field]: next });
    };

    const addStringListItem = (field: 'achievements' | 'languages' | 'interests') => {
        updateData({ ...data, [field]: [...data[field], ''] });
    };

    const removeStringListItem = (field: 'achievements' | 'languages' | 'interests', index: number) => {
        updateData({ ...data, [field]: data[field].filter((_, i) => i !== index) });
    };

    const moveItem = <T,>(items: T[], index: number, direction: 'up' | 'down') => {
        const next = [...items];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= next.length) {
            return items;
        }
        [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
        return next;
    };

    const addSkill = () => {
        updateData({
            ...data,
            skills: [...data.skills, { category: '', items: '' }]
        });
    };

    const removeSkill = (index: number) => {
        updateData({
            ...data,
            skills: data.skills.filter((_, i) => i !== index)
        });
    };

    const updateSkill = (index: number, field: 'category' | 'items', value: string) => {
        const newSkills = [...data.skills];
        newSkills[index] = { ...newSkills[index], [field]: value };
        updateData({ ...data, skills: newSkills });
    };

    const addExperience = () => {
        updateData({
            ...data,
            experience: [...data.experience, { role: '', company: '', location: '', period: '', description: [''] }]
        });
    };

    const updateExperience = (index: number, field: keyof ResumeData['experience'][number], value: string | string[]) => {
        const next = [...data.experience];
        next[index] = { ...next[index], [field]: value };
        updateData({ ...data, experience: next });
    };

    const addExpBullet = (expIndex: number) => {
        const next = [...data.experience];
        next[expIndex] = { ...next[expIndex], description: [...next[expIndex].description, ''] };
        updateData({ ...data, experience: next });
    };

    const updateExpBullet = (expIndex: number, bulletIndex: number, value: string) => {
        const next = [...data.experience];
        const bullets = [...next[expIndex].description];
        bullets[bulletIndex] = value;
        next[expIndex] = { ...next[expIndex], description: bullets };
        updateData({ ...data, experience: next });
    };

    const removeExpBullet = (expIndex: number, bulletIndex: number) => {
        const next = [...data.experience];
        next[expIndex] = {
            ...next[expIndex],
            description: next[expIndex].description.filter((_, i) => i !== bulletIndex)
        };
        updateData({ ...data, experience: next });
    };

    const addCertification = () => {
        updateData({
            ...data,
            certifications: [...data.certifications, { name: '', issuer: '', date: '', details: '' }],
            sectionVisibility: {
                ...data.sectionVisibility,
                certifications: true
            }
        });
        setOpenSection('certifications');
    };

    const updateCertification = (index: number, field: keyof ResumeData['certifications'][number], value: string) => {
        const next = [...data.certifications];
        next[index] = { ...next[index], [field]: value };
        updateData({ ...data, certifications: next });
    };

    const removeCertification = (index: number) => {
        updateData({
            ...data,
            certifications: data.certifications.filter((_, i) => i !== index)
        });
    };

    const addVolunteerExperience = () => {
        updateData({
            ...data,
            volunteerExperience: [
                ...data.volunteerExperience,
                { role: '', organization: '', location: '', period: '', description: '' }
            ],
            sectionVisibility: {
                ...data.sectionVisibility,
                volunteerExperience: true
            }
        });
        setOpenSection('volunteerExperience');
    };

    const updateVolunteerExperience = (index: number, field: keyof ResumeData['volunteerExperience'][number], value: string) => {
        const next = [...data.volunteerExperience];
        next[index] = { ...next[index], [field]: value };
        updateData({ ...data, volunteerExperience: next });
    };

    const removeVolunteerExperience = (index: number) => {
        updateData({
            ...data,
            volunteerExperience: data.volunteerExperience.filter((_, i) => i !== index)
        });
    };

    const addCustomSection = () => {
        const nextSection = createCustomSection();
        updateData({
            ...data,
            customSections: [...data.customSections, nextSection]
        });
        setOpenSection(nextSection.id);
    };

    const updateCustomSection = (sectionId: string, updater: (section: ResumeData['customSections'][number]) => ResumeData['customSections'][number]) => {
        updateData({
            ...data,
            customSections: data.customSections.map((section) => (
                section.id === sectionId ? updater(section) : section
            ))
        });
    };

    const removeCustomSection = (sectionId: string) => {
        updateData({
            ...data,
            customSections: data.customSections.filter((section) => section.id !== sectionId)
        });
        if (openSection === sectionId) {
            setOpenSection(null);
        }
    };

    const SectionHeader = ({ id, title, icon: Icon }: { id: string; title: string; icon: React.ElementType }) => (
        <button
            type="button"
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

    const renderSimpleListSection = (
        id: string,
        title: string,
        icon: React.ElementType,
        field: 'achievements' | 'languages' | 'interests',
        addLabel: string
    ) => (
        <div>
            <SectionHeader id={id} title={title} icon={icon} />
            {openSection === id && (
                <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-800 mb-4 space-y-4">
                    {data[field].map((item, index) => (
                        <div key={index} className="flex gap-2">
                            <input
                                value={item}
                                onChange={(e) => updateStringList(field, index, e.target.value)}
                                className="flex-1 p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm"
                            />
                            <Button variant="ghost" size="sm" onClick={() => removeStringListItem(field, index)}>
                                <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                        </div>
                    ))}
                    <Button variant="outline" size="sm" className="w-full gap-2" onClick={() => addStringListItem(field)}>
                        <Plus className="w-4 h-4" /> {addLabel}
                    </Button>
                </div>
            )}
        </div>
    );

    const hiddenPresetSections = SECTION_OPTIONS.filter(({ key }) => !data.sectionVisibility[key]);

    return (
        <div className="space-y-4">
            <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-800 space-y-4">
                <div>
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white">Customize Sections</h3>
                    <p className="text-xs text-gray-500 mt-1">Pick from more ready-made resume sections, or build a new section with your own heading and entries.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {SECTION_OPTIONS.map(({ key, label }) => {
                        const visible = data.sectionVisibility[key];
                        return (
                            <button
                                key={key}
                                type="button"
                                onClick={() => updateSectionVisibility(key, !visible)}
                                className="flex items-center justify-between rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-left"
                            >
                                <span className="text-sm text-gray-700 dark:text-gray-200">{label}</span>
                                {visible ? <Eye className="w-4 h-4 text-primary-600" /> : <EyeOff className="w-4 h-4 text-gray-400" />}
                            </button>
                        );
                    })}
                </div>

                <div className="space-y-2">
                    <p className="text-xs font-bold uppercase tracking-wide text-gray-500">Quick Add</p>
                    <div className="flex flex-wrap gap-2">
                        {hiddenPresetSections.map(({ key, label, icon: Icon }) => (
                            <Button
                                key={key}
                                variant="outline"
                                size="sm"
                                className="gap-2"
                                onClick={() => updateSectionVisibility(key, true)}
                            >
                                <Icon className="w-4 h-4" /> {label}
                            </Button>
                        ))}
                        <Button variant="outline" size="sm" className="gap-2" onClick={addCustomSection}>
                            <Sparkles className="w-4 h-4" /> Build New Section
                        </Button>
                    </div>
                </div>
            </div>

            <div>
                <SectionHeader id="personal" title="Personal Information" icon={User} />
                {openSection === 'personal' && (
                    <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-800 space-y-4 mb-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1">Full Name</label>
                                <input type="text" value={data.personalInfo.fullName} onChange={(e) => updatePersonalInfo('fullName', e.target.value)} className="w-full p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1">Location</label>
                                <input type="text" value={data.personalInfo.location} onChange={(e) => updatePersonalInfo('location', e.target.value)} className="w-full p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1">Phone</label>
                                <input type="text" value={data.personalInfo.phone} onChange={(e) => updatePersonalInfo('phone', e.target.value)} className="w-full p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1">Email</label>
                                <input type="email" value={data.personalInfo.email} onChange={(e) => updatePersonalInfo('email', e.target.value)} className="w-full p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm" />
                            </div>
                            <div className="col-span-2">
                                <label className="block text-xs font-bold text-gray-500 mb-1">LinkedIn URL</label>
                                <input type="text" value={data.personalInfo.linkedin} onChange={(e) => updatePersonalInfo('linkedin', e.target.value)} className="w-full p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm" />
                            </div>
                            <div className="col-span-2">
                                <label className="block text-xs font-bold text-gray-500 mb-1">GitHub URL</label>
                                <input type="text" value={data.personalInfo.github} onChange={(e) => updatePersonalInfo('github', e.target.value)} className="w-full p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm" />
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {data.sectionVisibility.summary && (
                <div>
                    <SectionHeader id="summary" title="Professional Summary" icon={FileText} />
                    {openSection === 'summary' && (
                        <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-800 mb-4">
                            <textarea value={data.summary} onChange={(e) => updateData({ ...data, summary: e.target.value })} rows={4} className="w-full p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm" />
                        </div>
                    )}
                </div>
            )}

            {data.sectionVisibility.skills && (
                <div>
                    <SectionHeader id="skills" title="Technical Skills" icon={Bot} />
                    {openSection === 'skills' && (
                        <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-800 mb-4 space-y-4">
                            {data.skills.map((skill, index) => (
                                <div key={index} className="space-y-2 pb-4 border-b border-gray-200 dark:border-gray-800 last:border-0 last:pb-0">
                                    <div className="flex justify-between items-center">
                                        <input placeholder="Category (e.g. Languages)" value={skill.category} onChange={(e) => updateSkill(index, 'category', e.target.value)} className="font-bold text-sm bg-transparent border-0 outline-none w-1/2" />
                                        <Button variant="ghost" size="sm" onClick={() => removeSkill(index)}>
                                            <Trash2 className="w-4 h-4 text-red-500" />
                                        </Button>
                                    </div>
                                    <textarea placeholder="Items (comma separated)" value={skill.items} onChange={(e) => updateSkill(index, 'items', e.target.value)} rows={2} className="w-full p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm" />
                                </div>
                            ))}
                            <Button variant="outline" size="sm" className="w-full gap-2" onClick={addSkill}>
                                <Plus className="w-4 h-4" /> Add Skill Category
                            </Button>
                        </div>
                    )}
                </div>
            )}

            {data.sectionVisibility.experience && (
                <div>
                    <SectionHeader id="experience" title="Work Experience" icon={Users} />
                    {openSection === 'experience' && (
                        <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-800 mb-4 space-y-6">
                            {data.experience.map((exp, index) => (
                                <div key={index} className="space-y-4 pb-6 border-b border-gray-200 dark:border-gray-800 last:border-0 last:pb-0 relative">
                                    <div className="absolute top-0 right-0 flex gap-1">
                                        <Button variant="ghost" size="sm" disabled={index === 0} onClick={() => updateData({ ...data, experience: moveItem(data.experience, index, 'up') })}><ArrowUp className="w-4 h-4" /></Button>
                                        <Button variant="ghost" size="sm" disabled={index === data.experience.length - 1} onClick={() => updateData({ ...data, experience: moveItem(data.experience, index, 'down') })}><ArrowDown className="w-4 h-4" /></Button>
                                        <Button variant="ghost" size="sm" onClick={() => updateData({ ...data, experience: data.experience.filter((_, i) => i !== index) })}><Trash2 className="w-4 h-4 text-red-500" /></Button>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 mb-1">Role</label>
                                            <input value={exp.role} onChange={(e) => updateExperience(index, 'role', e.target.value)} className="w-full p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 mb-1">Period</label>
                                            <input value={exp.period} onChange={(e) => updateExperience(index, 'period', e.target.value)} className="w-full p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 mb-1">Company</label>
                                            <input value={exp.company} onChange={(e) => updateExperience(index, 'company', e.target.value)} className="w-full p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 mb-1">Location</label>
                                            <input value={exp.location} onChange={(e) => updateExperience(index, 'location', e.target.value)} className="w-full p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-xs font-bold text-gray-500 mb-1">Bullet Points</label>
                                        {exp.description.map((bullet, bIndex) => (
                                            <div key={bIndex} className="flex gap-2">
                                                <input value={bullet} onChange={(e) => updateExpBullet(index, bIndex, e.target.value)} className="flex-1 p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm" />
                                                <Button variant="ghost" size="sm" onClick={() => removeExpBullet(index, bIndex)}><Trash2 className="w-4 h-4 text-gray-400" /></Button>
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
            )}

            {data.sectionVisibility.projects && (
                <div>
                    <SectionHeader id="projects" title="Projects" icon={FileText} />
                    {openSection === 'projects' && (
                        <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-800 mb-4 space-y-6">
                            {data.projects.map((proj, index) => (
                                <div key={index} className="space-y-4 pb-6 border-b border-gray-200 dark:border-gray-800 last:border-0 last:pb-0 relative">
                                    <div className="absolute top-0 right-0 flex gap-1">
                                        <Button variant="ghost" size="sm" disabled={index === 0} onClick={() => updateData({ ...data, projects: moveItem(data.projects, index, 'up') })}><ArrowUp className="w-4 h-4" /></Button>
                                        <Button variant="ghost" size="sm" disabled={index === data.projects.length - 1} onClick={() => updateData({ ...data, projects: moveItem(data.projects, index, 'down') })}><ArrowDown className="w-4 h-4" /></Button>
                                        <Button variant="ghost" size="sm" onClick={() => updateData({ ...data, projects: data.projects.filter((_, i) => i !== index) })}><Trash2 className="w-4 h-4 text-red-500" /></Button>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="col-span-2">
                                            <label className="block text-xs font-bold text-gray-500 mb-1">Project Title</label>
                                            <input value={proj.title} onChange={(e) => {
                                                const next = [...data.projects];
                                                next[index].title = e.target.value;
                                                updateData({ ...data, projects: next });
                                            }} className="w-full p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm" />
                                        </div>
                                        <div className="col-span-2">
                                            <label className="block text-xs font-bold text-gray-500 mb-1">Tech Stack</label>
                                            <input value={proj.techStack} onChange={(e) => {
                                                const next = [...data.projects];
                                                next[index].techStack = e.target.value;
                                                updateData({ ...data, projects: next });
                                            }} className="w-full p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-xs font-bold text-gray-500 mb-1">Project Details</label>
                                        {proj.description.map((bullet, bIndex) => (
                                            <div key={bIndex} className="flex gap-2">
                                                <input value={bullet} onChange={(e) => {
                                                    const next = [...data.projects];
                                                    next[index].description[bIndex] = e.target.value;
                                                    updateData({ ...data, projects: next });
                                                }} className="flex-1 p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm" />
                                                <Button variant="ghost" size="sm" onClick={() => {
                                                    const next = [...data.projects];
                                                    next[index] = { ...next[index], description: next[index].description.filter((_, i) => i !== bIndex) };
                                                    updateData({ ...data, projects: next });
                                                }}><Trash2 className="w-4 h-4 text-gray-400" /></Button>
                                            </div>
                                        ))}
                                        <Button variant="ghost" size="sm" className="w-full border border-dashed border-gray-200 dark:border-gray-800 rounded-lg text-xs" onClick={() => {
                                            const next = [...data.projects];
                                            next[index] = { ...next[index], description: [...next[index].description, ''] };
                                            updateData({ ...data, projects: next });
                                        }}>
                                            <Plus className="w-3 h-3 mr-1" /> Add Detail
                                        </Button>
                                    </div>
                                </div>
                            ))}
                            <Button variant="outline" size="sm" className="w-full gap-2" onClick={() => updateData({
                                ...data,
                                projects: [...data.projects, { title: '', techStack: '', description: [''] }]
                            })}>
                                <Plus className="w-4 h-4" /> Add Project
                            </Button>
                        </div>
                    )}
                </div>
            )}

            {data.sectionVisibility.education && (
                <div>
                    <SectionHeader id="education" title="Education" icon={GraduationCap} />
                    {openSection === 'education' && (
                        <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-800 mb-4 space-y-6">
                            {data.education.map((edu, index) => (
                                <div key={index} className="space-y-4 pb-6 border-b border-gray-200 dark:border-gray-800 last:border-0 last:pb-0 relative">
                                    <div className="absolute top-0 right-0 flex gap-1">
                                        <Button variant="ghost" size="sm" disabled={index === 0} onClick={() => updateData({ ...data, education: moveItem(data.education, index, 'up') })}><ArrowUp className="w-4 h-4" /></Button>
                                        <Button variant="ghost" size="sm" disabled={index === data.education.length - 1} onClick={() => updateData({ ...data, education: moveItem(data.education, index, 'down') })}><ArrowDown className="w-4 h-4" /></Button>
                                        <Button variant="ghost" size="sm" onClick={() => updateData({ ...data, education: data.education.filter((_, i) => i !== index) })}><Trash2 className="w-4 h-4 text-red-500" /></Button>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="col-span-2">
                                            <label className="block text-xs font-bold text-gray-500 mb-1">Degree</label>
                                            <input value={edu.degree} onChange={(e) => {
                                                const next = [...data.education];
                                                next[index].degree = e.target.value;
                                                updateData({ ...data, education: next });
                                            }} className="w-full p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 mb-1">Institution</label>
                                            <input value={edu.institution} onChange={(e) => {
                                                const next = [...data.education];
                                                next[index].institution = e.target.value;
                                                updateData({ ...data, education: next });
                                            }} className="w-full p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 mb-1">Period</label>
                                            <input value={edu.period} onChange={(e) => {
                                                const next = [...data.education];
                                                next[index].period = e.target.value;
                                                updateData({ ...data, education: next });
                                            }} className="w-full p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm" />
                                        </div>
                                        <div className="col-span-2">
                                            <label className="block text-xs font-bold text-gray-500 mb-1">Location</label>
                                            <input value={edu.location} onChange={(e) => {
                                                const next = [...data.education];
                                                next[index].location = e.target.value;
                                                updateData({ ...data, education: next });
                                            }} className="w-full p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <Button variant="outline" size="sm" className="w-full gap-2" onClick={() => updateData({
                                ...data,
                                education: [...data.education, { degree: '', institution: '', location: '', period: '' }]
                            })}>
                                <Plus className="w-4 h-4" /> Add Education
                            </Button>
                        </div>
                    )}
                </div>
            )}

            {data.sectionVisibility.achievements && renderSimpleListSection('achievements', 'Achievements', Award, 'achievements', 'Add Achievement')}
            {data.sectionVisibility.languages && renderSimpleListSection('languages', 'Languages', Languages, 'languages', 'Add Language')}
            {data.sectionVisibility.interests && renderSimpleListSection('interests', 'Interests', Heart, 'interests', 'Add Interest')}

            {data.sectionVisibility.certifications && (
                <div>
                    <SectionHeader id="certifications" title="Certifications" icon={Award} />
                    {openSection === 'certifications' && (
                        <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-800 mb-4 space-y-6">
                            {data.certifications.length === 0 && (
                                <div className="rounded-lg border border-dashed border-gray-300 dark:border-gray-700 px-4 py-6 text-center text-sm text-gray-500">
                                    Add your first certification to include this section on the resume.
                                </div>
                            )}
                            {data.certifications.map((cert, index) => (
                                <div key={index} className="space-y-4 pb-6 border-b border-gray-200 dark:border-gray-800 last:border-0 last:pb-0 relative">
                                    <div className="absolute top-0 right-0">
                                        <Button variant="ghost" size="sm" onClick={() => removeCertification(index)}><Trash2 className="w-4 h-4 text-red-500" /></Button>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="col-span-2">
                                            <label className="block text-xs font-bold text-gray-500 mb-1">Certification Name</label>
                                            <input value={cert.name} onChange={(e) => updateCertification(index, 'name', e.target.value)} className="w-full p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 mb-1">Issuer</label>
                                            <input value={cert.issuer} onChange={(e) => updateCertification(index, 'issuer', e.target.value)} className="w-full p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 mb-1">Date</label>
                                            <input value={cert.date} onChange={(e) => updateCertification(index, 'date', e.target.value)} className="w-full p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm" />
                                        </div>
                                        <div className="col-span-2">
                                            <label className="block text-xs font-bold text-gray-500 mb-1">Details</label>
                                            <textarea value={cert.details} onChange={(e) => updateCertification(index, 'details', e.target.value)} rows={2} className="w-full p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <Button variant="outline" size="sm" className="w-full gap-2" onClick={addCertification}>
                                <Plus className="w-4 h-4" /> Add Certification
                            </Button>
                        </div>
                    )}
                </div>
            )}

            {data.sectionVisibility.volunteerExperience && (
                <div>
                    <SectionHeader id="volunteerExperience" title="Volunteer Experience" icon={BriefcaseBusiness} />
                    {openSection === 'volunteerExperience' && (
                        <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-800 mb-4 space-y-6">
                            {data.volunteerExperience.map((item, index) => (
                                <div key={index} className="space-y-4 pb-6 border-b border-gray-200 dark:border-gray-800 last:border-0 last:pb-0 relative">
                                    <div className="absolute top-0 right-0 flex gap-1">
                                        <Button variant="ghost" size="sm" disabled={index === 0} onClick={() => updateData({ ...data, volunteerExperience: moveItem(data.volunteerExperience, index, 'up') })}><ArrowUp className="w-4 h-4" /></Button>
                                        <Button variant="ghost" size="sm" disabled={index === data.volunteerExperience.length - 1} onClick={() => updateData({ ...data, volunteerExperience: moveItem(data.volunteerExperience, index, 'down') })}><ArrowDown className="w-4 h-4" /></Button>
                                        <Button variant="ghost" size="sm" onClick={() => removeVolunteerExperience(index)}><Trash2 className="w-4 h-4 text-red-500" /></Button>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 mb-1">Role</label>
                                            <input value={item.role} onChange={(e) => updateVolunteerExperience(index, 'role', e.target.value)} className="w-full p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 mb-1">Period</label>
                                            <input value={item.period} onChange={(e) => updateVolunteerExperience(index, 'period', e.target.value)} className="w-full p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 mb-1">Organization</label>
                                            <input value={item.organization} onChange={(e) => updateVolunteerExperience(index, 'organization', e.target.value)} className="w-full p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 mb-1">Location</label>
                                            <input value={item.location} onChange={(e) => updateVolunteerExperience(index, 'location', e.target.value)} className="w-full p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm" />
                                        </div>
                                        <div className="col-span-2">
                                            <label className="block text-xs font-bold text-gray-500 mb-1">Description</label>
                                            <textarea value={item.description} onChange={(e) => updateVolunteerExperience(index, 'description', e.target.value)} rows={3} className="w-full p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <Button variant="outline" size="sm" className="w-full gap-2" onClick={addVolunteerExperience}>
                                <Plus className="w-4 h-4" /> Add Volunteer Experience
                            </Button>
                        </div>
                    )}
                </div>
            )}

            {data.customSections.map((section) => (
                <div key={section.id}>
                    <SectionHeader id={section.id} title={section.title || 'Custom Section'} icon={Sparkles} />
                    {openSection === section.id && (
                        <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-800 mb-4 space-y-4">
                            <div className="flex justify-end">
                                <Button variant="ghost" size="sm" onClick={() => removeCustomSection(section.id)}>
                                    <Trash2 className="w-4 h-4 text-red-500" />
                                </Button>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1">Section Title</label>
                                <input
                                    value={section.title}
                                    onChange={(e) => updateCustomSection(section.id, (current) => ({ ...current, title: e.target.value }))}
                                    className="w-full p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="block text-xs font-bold text-gray-500 mb-1">Entries</label>
                                {section.items.map((item, index) => (
                                    <div key={index} className="flex gap-2">
                                        <input
                                            value={item}
                                            onChange={(e) => updateCustomSection(section.id, (current) => {
                                                const items = [...current.items];
                                                items[index] = e.target.value;
                                                return { ...current, items };
                                            })}
                                            className="flex-1 p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm"
                                        />
                                        <Button variant="ghost" size="sm" onClick={() => updateCustomSection(section.id, (current) => ({
                                            ...current,
                                            items: current.items.filter((_, i) => i !== index)
                                        }))}>
                                            <Trash2 className="w-4 h-4 text-red-500" />
                                        </Button>
                                    </div>
                                ))}
                                <Button variant="outline" size="sm" className="w-full gap-2" onClick={() => updateCustomSection(section.id, (current) => ({
                                    ...current,
                                    items: [...current.items, '']
                                }))}>
                                    <Plus className="w-4 h-4" /> Add Entry
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};
