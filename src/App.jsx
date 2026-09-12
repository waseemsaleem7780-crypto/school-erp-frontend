import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/auth/Login';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import Classes from './pages/Classes';
import Sections from './pages/Sections';
import Subjects from './pages/Subjects';
import Attendance from './pages/Attendance';
import Fees from './pages/Fees';
import Teachers from './pages/Teachers';
import Homework from './pages/Homework';
import Exams from './pages/Exams';
import Results from './pages/Results';
import NoticeBoard from './pages/NoticeBoard';
import StudyMaterial from './pages/StudyMaterial';
import Guardians from './pages/Guardians';
import SchoolSettings from './pages/SchoolSettings';
import AcademicYears from './pages/AcademicYears';
import Concession from './pages/Concession';
import Assignments from './pages/Assignments';
import Timetable from './pages/Timetable';

// routes ke andar add karo:


// routes ke andar add karo:

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/students" element={<Students />} />
            <Route path="/classes" element={<Classes />} />
            <Route path="/sections" element={<Sections />} />
            <Route path="/subjects" element={<Subjects />} />
            <Route path="/attendance" element={<Attendance />} />
            <Route path="/fees" element={<Fees />} />
            <Route path="/teachers" element={<Teachers />} />
            <Route path="/homework" element={<Homework />} />
            <Route path="/exams" element={<Exams />} />
            <Route path="/results" element={<Results />} />
            <Route path="/notice-board" element={<NoticeBoard />} />
            <Route path="/study-material" element={<StudyMaterial />} />
            <Route path="/guardians" element={<Guardians />} />
            <Route path="/settings" element={<SchoolSettings />} />
            <Route path="/academic-years" element={<AcademicYears />} />
            <Route path="/concession" element={<Concession />} />
            <Route path="/assignments" element={<Assignments />} />
            <Route path="/timetable" element={<Timetable />} />
          </Route>
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;