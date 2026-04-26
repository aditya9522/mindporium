export interface ResumeData {
    personalInfo: {
        fullName: string;
        location: string;
        phone: string;
        email: string;
        linkedin: string;
        github: string;
    };
    summary: string;
    skills: {
        category: string;
        items: string;
    }[];
    experience: {
        role: string;
        company: string;
        location: string;
        period: string;
        description: string[];
    }[];
    projects: {
        title: string;
        techStack: string;
        description: string[];
    }[];
    education: {
        degree: string;
        institution: string;
        location: string;
        period: string;
    }[];
    achievements: string[];
}

export const initialResumeData: ResumeData = {
    personalInfo: {
        fullName: 'John Doe',
        location: 'New York, USA',
        phone: '+1 234 567 890',
        email: 'john.doe@example.com',
        linkedin: 'https://linkedin.com/in/johndoe',
        github: 'https://github.com/johndoe',
    },
    summary: 'Experienced Software Engineer with a passion for building scalable web applications and exploring emerging technologies. Proven track record of delivering high-quality code and collaborating effectively with cross-functional teams.',
    skills: [
        { category: 'Languages', items: 'JavaScript, TypeScript, Python, Java, C++' },
        { category: 'Frontend', items: 'React, Next.js, Vue, Tailwind CSS, Redux' },
        { category: 'Backend', items: 'Node.js, Express, FastAPI, PostgreSQL, MongoDB' },
        { category: 'Tools', items: 'Git, Docker, Kubernetes, AWS, Jenkins' },
    ],
    experience: [
        {
            role: 'Senior Software Engineer',
            company: 'Tech Solutions Inc.',
            location: 'Remote',
            period: 'Jan 2022 – Present',
            description: [
                'Lead the development of a high-traffic e-commerce platform, improving performance by 30%',
                'Mentored junior developers and implemented best practices for code reviews and testing',
                'Collaborated with product managers to define requirements and roadmaps for new features'
            ]
        },
        {
            role: 'Full Stack Developer',
            company: 'Innovation Labs',
            location: 'San Francisco, CA',
            period: 'Jun 2019 – Dec 2021',
            description: [
                'Developed and maintained multiple client-facing web applications using React and Node.js',
                'Optimized database queries and API endpoints, reducing latency by 40%',
                'Integrated third-party services and APIs for payment processing and analytics'
            ]
        }
    ],
    projects: [
        {
            title: 'E-commerce Platform',
            techStack: 'Next.js, Tailwind CSS, Stripe, Prisma',
            description: [
                'Built a full-featured e-commerce site with product search, cart functionality, and secure checkout',
                'Implemented server-side rendering for improved SEO and page load times'
            ]
        },
        {
            title: 'Task Management App',
            techStack: 'React, Firebase, Material UI',
            description: [
                'Created a real-time task management tool with drag-and-drop features and user authentication',
                'Integrated cloud functions for automated notifications and data syncing'
            ]
        }
    ],
    education: [
        {
            degree: 'Bachelor of Science in Computer Science',
            institution: 'State University',
            location: 'City, State',
            period: '2015 – 2019'
        }
    ],
    achievements: [
        'Employee of the Year 2023 at Tech Solutions Inc.',
        'First Place in National Hackathon 2018'
    ]
};
