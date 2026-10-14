import { useState, useEffect, useRef } from 'react';
import { 
  HiVideoCamera, HiPlus, HiTrash, HiCheckCircle, 
  HiEye, HiPencilAlt, HiUpload, HiPlay
} from 'react-icons/hi';
import toast from 'react-hot-toast';
import './Admin.css';

export default function AdminVideos() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    video_url: '',
    thumbnail_url: '',
    order_index: 0,
    is_active: true
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewVideo, setPreviewVideo] = useState(null);

  const fileInputRef = useRef(null);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/showcase-videos`);
      const data = await res.json();
      if (data.success) {
        setVideos(data.videos || []);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load showcase videos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('video/')) {
        toast.error('Please select a valid video file (.mp4, .mov, .webm)');
        return;
      }
      setSelectedFile(file);
      setPreviewVideo(URL.createObjectURL(file));
    }
  };

  const handleUploadAndSave = async (e) => {
    e.preventDefault();
    if (!selectedFile && !formData.video_url) {
      toast.error('Please choose a video file or enter a video URL');
      return;
    }

    try {
      setUploading(true);
      let videoUrl = formData.video_url;

      // 1. Upload video file to Cloudinary if selected
      if (selectedFile) {
        const uploadData = new FormData();
        uploadData.append('video', selectedFile);

        const uploadRes = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/showcase-videos/upload`, {
          method: 'POST',
          body: uploadData
        });
        const uploadResult = await uploadRes.json();
        if (!uploadResult.success) {
          throw new Error(uploadResult.error || 'Video upload failed');
        }
        videoUrl = uploadResult.url;
      }

      // 2. Save video record in database
      const saveRes = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/showcase-videos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          video_url: videoUrl
        })
      });
      const saveResult = await saveRes.json();

      if (saveResult.success) {
        toast.success('Video uploaded and published successfully!');
        setShowAddModal(false);
        setSelectedFile(null);
        setPreviewVideo(null);
        setFormData({
          title: '',
          description: '',
          video_url: '',
          thumbnail_url: '',
          order_index: 0,
          is_active: true
        });
        fetchVideos();
      } else {
        toast.error(saveResult.error || 'Failed to save video');
      }
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'An error occurred during upload');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteVideo = async (id) => {
    if (!window.confirm('Are you sure you want to delete this showcase video?')) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/showcase-videos/${id}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Video removed');
        fetchVideos();
      } else {
        toast.error('Failed to delete video');
      }
    } catch (err) {
      toast.error('Error deleting video');
    }
  };

  const toggleVideoStatus = async (video) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/showcase-videos/${video.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...video,
          is_active: !video.is_active
        })
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Video ${!video.is_active ? 'Activated' : 'Deactivated'}`);
        fetchVideos();
      }
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  return (
    <div className="admin-page-container">
      {/* Page Header */}
      <div className="admin-page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#0f172a', margin: '0 0 6px' }}>
            Showcase Videos Management
          </h1>
          <p style={{ color: '#64748b', margin: 0, fontSize: '14px' }}>
            Upload and manage videos shown on the homepage section: <em>"See how our verified professionals deliver excellence"</em>
          </p>
        </div>
        <button 
          className="admin-primary-btn" 
          onClick={() => setShowAddModal(true)}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'linear-gradient(135deg, #0284c7, #0369a1)', color: '#fff', border: 'none', padding: '12px 20px', borderRadius: '12px', fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 12px rgba(2,132,199,0.2)' }}
        >
          <HiPlus /> Upload New Video
        </button>
      </div>

      {/* Videos List / Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#64748b' }}>
          Loading videos...
        </div>
      ) : videos.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 20px', background: '#fff', borderRadius: '20px', border: '1px dashed #cbd5e1' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#f0f9ff', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: '28px' }}>
            <HiVideoCamera />
          </div>
          <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a', marginBottom: '8px' }}>No Showcase Videos Uploaded Yet</h3>
          <p style={{ color: '#64748b', maxWidth: '420px', margin: '0 auto 20px', fontSize: '14px' }}>
            Add videos of verified professionals delivering services to build customer trust on the home page.
          </p>
          <button 
            className="admin-primary-btn" 
            onClick={() => setShowAddModal(true)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#0284c7', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: '10px', fontWeight: 600, cursor: 'pointer' }}
          >
            <HiUpload /> Upload First Video
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
          {videos.map((vid) => (
            <div 
              key={vid.id} 
              style={{ 
                background: '#fff', 
                borderRadius: '18px', 
                overflow: 'hidden', 
                border: '1px solid #e2e8f0', 
                boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              {/* Video Player */}
              <div style={{ position: 'relative', width: '100%', height: '360px', background: '#0f172a' }}>
                <video 
                  src={vid.video_url} 
                  controls 
                  preload="metadata"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                />
                <span 
                  style={{ 
                    position: 'absolute', 
                    top: '12px', 
                    left: '12px', 
                    background: vid.is_active ? 'rgba(22, 101, 52, 0.85)' : 'rgba(100, 116, 139, 0.85)', 
                    color: '#fff', 
                    fontSize: '11px', 
                    fontWeight: '700', 
                    padding: '4px 10px', 
                    borderRadius: '20px',
                    backdropFilter: 'blur(4px)'
                  }}
                >
                  {vid.is_active ? '● Active on Home' : '○ Hidden'}
                </span>
              </div>

              {/* Info Body */}
              <div style={{ padding: '16px 20px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <h4 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', margin: '0 0 6px' }}>
                    {vid.title || 'Untitled Video'}
                  </h4>
                  {vid.description && (
                    <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 12px', lineHeight: '1.4' }}>
                      {vid.description}
                    </p>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #f1f5f9', paddingTop: '12px', marginTop: '12px' }}>
                  <button
                    onClick={() => toggleVideoStatus(vid)}
                    style={{ background: 'none', border: 'none', color: vid.is_active ? '#e11d48' : '#059669', fontSize: '13px', fontWeight: 600, cursor: 'pointer', padding: 0 }}
                  >
                    {vid.is_active ? 'Deactivate' : 'Activate'}
                  </button>

                  <button
                    onClick={() => handleDeleteVideo(vid.id)}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#fee2e2', color: '#b91c1c', border: 'none', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
                  >
                    <HiTrash /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {showAddModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: '#fff', width: '100%', maxWidth: '520px', borderRadius: '24px', padding: '28px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                Upload Showcase Video
              </h2>
              <button 
                onClick={() => setShowAddModal(false)}
                style={{ background: 'none', border: 'none', fontSize: '22px', color: '#94a3b8', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUploadAndSave}>
              {/* File Dropzone */}
              <div 
                onClick={() => fileInputRef.current?.click()}
                style={{ 
                  border: '2px dashed #0284c7', 
                  borderRadius: '16px', 
                  padding: '24px', 
                  textAlign: 'center', 
                  background: '#f0f9ff', 
                  cursor: 'pointer',
                  marginBottom: '16px' 
                }}
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  accept="video/*" 
                  onChange={handleFileChange} 
                  style={{ display: 'none' }} 
                />
                <HiUpload style={{ fontSize: '32px', color: '#0284c7', marginBottom: '8px' }} />
                <p style={{ margin: 0, fontWeight: '600', color: '#0369a1', fontSize: '14px' }}>
                  {selectedFile ? selectedFile.name : 'Click to select or drop video file'}
                </p>
                <span style={{ fontSize: '12px', color: '#64748b' }}>Supports MP4, MOV, WEBM (Vertical 9:16 or Standard)</span>
              </div>

              {previewVideo && (
                <div style={{ marginBottom: '16px', borderRadius: '12px', overflow: 'hidden', height: '180px', background: '#000' }}>
                  <video src={previewVideo} controls style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                </div>
              )}

              {/* Title */}
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
                  Video Title (Optional)
                </label>
                <input 
                  type="text" 
                  placeholder="e.g. Master Electrician at Work" 
                  value={formData.title} 
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '14px' }}
                />
              </div>

              {/* Description */}
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
                  Short Description (Optional)
                </label>
                <textarea 
                  rows={2}
                  placeholder="Brief context about the service in action..."
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '14px' }}
                />
              </div>

              {/* Or Direct Video URL */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
                  Or paste direct Video URL (Cloudinary / S3 / CDN)
                </label>
                <input 
                  type="url" 
                  placeholder="https://res.cloudinary.com/.../video.mp4"
                  value={formData.video_url}
                  onChange={e => setFormData({ ...formData, video_url: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '14px' }}
                />
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button 
                  type="button" 
                  onClick={() => setShowAddModal(false)}
                  style={{ padding: '10px 18px', borderRadius: '10px', border: '1px solid #cbd5e1', background: '#fff', color: '#475569', fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={uploading}
                  style={{ padding: '10px 22px', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg, #0284c7, #0369a1)', color: '#fff', fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                >
                  {uploading ? 'Uploading Video...' : 'Publish Video'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
