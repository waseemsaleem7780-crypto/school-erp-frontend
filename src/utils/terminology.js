// src/utils/terminology.js
// Multi-Institute Terminology System

import { useAuth } from '../context/AuthContext';

export const TERMS = {
    school: {
        class: 'Class', classes: 'Classes',
        section: 'Section', sections: 'Sections',
        subject: 'Subject', subjects: 'Subjects',
        teacher: 'Teacher', teachers: 'Teachers',
        student: 'Student', students: 'Students',
        exam: 'Exam', exams: 'Exams',
        fee: 'Fee', fees: 'Fees',
        homework: 'Homework',
        attendance: 'Attendance',
        timetable: 'Timetable',
        marks: 'Marks',
        result: 'Result', results: 'Results',
        guardian: 'Guardian', guardians: 'Guardians',
        noticeBoard: 'Notice Board',
        studyMaterial: 'Study Material',
    },
    academy: {
        class: 'Batch', classes: 'Batches',
        section: 'Time Slot', sections: 'Time Slots',
        subject: 'Course Module', subjects: 'Course Modules',
        teacher: 'Instructor', teachers: 'Instructors',
        student: 'Trainee', students: 'Trainees',
        exam: 'Test', exams: 'Tests',
        fee: 'Course Fee', fees: 'Course Fees',
        homework: 'Practice Work',
        attendance: 'Attendance',
        timetable: 'Class Schedule',
        marks: 'Score',
        result: 'Test Result', results: 'Test Results',
        guardian: 'Guardian', guardians: 'Guardians',
        noticeBoard: 'Announcements',
        studyMaterial: 'Course Material',
    },
    college: {
        class: 'Program', classes: 'Programs',
        section: 'Group', sections: 'Groups',
        subject: 'Course', subjects: 'Courses',
        teacher: 'Faculty', teachers: 'Faculty',
        student: 'Student', students: 'Students',
        exam: 'Assessment', exams: 'Assessments',
        fee: 'Semester Fee', fees: 'Semester Fees',
        homework: 'Assignment',
        attendance: 'Attendance',
        timetable: 'Class Schedule',
        marks: 'Marks',
        result: 'Result', results: 'Results',
        guardian: 'Guardian', guardians: 'Guardians',
        noticeBoard: 'Notices',
        studyMaterial: 'Course Material',
    },
    madrassa: {
        class: 'Level', classes: 'Levels',
        section: 'Group', sections: 'Groups',
        subject: 'Subject', subjects: 'Subjects',
        teacher: 'Ustad', teachers: 'Asatiza',
        student: 'Talib', students: 'Tulaba',
        exam: 'Imtihan', exams: 'Imtihanat',
        fee: 'Fee', fees: 'Fees',
        homework: 'Sabaq',
        attendance: 'Hazri',
        timetable: 'Schedule',
        marks: 'Marks',
        result: 'Result', results: 'Results',
        guardian: 'Guardian', guardians: 'Guardians',
        noticeBoard: 'Announcements',
        studyMaterial: 'Study Material',
    },
};

export const getTerms = (mode = 'school') => {
    return TERMS[mode] || TERMS.school;
};

export const getModeIcon = (mode = 'school') => {
    const icons = {
        school: '🏫',
        academy: '📚',
        college: '🎓',
        madrassa: '🕌',
    };
    return icons[mode] || icons.school;
};

export const getModeName = (mode = 'school') => {
    const names = {
        school: 'School',
        academy: 'Academy / Coaching',
        college: 'College',
        madrassa: 'Madrassa',
    };
    return names[mode] || names.school;
};

// ✅ React Hook — mode-based terms
export const useTerms = () => {
    const { user } = useAuth();
    const mode = user?.institute_type || 'school';
    return TERMS[mode] || TERMS.school;
};

export const AVAILABLE_MODES = [
    { value: 'school', label: '🏫 School', description: 'Class, Section, Teacher' },
    { value: 'academy', label: '📚 Academy / Coaching', description: 'Batch, Slot, Instructor' },
    { value: 'college', label: '🎓 College', description: 'Program, Group, Faculty' },
    { value: 'madrassa', label: '🕌 Madrassa', description: 'Level, Group, Ustad' },
];