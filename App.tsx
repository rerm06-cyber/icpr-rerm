import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { CourseView } from './components/CourseView';
import { AdminCourseBuilder } from './components/AdminCourseBuilder';
import { ProfessorWorkspace } from './components/ProfessorWorkspace';
import { CourseOnboarding } from './components/CourseOnboarding';
import { Header } from './components/Header';
import { supabase } from './services/supabaseClient';
import type { Course, Lesson, ProgressData, User } from './types';

export default function App() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [progressData, setProgressData] = useState<ProgressData>({});
  const [isOnboardingVisible, setIsOnboardingVisible] = useState(false);
  const [user, setUser] = useState<User>({ name: 'Admin User', role: 'admin' });
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const { data, error } = await supabase
          .from('courses')
          .select('*')
          .order('term', { ascending: true });

        if (error) throw error;
        
        // In a real app with proper foreign keys, you could do this in one query.
        // Here, we simulate the joins for resources.
        const populatedCourses = await Promise.all(
          (data as Course[]).map(async (course) => {
            const { data: resources } = await supabase
              .from('lesson_resources')
              .select('*')
              .eq('course_code', course.code);
            
            course.modules.forEach(module => {
              module.units.forEach(unit => {
                unit.lessons.forEach(lesson => {
                  lesson.resources = (resources || []).filter(r => r.lesson_id === lesson.id);
                });
              });
            });
            return course;
          })
        );
        setCourses(populatedCourses);
        setError(null);
      } catch (err: any) {
        console.error('Error fetching courses:', err);
        setError(`Failed to load course data: ${err.message}. Please check your Supabase connection and configuration.`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const handleSelectCourse = useCallback((course: Course) => {
    if (!progressData[course.code]?.started && user.role === 'student') {
      setSelectedCourse(course);
      setIsOnboardingVisible(true);
    } else {
      setSelectedCourse(course);
      if (user.role === 'student') {
        setSelectedLesson(course.modules[0]?.units[0]?.lessons[0] || null);
      }
    }
  }, [progressData, user.role]);
  
  const handleStartCourse = useCallback((course: Course) => {
    setProgressData(prev => ({
      ...prev,
      [course.code]: {
        started: true,
        viewedLessons: prev[course.code]?.viewedLessons || new Set(),
      }
    }));
    setIsOnboardingVisible(false);
    setSelectedLesson(course.modules[0]?.units[0]?.lessons[0] || null);
  }, []);

  const handleSelectLesson = useCallback((lesson: Lesson) => {
    setSelectedLesson(lesson);
    if (selectedCourse && user.role === 'student') {
      setProgressData(prev => {
        const newViewedLessons = new Set(prev[selectedCourse.code]?.viewedLessons);
        newViewedLessons.add(lesson.id);
        return {
          ...prev,
          [selectedCourse.code]: {
            ...prev[selectedCourse.code],
            started: true,
            viewedLessons: newViewedLessons,
          }
        };
      });
    }
  }, [selectedCourse, user.role]);
  
  const handleGoToDashboard = useCallback(() => {
    setSelectedCourse(null);
    setSelectedLesson(null);
  }, []);

  const totalLessonsByCourse = useMemo(() => {
    const counts: { [courseCode: string]: number } = {};
    courses.forEach(course => {
      let lessonCount = 0;
      course.modules.forEach(module => {
        module.units.forEach(unit => {
          lessonCount += unit.lessons.length;
        });
      });
      counts[course.code] = lessonCount;
    });
    return counts;
  }, [courses]);
  
  const handleRoleChange = (role: User['role']) => {
    const nameMap = {
      student: 'Student User',
      professor: 'Professor Smith',
      admin: 'Admin User'
    };
    setUser({ name: nameMap[role], role });
    handleGoToDashboard();
  };
  
  const handleCourseUpdate = (updatedCourse: Course) => {
      setCourses(prevCourses => prevCourses.map(c => c.code === updatedCourse.code ? updatedCourse : c));
      setSelectedCourse(updatedCourse);
  };
  
  const renderMainContent = () => {
    if (!selectedCourse) {
       return (
         <Dashboard 
            courses={courses}
            onSelectCourse={handleSelectCourse} 
            progressData={progressData}
            totalLessonsByCourse={totalLessonsByCourse}
            user={user}
          />
       );
    }

    switch(user.role) {
      case 'admin':
        return <AdminCourseBuilder key={selectedCourse.code} course={selectedCourse} onCourseUpdate={handleCourseUpdate} />;
      case 'professor':
         return <ProfessorWorkspace key={selectedCourse.code} course={selectedCourse} onCourseUpdate={handleCourseUpdate} />;
      case 'student':
      default:
        return (
          <CourseView 
            course={selectedCourse} 
            onCourseUpdate={handleCourseUpdate}
            selectedLesson={selectedLesson}
            onSelectLesson={handleSelectLesson}
            progressData={progressData[selectedCourse.code]}
            totalLessons={totalLessonsByCourse[selectedCourse.code]}
            user={user}
          />
        );
    }
  };


  if (isLoading) {
    return <div className="flex h-screen items-center justify-center text-gray-500">Loading course data...</div>;
  }
  
  if (error) {
    return (
        <div className="flex h-screen items-center justify-center bg-red-50 text-red-700 p-8 text-center">
            <div>
                <h1 className="text-2xl font-bold mb-2">Application Error</h1>
                <p className="max-w-xl">{error}</p>
                <p className="mt-4 text-sm text-gray-600">This might be due to a network issue, or incorrect Supabase/Gemini API keys. Please check your environment configuration and the browser console for more details.</p>
            </div>
        </div>
    );
  }

  if (courses.length === 0 && !isLoading) {
     return (
        <div className="flex h-screen items-center justify-center text-gray-500 p-8 text-center">
            <div>
                <h1 className="text-2xl font-bold mb-2">No Courses Available</h1>
                <p>The course database appears to be empty.</p>
                <p className="mt-4 text-sm text-gray-600">If you are an administrator, please check your Supabase data seeding process.</p>
            </div>
        </div>
    );
  }

  return (
    <div className="flex h-screen font-sans bg-gray-50">
       {isOnboardingVisible && selectedCourse && (
        <CourseOnboarding 
          course={selectedCourse} 
          onStartCourse={() => handleStartCourse(selectedCourse)}
          onClose={() => setIsOnboardingVisible(false)}
        />
      )}
      <Sidebar 
        courses={courses} 
        onSelectCourse={handleSelectCourse}
        selectedCourse={selectedCourse}
        onGoToDashboard={handleGoToDashboard}
        user={user}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />
      <div className={`flex-1 flex flex-col transition-all duration-300 ${isSidebarCollapsed ? 'ml-20' : 'ml-72'}`}>
        <Header 
            selectedCourse={selectedCourse}
            user={user}
            onRoleChange={handleRoleChange}
        />
        <main className="flex-1 overflow-y-auto">
          {renderMainContent()}
        </main>
      </div>
    </div>
  );
}