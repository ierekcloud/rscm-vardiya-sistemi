import React, { useState } from 'react';
import { Department, StaffMember } from '../types';
import { Building2, Plus, Trash2, Edit2, Check, X } from 'lucide-react';

interface DepartmentManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  departments: Department[];
  activeDeptId: string;
  onSelectDepartment: (id: string) => void;
  onAddDepartment: (name: string) => void;
  onRenameDepartment: (id: string, newName: string) => void;
  onDeleteDepartment: (id: string) => void;
}

export const DepartmentManagerModal: React.FC<DepartmentManagerModalProps> = ({
  isOpen,
  onClose,
  departments,
  activeDeptId,
  onSelectDepartment,
  onAddDepartment,
  onRenameDepartment,
  onDeleteDepartment,
}) => {
  if (!isOpen) return null;

  const [newDeptName, setNewDeptName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeptName.trim()) return;
    onAddDepartment(newDeptName.trim());
    setNewDeptName('');
  };

  const startEdit = (dept: Department) => {
    setEditingId(dept.id);
    setEditName(dept.name);
  };

  const saveEdit = (id: string) => {
    if (editName.trim()) {
      onRenameDepartment(id, editName.trim());
    }
    setEditingId(null);
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full border border-stone-200 shadow-2xl p-6">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-stone-100">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-stone-800" />
            <h3 className="text-base font-semibold text-stone-900">Şirket Bölümleri / Departmanlar</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Yeni Bölüm Ekleme */}
        <form onSubmit={handleCreate} className="flex gap-2 mb-4">
          <input
            type="text"
            placeholder="Yeni bölüm adı (örn: Danışma & Güvenlik)"
            value={newDeptName}
            onChange={(e) => setNewDeptName(e.target.value)}
            className="flex-1 text-xs px-3 py-2 rounded-lg border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-900"
          />
          <button
            type="submit"
            className="inline-flex items-center gap-1 px-3 py-2 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold rounded-lg shrink-0 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Bölüm Ekle
          </button>
        </form>

        {/* Bölüm Listesi */}
        <div className="space-y-2 max-h-60 overflow-y-auto mb-6">
          {departments.map((dept) => {
            const isActive = dept.id === activeDeptId;
            const isEditing = editingId === dept.id;

            return (
              <div
                key={dept.id}
                className={`p-3 rounded-xl border flex items-center justify-between transition-colors ${
                  isActive
                    ? 'border-stone-900 bg-stone-50'
                    : 'border-stone-200 hover:bg-stone-50/50'
                }`}
              >
                {isEditing ? (
                  <div className="flex items-center gap-2 flex-1 mr-2">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="text-xs px-2 py-1 border rounded w-full focus:outline-none"
                      autoFocus
                    />
                    <button
                      onClick={() => saveEdit(dept.id)}
                      className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => {
                      onSelectDepartment(dept.id);
                      onClose();
                    }}
                    className="flex-1 cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-stone-900">{dept.name}</span>
                      {isActive && (
                        <span className="text-[10px] bg-stone-900 text-white px-2 py-0.5 rounded-full font-medium">
                          Aktif Bölüm
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-stone-500">
                      {dept.staff.length} Personel (4 Grup)
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-1">
                  {!isEditing && (
                    <button
                      onClick={() => startEdit(dept)}
                      className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg"
                      title="Yeniden Adlandır"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                  {departments.length > 1 && (
                    <button
                      onClick={() => onDeleteDepartment(dept.id)}
                      className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                      title="Bölümü Sil"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg"
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
};
