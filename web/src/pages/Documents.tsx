import {useState, useEffect} from 'react';
import {useLocation, useNavigate, Routes, Route} from 'react-router-dom';
import {useQuery} from '@tanstack/react-query';
import {listResumes, listTemplates} from '../api';

export default function Documents() {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'resumes' | 'cover-letters'>(
    'resumes',
  );

  // Fetch data
  const {data: resumes = [], isLoading: resumesLoading} = useQuery({
    queryKey: ['resumes'],
    queryFn: listResumes,
  });

  const {data: templates = [], isLoading: templatesLoading} = useQuery({
    queryKey: ['templates'],
    queryFn: listTemplates,
  });

  // Set active tab based on current route
  useEffect(() => {
    if (location.pathname.includes('/cover-letters')) {
      setActiveTab('cover-letters');
    } else {
      setActiveTab('resumes');
    }
  }, [location.pathname]);

  const handleTabChange = (tab: 'resumes' | 'cover-letters') => {
    setActiveTab(tab);
    navigate(`/documents/${tab === 'resumes' ? 'resumes' : 'cover-letters'}`);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="border-b border-gray-700 bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-white">Documents</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/')}
                className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
              >
                ← Back to Jobs
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-700 bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            <button
              onClick={() => handleTabChange('resumes')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'resumes'
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-gray-300 hover:text-gray-200 hover:border-gray-300'
              }`}
            >
              📄 Resumes
            </button>
            <button
              onClick={() => handleTabChange('cover-letters')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'cover-letters'
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-gray-300 hover:text-gray-200 hover:border-gray-300'
              }`}
            >
              ✉️ Cover Letters
            </button>
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Routes>
          <Route
            path="/resumes"
            element={
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold">Resumes</h2>
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md">
                    + Add Resume
                  </button>
                </div>
                {resumesLoading ? (
                  <div className="text-center py-8">
                    <div className="text-gray-400">Loading resumes...</div>
                  </div>
                ) : resumes.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-gray-400">No resumes found</div>
                    <p className="text-gray-500 mt-2">
                      Get started by adding your first resume
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {resumes.map((resume) => (
                      <div
                        key={resume.id}
                        className="bg-gray-800 border border-gray-700 rounded-lg p-4 hover:border-gray-600 transition-colors"
                      >
                        <h3 className="font-medium text-white mb-2">
                          {resume.name}
                        </h3>
                        <p className="text-gray-400 text-sm mb-3">
                          Resume file
                        </p>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>
                            Created:{' '}
                            {new Date(resume.createdAt).toLocaleDateString()}
                          </span>
                          <span>File</span>
                        </div>
                        <div className="flex gap-2 mt-3">
                          <button className="text-blue-400 hover:text-blue-300 text-sm">
                            Edit
                          </button>
                          <button className="text-red-400 hover:text-red-300 text-sm">
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            }
          />
          <Route
            path="/cover-letters"
            element={
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold">Cover Letters</h2>
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md">
                    + Add Template
                  </button>
                </div>
                {templatesLoading ? (
                  <div className="text-center py-8">
                    <div className="text-gray-400">Loading templates...</div>
                  </div>
                ) : templates.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-gray-400">
                      No cover letter templates found
                    </div>
                    <p className="text-gray-500 mt-2">
                      Get started by adding your first template
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {templates.map((template) => (
                      <div
                        key={template.id}
                        className="bg-gray-800 border border-gray-700 rounded-lg p-4 hover:border-gray-600 transition-colors"
                      >
                        <h3 className="font-medium text-white mb-2">
                          {template.name}
                        </h3>
                        <p className="text-gray-400 text-sm mb-3">
                          Cover letter template
                        </p>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>
                            Created:{' '}
                            {new Date(template.createdAt).toLocaleDateString()}
                          </span>
                          <span>Template</span>
                        </div>
                        <div className="flex gap-2 mt-3">
                          <button className="text-blue-400 hover:text-blue-300 text-sm">
                            Edit
                          </button>
                          <button className="text-red-400 hover:text-red-300 text-sm">
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            }
          />
          {/* Default route - redirect to resumes */}
          <Route
            path="*"
            element={
              <div className="text-center py-8">
                <div className="text-gray-400">Redirecting to resumes...</div>
              </div>
            }
          />
        </Routes>
      </div>
    </div>
  );
}
