import React from 'react';

const WorkLogsSection = ({ projectId, summary, recentCheckIns, isEmployee }) => {
  return (
    <div>
      <h2 className="text-2xl font-semibold text-text mb-8">
        {isEmployee ? 'My Work Logs' : 'Work Logs'}
      </h2>

      {summary && (
        <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4 mb-8">
          <div className="flex items-center gap-4 bg-background-light p-5 rounded-md">
            <div className="w-[50px] h-[50px] rounded-full bg-amber-100 text-amber-900 flex items-center justify-center text-2xl">⏱️</div>
            <div>
              <p className="text-sm text-text-light m-0 mb-1">Hours This Week</p>
              <p className="text-2xl font-bold text-text m-0">
                {summary.total_hours_this_week?.toFixed(1) || '0'} hrs
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-background-light p-5 rounded-md">
            <div className="w-[50px] h-[50px] rounded-full bg-blue-100 text-blue-900 flex items-center justify-center text-2xl">
              👷
            </div>
            <div>
              <p className="text-sm text-text-light m-0 mb-1">
                {isEmployee ? 'You' : 'Active Employees'}
              </p>
              <p className="text-2xl font-bold text-text m-0">
                {summary.active_employees || 0}
              </p>
            </div>
          </div>
        </div>
      )}

      <h3 className="text-lg font-semibold text-text mb-4">Recent Check-ins</h3>

      {recentCheckIns && recentCheckIns.length > 0 ? (
        <div className="flex flex-col gap-4">
          {recentCheckIns.map((checkIn) => (
            <div key={checkIn.id} className="bg-white border border-border rounded-md p-5">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h4 className="text-lg font-semibold text-text m-0 mb-1">{checkIn.employee_name}</h4>
                  <p className="text-sm text-text-light m-0">
                    {new Date(checkIn.check_in_time).toLocaleString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                {checkIn.check_in_photo_url && (
                  <div className="ml-4">
                    <img
                      src={checkIn.check_in_photo_url}
                      alt={`${checkIn.employee_name} check-in`}
                      className="w-20 h-20 rounded-md object-cover cursor-pointer"
                    />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center p-12 bg-background-light rounded-md">
          <p className="text-base text-text-light">
            {isEmployee
              ? 'No check-ins yet. Check in when you arrive at the work site!'
              : 'No employee check-ins yet'
            }
          </p>
        </div>
      )}

      {isEmployee && (
        <div className="mt-6 p-4 bg-blue-50 rounded-md">
          <p className="m-0 text-sm text-blue-900">
            💡 Use the mobile app to check in and out of work
          </p>
        </div>
      )}
    </div>
  );
};

export default WorkLogsSection;