import React from 'react';
import type { Course, User } from '../types';
import { ICPRIcon, UserIcon, AdminIcon, ProfessorIcon } from './Icons';

interface HeaderProps {
    selectedCourse: Course | null;
    user: User;
    onRoleChange: (role: User['role']) => void;
}

const roleIcons: Record<User['role'], React.FC<{className: string}>> = {
    student: UserIcon,
    professor: ProfessorIcon,
    admin: AdminIcon,
};

export const Header: React.FC<HeaderProps> = ({ selectedCourse, user, onRoleChange }) => {
    const CurrentRoleIcon = roleIcons[user.role];

    return (
        <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 p-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
              <ICPRIcon className="w-8 h-8"/>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                {selectedCourse ? selectedCourse.title : 'AI Student Portal'}
              </h1>
              <p className="text-sm text-gray-500">
                {selectedCourse ? selectedCourse.code : 'Grado Asociado en Inteligencia Artificial (ASIA)'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
                <CurrentRoleIcon className="w-6 h-6 text-gray-500" />
                <span className="text-sm font-medium text-gray-800">{user.name}</span>
            </div>
            <select 
                value={user.role}
                onChange={(e) => onRoleChange(e.target.value as User['role'])}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2"
            >
                <option value="student">Student</option>
                <option value="professor">Professor</option>
                <option value="admin">Admin</option>
            </select>
          </div>
        </header>
    );
};