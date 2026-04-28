import React from 'react';
import {
    Document,
    Page,
    Text,
    View,
    StyleSheet,
    Link,
} from '@react-pdf/renderer';
import type { ResumeData } from '../types';

interface Props {
    data: ResumeData;
}

const styles = StyleSheet.create({
    page: {
        paddingTop: 30,
        paddingBottom: 30,
        paddingHorizontal: 34,
        fontFamily: 'Helvetica',
        fontSize: 11,
        lineHeight: 1.28,
        color: '#111827',
        backgroundColor: '#FFFFFF',
    },
    header: {
        marginBottom: 12,
        textAlign: 'center',
    },
    name: {
        fontSize: 22,
        fontFamily: 'Helvetica-Bold',
        marginBottom: 9.5,
        color: '#111827',
    },
    contactLine: {
        fontSize: 10,
        color: '#374151',
        marginBottom: 2,
    },
    section: {
        marginBottom: 9,
    },
    sectionTitle: {
        fontSize: 11,
        fontFamily: 'Helvetica-Bold',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        paddingBottom: 2,
        marginBottom: 4,
        borderBottomWidth: 1,
        borderBottomColor: '#111827',
    },
    bodyText: {
        fontSize: 11,
        color: '#1F2937',
    },
    rowBetween: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: 12,
    },
    subheading: {
        fontSize: 11,
        fontFamily: 'Helvetica-Bold',
        color: '#111827',
    },
    metaText: {
        fontSize: 11,
        color: '#4B5563',
        marginTop: 1,
    },
    entryBlock: {
        marginBottom: 5,
    },
    bulletList: {
        marginTop: 2,
        paddingLeft: 10,
    },
    bulletRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 1,
        paddingRight: 4,
    },
    bulletMark: {
        width: 8,
        fontSize: 11,
    },
    bulletText: {
        flex: 1,
        fontSize: 11,
        color: '#1F2937',
    },
    inlineList: {
        fontSize: 11,
        color: '#1F2937',
    },
    skillRow: {
        flexDirection: 'row',
        marginBottom: 2,
        gap: 4,
    },
    skillCategory: {
        fontFamily: 'Helvetica-Bold',
        fontSize: 10,
    },
    link: {
        color: '#1F2937',
        textDecoration: 'none',
    },
});

const cleanLines = (items: string[]) => items.filter((item) => item.trim());

export const ResumePdfDocument: React.FC<Props> = ({ data }) => {
    const visible = data.sectionVisibility;
    const visibleSkills = data.skills.filter((skill) => skill.category.trim() || skill.items.trim());
    const visibleExperiences = data.experience.filter((exp) =>
        exp.role.trim() || exp.company.trim() || exp.location.trim() || exp.period.trim() || exp.description.some((item) => item.trim())
    );
    const visibleProjects = data.projects.filter((project) =>
        project.title.trim() || project.techStack.trim() || project.description.some((item) => item.trim())
    );
    const visibleEducation = data.education.filter((edu) =>
        edu.degree.trim() || edu.institution.trim() || edu.location.trim() || edu.period.trim()
    );
    const visibleAchievements = cleanLines(data.achievements);
    const visibleCertifications = data.certifications.filter((cert) =>
        cert.name.trim() || cert.issuer.trim() || cert.date.trim() || cert.details.trim()
    );
    const visibleLanguages = cleanLines(data.languages);
    const visibleInterests = cleanLines(data.interests);
    const visibleVolunteerExperience = data.volunteerExperience.filter((item) =>
        item.role.trim() || item.organization.trim() || item.location.trim() || item.period.trim() || item.description.trim()
    );
    const visibleCustomSections = data.customSections
        .map((section) => ({ ...section, items: cleanLines(section.items) }))
        .filter((section) => section.title.trim() || section.items.length > 0);

    return (
        <Document title={`${data.personalInfo.fullName || 'Resume'} Resume`} author={data.personalInfo.fullName || 'Mindporium'}>
            <Page size="A4" style={styles.page}>
                <View style={styles.header}>
                    <Text style={styles.name}>{data.personalInfo.fullName || 'Your Name'}</Text>
                    {data.personalInfo.location ? <Text style={styles.contactLine}>{data.personalInfo.location}</Text> : null}
                    <Text style={styles.contactLine}>
                        {[data.personalInfo.phone, data.personalInfo.email].filter(Boolean).join(' | ')}
                    </Text>
                    <Text style={styles.contactLine}>
                        {data.personalInfo.linkedin ? <Link src={data.personalInfo.linkedin} style={styles.link}>{data.personalInfo.linkedin}</Link> : null}
                        {data.personalInfo.linkedin && data.personalInfo.github ? ' | ' : ''}
                        {data.personalInfo.github ? <Link src={data.personalInfo.github} style={styles.link}>{data.personalInfo.github}</Link> : null}
                    </Text>
                </View>

                {visible.summary && data.summary.trim() ? (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Professional Summary</Text>
                        <Text style={styles.bodyText}>{data.summary.trim()}</Text>
                    </View>
                ) : null}

                {visible.skills && visibleSkills.length > 0 ? (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Technical Skills</Text>
                        {visibleSkills.map((skill, index) => (
                            <View key={`skill-${index}`} style={styles.skillRow}>
                                <Text style={styles.skillCategory}>{skill.category}:</Text>
                                <Text style={styles.bodyText}>{skill.items}</Text>
                            </View>
                        ))}
                    </View>
                ) : null}

                {visible.experience && visibleExperiences.length > 0 ? (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Work Experience</Text>
                        {visibleExperiences.map((exp, index) => (
                            <View key={`experience-${index}`} style={styles.entryBlock}>
                                <View style={styles.rowBetween}>
                                    <Text style={styles.subheading}>{exp.role}</Text>
                                    <Text style={styles.subheading}>{exp.period}</Text>
                                </View>
                                <Text style={styles.metaText}>{[exp.company, exp.location].filter(Boolean).join(', ')}</Text>
                                {cleanLines(exp.description).length > 0 ? (
                                    <View style={styles.bulletList}>
                                        {cleanLines(exp.description).map((item, bulletIndex) => (
                                            <View key={`experience-${index}-bullet-${bulletIndex}`} style={styles.bulletRow}>
                                                <Text style={styles.bulletMark}>•</Text>
                                                <Text style={styles.bulletText}>{item}</Text>
                                            </View>
                                        ))}
                                    </View>
                                ) : null}
                            </View>
                        ))}
                    </View>
                ) : null}

                {visible.projects && visibleProjects.length > 0 ? (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Projects</Text>
                        {visibleProjects.map((project, index) => (
                            <View key={`project-${index}`} style={styles.entryBlock}>
                                <Text style={styles.subheading}>{project.title}</Text>
                                {project.techStack ? <Text style={styles.metaText}>{project.techStack}</Text> : null}
                                {cleanLines(project.description).length > 0 ? (
                                    <View style={styles.bulletList}>
                                        {cleanLines(project.description).map((item, bulletIndex) => (
                                            <View key={`project-${index}-bullet-${bulletIndex}`} style={styles.bulletRow}>
                                                <Text style={styles.bulletMark}>•</Text>
                                                <Text style={styles.bulletText}>{item}</Text>
                                            </View>
                                        ))}
                                    </View>
                                ) : null}
                            </View>
                        ))}
                    </View>
                ) : null}

                {visible.education && visibleEducation.length > 0 ? (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Education</Text>
                        {visibleEducation.map((edu, index) => (
                            <View key={`education-${index}`} style={styles.entryBlock}>
                                <View style={styles.rowBetween}>
                                    <Text style={styles.subheading}>{edu.degree}</Text>
                                    <Text style={styles.subheading}>{edu.period}</Text>
                                </View>
                                <Text style={styles.metaText}>{[edu.institution, edu.location].filter(Boolean).join(', ')}</Text>
                            </View>
                        ))}
                    </View>
                ) : null}

                {visible.certifications && visibleCertifications.length > 0 ? (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Certifications</Text>
                        {visibleCertifications.map((cert, index) => (
                            <View key={`certification-${index}`} style={styles.entryBlock}>
                                <View style={styles.rowBetween}>
                                    <Text style={styles.subheading}>{cert.name}</Text>
                                    <Text style={styles.subheading}>{cert.date}</Text>
                                </View>
                                {cert.issuer ? <Text style={styles.metaText}>{cert.issuer}</Text> : null}
                                {cert.details.trim() ? <Text style={styles.bodyText}>{cert.details.trim()}</Text> : null}
                            </View>
                        ))}
                    </View>
                ) : null}

                {visible.volunteerExperience && visibleVolunteerExperience.length > 0 ? (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Volunteer Experience</Text>
                        {visibleVolunteerExperience.map((item, index) => (
                            <View key={`volunteer-${index}`} style={styles.entryBlock}>
                                <View style={styles.rowBetween}>
                                    <Text style={styles.subheading}>{item.role}</Text>
                                    <Text style={styles.subheading}>{item.period}</Text>
                                </View>
                                <Text style={styles.metaText}>{[item.organization, item.location].filter(Boolean).join(', ')}</Text>
                                {item.description.trim() ? <Text style={styles.bodyText}>{item.description.trim()}</Text> : null}
                            </View>
                        ))}
                    </View>
                ) : null}

                {visible.achievements && visibleAchievements.length > 0 ? (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Achievements</Text>
                        <View style={styles.bulletList}>
                            {visibleAchievements.map((item, index) => (
                                <View key={`achievement-${index}`} style={styles.bulletRow}>
                                    <Text style={styles.bulletMark}>•</Text>
                                    <Text style={styles.bulletText}>{item}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                ) : null}

                {visible.languages && visibleLanguages.length > 0 ? (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Languages</Text>
                        <Text style={styles.inlineList}>{visibleLanguages.join(', ')}</Text>
                    </View>
                ) : null}

                {visible.interests && visibleInterests.length > 0 ? (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Interests</Text>
                        <Text style={styles.inlineList}>{visibleInterests.join(', ')}</Text>
                    </View>
                ) : null}

                {visibleCustomSections.map((section) => (
                    <View key={section.id} style={styles.section}>
                        <Text style={styles.sectionTitle}>{section.title || 'Custom Section'}</Text>
                        <View style={styles.bulletList}>
                            {section.items.map((item, index) => (
                                <View key={`${section.id}-${index}`} style={styles.bulletRow}>
                                    <Text style={styles.bulletMark}>•</Text>
                                    <Text style={styles.bulletText}>{item}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                ))}
            </Page>
        </Document>
    );
};
