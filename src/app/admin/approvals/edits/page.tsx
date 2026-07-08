import { getPendingEdits, approveEdit, rejectEdit } from './actions';

import { Check, X, Clock } from 'lucide-react';
import { revalidatePath } from 'next/cache';

export default async function AdminEditsApprovalsPage() {
  const pendingEdits = await getPendingEdits();

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tighter leading-none">Profile <span className="text-[#b50a0a]">Edit Approvals</span></h1>
          <p className="text-gray-400 text-xs font-bold tracking-[0.2em] mt-2 flex items-center gap-2">
            <Clock className="w-3 h-3 text-[#b50a0a]" /> Review and manage profile edit requests from managed accounts.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {pendingEdits.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <Check className="w-12 h-12 text-green-200 mx-auto mb-4" />
            <h3 className="text-lg font-bold">All caught up!</h3>
            <p className="text-sm">No pending profile edits to review.</p>
          </div>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-200 text-xs font-bold text-gray-500 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Profile</th>
                <th className="px-6 py-4">Field</th>
                <th className="px-6 py-4">Old Value</th>
                <th className="px-6 py-4">New Value</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {pendingEdits.map((edit: any) => (
                <tr key={edit.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-gray-900">{edit.profile?.first_name} {edit.profile?.last_name}</div>
                    <div className="text-xs text-gray-500 uppercase">{edit.profile?.role}</div>
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-900">
                    {edit.field_name}
                  </td>
                  <td className="px-6 py-4 text-red-600 line-through">
                    {edit.old_value || 'None'}
                  </td>
                  <td className="px-6 py-4 text-green-600 font-bold">
                    {edit.new_value || 'None'}
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    {new Date(edit.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <form className="flex flex-col items-end gap-2">
                      <input type="hidden" name="editId" value={edit.id} />
                      <div className="flex justify-end gap-2">
                        <button 
                          formAction={async (formData: FormData) => {
                            'use server';
                            await approveEdit(formData.get('editId') as string);
                          }}
                          className="px-3 py-1.5 bg-green-50 text-green-700 hover:bg-green-100 rounded-lg text-xs font-bold transition-colors flex items-center gap-1"
                        >
                          <Check className="w-3 h-3" /> Approve
                        </button>
                        <button 
                          formAction={async (formData: FormData) => {
                            'use server';
                            await rejectEdit(formData.get('editId') as string, formData.get('reason') as string);
                          }}
                          className="px-3 py-1.5 bg-red-50 text-red-700 hover:bg-red-100 rounded-lg text-xs font-bold transition-colors flex items-center gap-1"
                        >
                          <X className="w-3 h-3" /> Reject
                        </button>
                      </div>
                      <input 
                        type="text" 
                        name="reason" 
                        placeholder="Reason (if rejecting)..." 
                        className="w-48 px-2 py-1 text-xs border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500"
                      />
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
