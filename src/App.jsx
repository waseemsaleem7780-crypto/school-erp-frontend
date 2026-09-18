import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';
import Login from './pages/auth/Login';
import Layout from './components/layout/Layout';
import ChatWidget from './components/ChatWidget';

// Super Admin Pages
import SuperAdminSchools from './pages/superadmin/Schools';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import Students from './pages/admin/Students';
import Classes from './pages/admin/Classes';
import Sections from './pages/admin/Sections';
import Subjects from './pages/admin/Subjects';
import Attendance from './pages/admin/Attendance';
import Fees from './pages/admin/Fees';
import Teachers from './pages/admin/Teachers';
import Homework from './pages/admin/Homework';
import Assignments from './pages/admin/Assignments';
import Exams from './pages/admin/Exams';
import Results from './pages/admin/Results';
import NoticeBoard from './pages/admin/NoticeBoard';
import StudyMaterial from './pages/admin/StudyMaterial';
import Guardians from './pages/admin/Guardians';
import Timetable from './pages/admin/Timetable';
import Concession from './pages/admin/Concession';
import AcademicYears from './pages/admin/AcademicYears';
import SchoolSettings from './pages/admin/SchoolSettings';
import Analytics from './pages/admin/Analytics';

// Teacher Pages
import TeacherDashboard from './pages/teacher/Dashboard';
import MyClasses from './pages/teacher/MyClasses';
import MyStudents from './pages/teacher/MyStudents';
import MarkAttendance from './pages/teacher/MarkAttendance';
import TeacherHomework from './pages/teacher/Homework';
import TeacherAssignments from './pages/teacher/Assignments';
import MarksEntry from './pages/teacher/MarksEntry';
import TeacherTimetable from './pages/teacher/Timetable';
import TeacherStudyMaterial from './pages/teacher/StudyMaterial';
import TeacherNoticeBoard from './pages/teacher/NoticeBoard';

// Student Pages
import StudentDashboard from './pages/student/Dashboard';
import MyAttendance from './pages/student/MyAttendance';
import MyHomework from './pages/student/MyHomework';
import MyAssignments from './pages/student/MyAssignments';
import MyTimetable from './pages/student/MyTimetable';
import MyResults from './pages/student/MyResults';
import MyFees from './pages/student/MyFees';
import StudentStudyMaterial from './pages/student/StudyMaterial';
import StudentNoticeBoard from './pages/student/NoticeBoard';

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Toaster position="top-right" />
                <Routes>
                    {/* Public Login Routes */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/:schoolSlug/login" element={<Login />} />

                    {/* Super Admin Routes */}
                    <Route element={<ProtectedRoute allowedRoles={['super_admin']} />}>
                        <Route element={<Layout />}>
                            <Route path="/superadmin/schools" element={<SuperAdminSchools />} />
                        </Route>
                    </Route>

                    {/* Admin Routes (with school slug) */}
                    <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                        <Route element={<Layout />}>
                            <Route path="/:schoolSlug/admin/dashboard" element={<AdminDashboard />} />
                            <Route path="/:schoolSlug/admin/students" element={<Students />} />
                            <Route path="/:schoolSlug/admin/classes" element={<Classes />} />
                            <Route path="/:schoolSlug/admin/sections" element={<Sections />} />
                            <Route path="/:schoolSlug/admin/subjects" element={<Subjects />} />
                            <Route path="/:schoolSlug/admin/teachers" element={<Teachers />} />
                            <Route path="/:schoolSlug/admin/attendance" element={<Attendance />} />
                            <Route path="/:schoolSlug/admin/fees" element={<Fees />} />
                            <Route path="/:schoolSlug/admin/concession" element={<Concession />} />
                            <Route path="/:schoolSlug/admin/homework" element={<Homework />} />
                            <Route path="/:schoolSlug/admin/assignments" element={<Assignments />} />
                            <Route path="/:schoolSlug/admin/exams" element={<Exams />} />
                            <Route path="/:schoolSlug/admin/results" element={<Results />} />
                            <Route path="/:schoolSlug/admin/notice-board" element={<NoticeBoard />} />
                            <Route path="/:schoolSlug/admin/study-material" element={<StudyMaterial />} />
                            <Route path="/:schoolSlug/admin/guardians" element={<Guardians />} />
                            <Route path="/:schoolSlug/admin/timetable" element={<Timetable />} />
                            <Route path="/:schoolSlug/admin/academic-years" element={<AcademicYears />} />
                            <Route path="/:schoolSlug/admin/settings" element={<SchoolSettings />} />
                            <Route path="/:schoolSlug/admin/analytics" element={<Analytics />} />
                        </Route>
                    </Route>

                    {/* Admin Routes (without school slug — fallback) */}
                    <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                        <Route element={<Layout />}>
                            <Route path="/admin/dashboard" element={<AdminDashboard />} />
                            <Route path="/admin/students" element={<Students />} />
                            <Route path="/admin/classes" element={<Classes />} />
                            <Route path="/admin/sections" element={<Sections />} />
                            <Route path="/admin/subjects" element={<Subjects />} />
                            <Route path="/admin/teachers" element={<Teachers />} />
                            <Route path="/admin/attendance" element={<Attendance />} />
                            <Route path="/admin/fees" element={<Fees />} />
                            <Route path="/admin/concession" element={<Concession />} />
                            <Route path="/admin/homework" element={<Homework />} />
                            <Route path="/admin/assignments" element={<Assignments />} />
                            <Route path="/admin/exams" element={<Exams />} />
                            <Route path="/admin/results" element={<Results />} />
                            <Route path="/admin/notice-board" element={<NoticeBoard />} />
                            <Route path="/admin/study-material" element={<StudyMaterial />} />
                            <Route path="/admin/guardians" element={<Guardians />} />
                            <Route path="/admin/timetable" element={<Timetable />} />
                            <Route path="/admin/academic-years" element={<AcademicYears />} />
                            <Route path="/admin/settings" element={<SchoolSettings />} />
                            <Route path="/admin/analytics" element={<Analytics />} />
                        </Route>
                    </Route>

                    {/* Teacher Routes (without slug — fallback) */}
                    <Route element={<ProtectedRoute allowedRoles={['teacher']} />}>
                        <Route element={<Layout />}>
                            <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
                            <Route path="/teacher/my-classes" element={<MyClasses />} />
                            <Route path="/teacher/my-students" element={<MyStudents />} />
                            <Route path="/teacher/mark-attendance" element={<MarkAttendance />} />
                            <Route path="/teacher/homework" element={<TeacherHomework />} />
                            <Route path="/teacher/assignments" element={<TeacherAssignments />} />
                            <Route path="/teacher/marks-entry" element={<MarksEntry />} />
                            <Route path="/teacher/timetable" element={<TeacherTimetable />} />
                            <Route path="/teacher/study-material" element={<TeacherStudyMaterial />} />
                            <Route path="/teacher/notice-board" element={<TeacherNoticeBoard />} />
                        </Route>
                    </Route>

                    {/* ✅ Teacher Routes (with school slug) — NEW */}
                    <Route element={<ProtectedRoute allowedRoles={['teacher']} />}>
                        <Route element={<Layout />}>
                            <Route path="/:schoolSlug/teacher/dashboard" element={<TeacherDashboard />} />
                            <Route path="/:schoolSlug/teacher/my-classes" element={<MyClasses />} />
                            <Route path="/:schoolSlug/teacher/my-students" element={<MyStudents />} />
                            <Route path="/:schoolSlug/teacher/mark-attendance" element={<MarkAttendance />} />
                            <Route path="/:schoolSlug/teacher/homework" element={<TeacherHomework />} />
                            <Route path="/:schoolSlug/teacher/assignments" element={<TeacherAssignments />} />
                            <Route path="/:schoolSlug/teacher/marks-entry" element={<MarksEntry />} />
                            <Route path="/:schoolSlug/teacher/timetable" element={<TeacherTimetable />} />
                            <Route path="/:schoolSlug/teacher/study-material" element={<TeacherStudyMaterial />} />
                            <Route path="/:schoolSlug/teacher/notice-board" element={<TeacherNoticeBoard />} />
                        </Route>
                    </Route>

                    {/* Student Routes (without slug — fallback) */}
                    <Route element={<ProtectedRoute allowedRoles={['student']} />}>
                        <Route element={<Layout />}>
                            <Route path="/student/dashboard" element={<StudentDashboard />} />
                            <Route path="/student/my-attendance" element={<MyAttendance />} />
                            <Route path="/student/my-homework" element={<MyHomework />} />
                            <Route path="/student/my-assignments" element={<MyAssignments />} />
                            <Route path="/student/my-timetable" element={<MyTimetable />} />
                            <Route path="/student/my-results" element={<MyResults />} />
                            <Route path="/student/my-fees" element={<MyFees />} />
                            <Route path="/student/study-material" element={<StudentStudyMaterial />} />
                            <Route path="/student/notice-board" element={<StudentNoticeBoard />} />
                        </Route>
                    </Route>

                    {/* ✅ Student Routes (with school slug) — NEW */}
                    <Route element={<ProtectedRoute allowedRoles={['student']} />}>
                        <Route element={<Layout />}>
                            <Route path="/:schoolSlug/student/dashboard" element={<StudentDashboard />} />
                            <Route path="/:schoolSlug/student/my-attendance" element={<MyAttendance />} />
                            <Route path="/:schoolSlug/student/my-homework" element={<MyHomework />} />
                            <Route path="/:schoolSlug/student/my-assignments" element={<MyAssignments />} />
                            <Route path="/:schoolSlug/student/my-timetable" element={<MyTimetable />} />
                            <Route path="/:schoolSlug/student/my-results" element={<MyResults />} />
                            <Route path="/:schoolSlug/student/my-fees" element={<MyFees />} />
                            <Route path="/:schoolSlug/student/study-material" element={<StudentStudyMaterial />} />
                            <Route path="/:schoolSlug/student/notice-board" element={<StudentNoticeBoard />} />
                        </Route>
                    </Route>

                    <Route path="/" element={<Navigate to="/login" />} />
                    <Route path="*" element={<Navigate to="/login" />} />
                </Routes>
                <ChatWidget />
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;