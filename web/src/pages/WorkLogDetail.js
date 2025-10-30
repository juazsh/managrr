import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import workLogService from '../services/workLogService';

const WorkLogDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [workLog, setWorkLog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  useEffect(() => {
    fetchWorkLog();
  }, [id]);

  const fetchWorkLog = async () => {
    try {
      setLoading(true);
      const data = await workLogService.getWorkLogById(id);
      setWorkLog(data);
    } catch (err) {
      setError('Failed to load work log details');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const calculateHours = (checkIn, checkOut) => {
    if (!checkOut) return 'In Progress';
    const diff = new Date(checkOut) - new Date(checkIn);
    const hours = (diff / (1000 * 60 * 60)).toFixed(2);
    return `${hours} hours`;
  };

  const handleBack = () => {
    navigate('/contractor/work-logs');
  };

  const openPhotoModal = (photoUrl) => {
    setSelectedPhoto(photoUrl);
  };

  const closePhotoModal = () => {
    setSelectedPhoto(null);
  };

  if (loading) {
    return (
      <div className="max-w-[1200px] mx-auto p-6">
        <div className="text-center py-12 px-4 text-lg text-text-light">Loading work log details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-[1200px] mx-auto p-6">
        <div className="text-center py-12 px-4 text-error text-lg">
          {error}
          <button onClick={handleBack} className="py-3 px-6 bg-transparent text-text border-2 border-border rounded-md cursor-pointer text-base font-semibold transition-all duration-200">
            Back to Work Logs
          </button>
        </div>
      </div>
    );
  }

  if (!workLog) {
    return (
      <div className="max-w-[1200px] mx-auto p-6">
        <div className="text-center py-12 px-4 text-error text-lg">Work log not found</div>
      </div>
    );
  }

  return (
    <div className="max-w-[1200px] mx-auto p-6">
      <div className="mb-6">
        <button onClick={handleBack} className="py-3 px-6 bg-transparent text-text border-2 border-border rounded-md cursor-pointer text-base font-semibold transition-all duration-200">
          ← Back to Work Logs
        </button>
      </div>

      <div className="bg-white p-8 rounded-lg shadow-md border border-border-light">
        <h1 className="text-3xl font-bold text-text m-0 mb-8 tracking-tight">Work Log Details</h1>

        <div className="mb-8 p-6 bg-background-light rounded-md border border-border-light">
          <div className="flex justify-between py-3.5 border-b border-border-light gap-4 flex-wrap">
            <span className="text-base text-text-light font-semibold">Employee:</span>
            <span className="text-base text-text font-semibold text-right">{workLog.employee_name}</span>
          </div>
          <div className="flex justify-between py-3.5 border-b border-border-light gap-4 flex-wrap">
            <span className="text-base text-text-light font-semibold">Project:</span>
            <span className="text-base text-text font-semibold text-right">{workLog.project_title}</span>
          </div>
          <div className="flex justify-between py-3.5 border-b border-border-light gap-4 flex-wrap">
            <span className="text-base text-text-light font-semibold">Hours Worked:</span>
            <span className="text-base text-text font-semibold text-right">
              {calculateHours(workLog.check_in_time, workLog.check_out_time)}
            </span>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-bold text-text mb-4 tracking-tight">Time Log</h2>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,300px),1fr))] gap-4">
            <div className="p-6 bg-background-light rounded-md border-2 border-primary">
              <div className="text-sm text-text-light font-bold uppercase mb-2 tracking-wider">Check-in</div>
              <div className="text-lg text-text font-semibold mb-3.5 leading-snug">{formatDateTime(workLog.check_in_time)}</div>
              {workLog.check_in_latitude && workLog.check_in_longitude && (
                <div className="text-sm text-text-light flex flex-col gap-2">
                  📍 GPS: {workLog.check_in_latitude.toFixed(6)}, {workLog.check_in_longitude.toFixed(6)}
                  <a
                    href={`https://www.google.com/maps?q=${workLog.check_in_latitude},${workLog.check_in_longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary no-underline font-semibold text-sm transition-colors duration-200"
                  >
                    View on Map
                  </a>
                </div>
              )}
            </div>

            {workLog.check_out_time && (
              <div className="p-6 bg-background-light rounded-md border-2 border-primary">
                <div className="text-sm text-text-light font-bold uppercase mb-2 tracking-wider">Check-out</div>
                <div className="text-lg text-text font-semibold mb-3.5 leading-snug">{formatDateTime(workLog.check_out_time)}</div>
                {workLog.check_out_latitude && workLog.check_out_longitude && (
                  <div className="text-sm text-text-light flex flex-col gap-2">
                    📍 GPS: {workLog.check_out_latitude.toFixed(6)}, {workLog.check_out_longitude.toFixed(6)}
                    <a
                      href={`https://www.google.com/maps?q=${workLog.check_out_latitude},${workLog.check_out_longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary no-underline font-semibold text-sm transition-colors duration-200"
                    >
                      View on Map
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="mb-4">
          <h2 className="text-xl font-bold text-text mb-4 tracking-tight">Photos</h2>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,300px),1fr))] gap-4">
            {workLog.check_in_photo_url && (
              <div className="border border-border rounded-md overflow-hidden shadow-sm transition-all duration-200">
                <div className="p-4 bg-background-light flex justify-between items-center border-b border-border-light">
                  <span className="text-sm font-semibold text-text">Check-in Photo</span>
                  <span className="text-sm text-text-light">
                    {new Date(workLog.check_in_time).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                <img
                  src={workLog.check_in_photo_url}
                  alt="Check-in"
                  className="w-full h-[400px] object-cover cursor-pointer transition-transform duration-200"
                  onClick={() => openPhotoModal(workLog.check_in_photo_url)}
                />
              </div>
            )}

            {workLog.check_out_photo_url && (
              <div className="border border-border rounded-md overflow-hidden shadow-sm transition-all duration-200">
                <div className="p-4 bg-background-light flex justify-between items-center border-b border-border-light">
                  <span className="text-sm font-semibold text-text">Check-out Photo</span>
                  <span className="text-sm text-text-light">
                    {new Date(workLog.check_out_time).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                <img
                  src={workLog.check_out_photo_url}
                  alt="Check-out"
                  className="w-full h-[400px] object-cover cursor-pointer transition-transform duration-200"
                  onClick={() => openPhotoModal(workLog.check_out_photo_url)}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {selectedPhoto && (
        <div className="fixed top-0 left-0 right-0 bottom-0 bg-black/95 flex items-center justify-center z-[1000] p-4" onClick={closePhotoModal}>
          <div className="relative max-w-[90vw] max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            <button className="absolute top-[-3rem] right-0 bg-none border-none text-white text-5xl cursor-pointer font-light leading-none transition-opacity duration-200" onClick={closePhotoModal}>
              ×
            </button>
            <img src={selectedPhoto} alt="Full size" className="max-w-full max-h-[90vh] object-contain rounded-md" />
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkLogDetail;