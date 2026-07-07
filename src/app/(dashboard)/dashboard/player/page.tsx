import { UploadCloud, CheckCircle } from 'lucide-react';

export default function PlayerDashboard() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Player Dashboard</h1>
        <span className="bg-yellow-100 text-yellow-800 text-sm font-medium px-2.5 py-1 rounded-full flex items-center gap-1 border border-yellow-200">
          <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
          Profile Pending
        </span>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">Profile Information</h2>
        <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-base font-medium text-gray-700 mb-1">First Name</label>
            <input type="text" className="w-full rounded-lg border-gray-300 border px-4 py-2 focus:ring-2 focus:ring-primary focus:border-primary outline-none" placeholder="John" />
          </div>
          <div>
            <label className="block text-base font-medium text-gray-700 mb-1">Last Name</label>
            <input type="text" className="w-full rounded-lg border-gray-300 border px-4 py-2 focus:ring-2 focus:ring-primary focus:border-primary outline-none" placeholder="Doe" />
          </div>
          <div>
            <label className="block text-base font-medium text-gray-700 mb-1">Position</label>
            <select className="w-full rounded-lg border-gray-300 border px-4 py-2 focus:ring-2 focus:ring-primary focus:border-primary outline-none bg-white">
              <option>Striker</option>
              <option>Midfielder</option>
              <option>Defender</option>
              <option>Goalkeeper</option>
            </select>
          </div>
          <div>
            <label className="block text-base font-medium text-gray-700 mb-1">Country</label>
            <input type="text" className="w-full rounded-lg border-gray-300 border px-4 py-2 focus:ring-2 focus:ring-primary focus:border-primary outline-none" placeholder="Nigeria" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-base font-medium text-gray-700 mb-1">Bio & Experience</label>
            <textarea rows={4} className="w-full rounded-lg border-gray-300 border px-4 py-2 focus:ring-2 focus:ring-primary focus:border-primary outline-none" placeholder="Tell scouts about your journey..."></textarea>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">Media & Highlights</h2>
        <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 md:p-8 hover:bg-gray-50 transition-colors cursor-pointer flex flex-col items-center justify-center text-center">
          <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-3">
            <UploadCloud className="w-6 h-6 text-primary" />
          </div>
          <p className="text-base font-medium text-gray-900">Click to upload video highlights</p>
          <p className="text-sm text-gray-500 mt-1">MP4, WebM up to 50MB</p>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <button className="px-6 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors">
          Save Draft
        </button>
        <button className="px-6 py-2 bg-primary text-white font-medium rounded-lg hover:bg-primary-dark transition-colors flex items-center gap-2">
          <CheckCircle className="w-4 h-4" />
          Submit for Review
        </button>
      </div>
    </div>
  );
}
