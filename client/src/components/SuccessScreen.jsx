export default function SuccessScreen({ result, onNewProject }) {
  const { 
    projectName, 
    taskCount, 
    meetingCount, 
    sheetUrl, 
    calendarLink, 
    emailsSent, 
    emailsFailed, 
    failedRecipients 
  } = result;

  const handleLinkClick = (url, label) => {
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Sprint Plan Generated</h1>
          <p className="text-gray-600 mt-2">{projectName}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 text-center">
            <div className="text-3xl font-bold text-blue-600">{taskCount}</div>
            <div className="text-sm text-gray-500 mt-1">Tasks Created</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 text-center">
            <div className="text-3xl font-bold text-green-600">{meetingCount}</div>
            <div className="text-sm text-gray-500 mt-1">Sync Meetings</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 text-center">
            <div className="text-3xl font-bold text-purple-600">{emailsSent}</div>
            <div className="text-sm text-gray-500 mt-1">Emails Sent</div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 mb-6">
          <h3 className="font-semibold text-gray-900 mb-4">Links</h3>
          <div className="space-y-3">
            {sheetUrl && (
              <button
                onClick={() => handleLinkClick(sheetUrl, 'Google Sheet')}
                className="w-full flex items-center gap-3 p-3 bg-blue-50 hover:bg-blue-100 rounded-lg text-left transition-colors"
              >
                <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm-2 16H8v-2h4v2zm0-4H8v-2h4v2zm0-4H8V8h4v2z"/>
                  <path fill="none" d="M14 2v6h6"/>
                </svg>
                <span className="font-medium text-gray-900">Google Sheet</span>
                <span className="ml-auto text-sm text-gray-500">{taskCount} tasks</span>
              </button>
            )}
            
            {calendarLink && (
              <button
                onClick={() => handleLinkClick(calendarLink, 'Google Calendar')}
                className="w-full flex items-center gap-3 p-3 bg-green-50 hover:bg-green-100 rounded-lg text-left transition-colors"
              >
                <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11z"/>
                </svg>
                <span className="font-medium text-gray-900">Google Calendar</span>
                <span className="ml-auto text-sm text-gray-500">{meetingCount} meetings + {taskCount} tasks</span>
              </button>
            )}
          </div>
        </div>

        {(emailsFailed > 0 || (failedRecipients && failedRecipients.length > 0)) && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-5 mb-6">
            <h3 className="font-semibold text-yellow-800 mb-2 flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              Partial Failures
            </h3>
            <p className="text-yellow-700 text-sm mb-2">{emailsFailed} email(s) failed to send</p>
            {failedRecipients && failedRecipients.length > 0 && (
              <ul className="text-sm text-yellow-700 space-y-1">
                {failedRecipients.map((recipient, i) => (
                  <li key={i} className="font-mono">{recipient}</li>
                ))}
              </ul>
            )}
            <p className="text-xs text-yellow-600 mt-2">The pipeline continued despite these failures. Check the recipients and retry if needed.</p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={onNewProject}
            className="py-3 px-6 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            New Project
          </button>
          <button
            onClick={() => window.location.href = '/dashboard'}
            className="py-3 px-6 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
          >
            View Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}