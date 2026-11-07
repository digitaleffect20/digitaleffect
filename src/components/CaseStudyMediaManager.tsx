import React, { useState, useRef } from 'react';
import { AgencyDataState, CaseStudy, CaseStudyCreative, CaseStudyVideo, PageRoute } from '../types';
import { 
  getCaseStudyCreatives, 
  getCaseStudyVideos, 
  parseVideoUrl, 
  compressImageFile, 
  readVideoFileAsDataUrl,
  DEFAULT_CREATIVES_BY_CASE_STUDY
} from '../utils/caseStudyMedia';
import { 
  Image as ImageIcon, 
  Film, 
  Upload, 
  Link as LinkIcon, 
  Trash2, 
  Edit3, 
  Plus, 
  Check, 
  X, 
  ExternalLink, 
  Sparkles, 
  Eye, 
  Maximize2, 
  Save, 
  Play, 
  Layers, 
  CheckCircle2, 
  AlertCircle,
  FileText,
  Star,
  UploadCloud,
  ListChecks,
  RotateCcw,
  CheckCheck,
  Wand2
} from 'lucide-react';

export interface BatchStagedItem {
  id: string;
  fileName: string;
  dataUrl: string;
  title: string;
  titleEn: string;
  tag: string;
  tagEn: string;
  desc: string;
  descEn: string;
  status: 'pending' | 'compressing' | 'analyzing' | 'ready' | 'error';
  errorMessage?: string;
}

interface CaseStudyMediaManagerProps {
  data: AgencyDataState;
  updateCaseStudy: (caseStudy: CaseStudy) => void;
  isAr: boolean;
  showNotice: (msg: string) => void;
  setCurrentPage: (page: PageRoute) => void;
}

export const CaseStudyMediaManager: React.FC<CaseStudyMediaManagerProps> = ({
  data,
  updateCaseStudy,
  isAr,
  showNotice,
  setCurrentPage
}) => {
  // Selected project state
  const [selectedStudyId, setSelectedStudyId] = useState<string>(data.caseStudies[0]?.id || '');
  const [sectorFilter, setSectorFilter] = useState<'all' | 'b2b' | 'b2c' | 'medical'>('all');
  
  // Media Sub-tab: 'images' or 'videos'
  const [mediaTypeTab, setMediaTypeTab] = useState<'images' | 'videos'>('images');

  // Add Image / Plan Form State
  const [isAddImageOpen, setIsAddImageOpen] = useState(false);
  const [imageUploadMode, setImageUploadMode] = useState<'file' | 'url'>('file');
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newImageTitle, setNewImageTitle] = useState('');
  const [newImageTitleEn, setNewImageTitleEn] = useState('');
  const [newImageTag, setNewImageTag] = useState('');
  const [newImageDesc, setNewImageDesc] = useState('');
  const [isCompressingImage, setIsCompressingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // AI Auto-Fill State
  const [autoAiAnalysis, setAutoAiAnalysis] = useState(true);
  const [isAnalyzingAi, setIsAnalyzingAi] = useState(false);
  const [aiAnalysisSuccess, setAiAnalysisSuccess] = useState(false);

  // Trigger AI analysis on image data
  const triggerAiImageAnalysis = async (imageData: string, targetCreativeToUpdate?: boolean) => {
    if (!imageData) return;
    try {
      setIsAnalyzingAi(true);
      setAiAnalysisSuccess(false);

      const res = await fetch('/api/analyze-creative-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: imageData.startsWith('data:') ? imageData : undefined,
          imageUrl: !imageData.startsWith('data:') ? imageData : undefined,
          projectName: currentCaseStudy?.client,
          sector: currentCaseStudy?.sector
        })
      });

      if (!res.ok) throw new Error('AI analysis failed');
      const json = await res.json();

      if (targetCreativeToUpdate && editingCreative) {
        setEditingCreative({
          ...editingCreative,
          title: json.title || editingCreative.title,
          titleEn: json.titleEn || editingCreative.titleEn,
          tag: json.tag || editingCreative.tag,
          desc: json.desc || editingCreative.desc
        });
      } else {
        if (json.title) setNewImageTitle(json.title);
        if (json.titleEn) setNewImageTitleEn(json.titleEn);
        if (json.tag) setNewImageTag(json.tag);
        if (json.desc) setNewImageDesc(json.desc);
      }

      setAiAnalysisSuccess(true);
      showNotice(isAr ? '✨ تم استخراج البيانات وتحليل الصورة بالذكاء الاصطناعي بنجاح!' : '✨ AI analyzed image and auto-filled details!');
    } catch (err) {
      console.error('AI Auto-Fill error:', err);
      showNotice(isAr ? 'تعذر التحليل التلقائي بالـ AI، يمكنك إدخال البيانات يدوياً' : 'AI analysis unavailable, please fill manually');
    } finally {
      setIsAnalyzingAi(false);
    }
  };

  // Edit Image State
  const [editingCreative, setEditingCreative] = useState<CaseStudyCreative | null>(null);

  // Add Video Form State
  const [isAddVideoOpen, setIsAddVideoOpen] = useState(false);
  const [videoUploadMode, setVideoUploadMode] = useState<'url' | 'file'>('url');
  const [newVideoUrl, setNewVideoUrl] = useState('');
  const [newVideoTitle, setNewVideoTitle] = useState('');
  const [newVideoTitleEn, setNewVideoTitleEn] = useState('');
  const [newVideoDesc, setNewVideoDesc] = useState('');
  const [isProcessingVideo, setIsProcessingVideo] = useState(false);
  const videoFileInputRef = useRef<HTMLInputElement>(null);

  // Lightbox Preview for thumbnails
  const [previewImage, setPreviewImage] = useState<{ url: string; title: string } | null>(null);

  // Find currently active case study
  const currentCaseStudy = data.caseStudies.find((c) => c.id === selectedStudyId) || data.caseStudies[0];

  // Get current creatives (images & plans) and videos
  const creatives = currentCaseStudy ? getCaseStudyCreatives(currentCaseStudy.id, currentCaseStudy) : [];
  const videos = currentCaseStudy ? getCaseStudyVideos(currentCaseStudy) : [];

  // Filtered case studies list
  const filteredStudies = data.caseStudies.filter((c) => {
    if (sectorFilter === 'all') return true;
    return c.sector === sectorFilter;
  });

  // Dedicated page mapping
  const getDedicatedPageRoute = (id: string): PageRoute | null => {
    const map: Record<string, PageRoute> = {
      'cs-b2c-passap': 'passap-case-study',
      'cs-b2c-siltal': 'siltal-case-study',
      'cs-b2c-alwaad-travel': 'alwaad-case-study',
      'cs-b2c-hamburg': 'hamburg-case-study',
      'cs-b2c-acton': 'acton-case-study',
      'cs-b2c-yoken': 'yoken-case-study',
      'cs-b2c-concrete': 'concrete-case-study',
      'cs-b2c-memar-lashin': 'lashin-case-study',
      'cs-b2c-gimoka': 'gimoka-case-study',
      'cs-b2c-binaryracks': 'binaryracks-case-study',
      'cs-b2b-bsizia': 'bsizia-case-study',
      'cs-b2c-penguin': 'penguin-case-study',
      'cs-med-ipt': 'ipt-case-study',
    };
    return map[id] || null;
  };


  const dedicatedRoute = currentCaseStudy ? getDedicatedPageRoute(currentCaseStudy.id) : null;

  // Batch Upload & Staging Queue State
  const [batchQueue, setBatchQueue] = useState<BatchStagedItem[]>([]);
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [isProcessingBatch, setIsProcessingBatch] = useState(false);
  const [batchActiveTab, setBatchActiveTab] = useState<'editor' | 'preview'>('editor');
  const [batchOverallProgress, setBatchOverallProgress] = useState({ current: 0, total: 0 });
  const batchFileInputRef = useRef<HTMLInputElement>(null);

  // Process a batch of selected files with AI
  const processBatchFiles = async (files: FileList | File[]) => {
    const fileArray = Array.from(files).filter(f => f.type.startsWith('image/'));
    if (fileArray.length === 0) {
      showNotice(isAr ? 'يرجى اختيار ملفات صور صالحة (PNG, JPG, WebP)' : 'Please select valid image files');
      return;
    }

    setIsBatchModalOpen(true);
    setIsProcessingBatch(true);
    setBatchOverallProgress({ current: 0, total: fileArray.length });

    // Build initial items in queue
    const initialItems: BatchStagedItem[] = fileArray.map((file, idx) => ({
      id: `batch-${Date.now()}-${idx}-${Math.random().toString(36).slice(2, 6)}`,
      fileName: file.name,
      dataUrl: '',
      title: file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
      titleEn: '',
      tag: isAr ? 'خطة تسويقية' : 'Marketing Plan',
      tagEn: 'Marketing Plan',
      desc: isAr ? 'خطة وتصميم ترويجي معتمد تم إعداده للحملة.' : 'Approved marketing plan asset.',
      descEn: 'Approved marketing plan asset.',
      status: 'compressing'
    }));

    setBatchQueue(prev => [...prev, ...initialItems]);

    // Sequentially compress and analyze each image with AI
    for (let i = 0; i < fileArray.length; i++) {
      const file = fileArray[i];
      const targetId = initialItems[i].id;

      // Step 1: Compress
      let compressedDataUrl = '';
      try {
        compressedDataUrl = await compressImageFile(file, 1400, 1400, 0.85);
        setBatchQueue(prev => prev.map(item => item.id === targetId ? { ...item, dataUrl: compressedDataUrl, status: 'analyzing' } : item));
      } catch {
        setBatchQueue(prev => prev.map(item => item.id === targetId ? { ...item, status: 'error', errorMessage: 'فشل ضغط الصورة' } : item));
        continue;
      }

      // Step 2: Call Gemini Vision
      try {
        const res = await fetch('/api/analyze-creative-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageBase64: compressedDataUrl,
            projectName: currentCaseStudy?.client,
            sector: currentCaseStudy?.sector
          })
        });

        if (res.ok) {
          const aiData = await res.json();
          setBatchQueue(prev => prev.map(item => item.id === targetId ? {
            ...item,
            title: aiData.title || item.title,
            titleEn: aiData.titleEn || item.title,
            tag: aiData.tag || item.tag,
            tagEn: aiData.tagEn || item.tagEn,
            desc: aiData.desc || item.desc,
            descEn: aiData.descEn || item.descEn,
            status: 'ready'
          } : item));
        } else {
          setBatchQueue(prev => prev.map(item => item.id === targetId ? { ...item, status: 'ready' } : item));
        }
      } catch (err) {
        console.warn('AI batch analysis error:', err);
        setBatchQueue(prev => prev.map(item => item.id === targetId ? { ...item, status: 'ready' } : item));
      }

      setBatchOverallProgress(prev => ({ ...prev, current: i + 1 }));
    }

    setIsProcessingBatch(false);
    showNotice(isAr ? `✨ تم تحليل ومعالجة ${fileArray.length} صور بالذكاء الاصطناعي بنجاح! تفحص النصوص قبل النشر.` : `✨ Processed ${fileArray.length} images with AI! Review before publishing.`);
  };

  // Re-run AI analysis on a specific staged batch item
  const handleRetryItemAi = async (itemId: string) => {
    const item = batchQueue.find(q => q.id === itemId);
    if (!item || !item.dataUrl) return;

    setBatchQueue(prev => prev.map(q => q.id === itemId ? { ...q, status: 'analyzing' } : q));

    try {
      const res = await fetch('/api/analyze-creative-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: item.dataUrl,
          projectName: currentCaseStudy?.client,
          sector: currentCaseStudy?.sector
        })
      });

      if (res.ok) {
        const aiData = await res.json();
        setBatchQueue(prev => prev.map(q => q.id === itemId ? {
          ...q,
          title: aiData.title || q.title,
          titleEn: aiData.titleEn || q.titleEn,
          tag: aiData.tag || q.tag,
          tagEn: aiData.tagEn || q.tagEn,
          desc: aiData.desc || q.desc,
          descEn: aiData.descEn || q.descEn,
          status: 'ready'
        } : q));
        showNotice(isAr ? '✨ تم تحديث بيانات الصورة بالذكاء الاصطناعي بنجاح!' : '✨ Item updated by AI!');
      } else {
        setBatchQueue(prev => prev.map(q => q.id === itemId ? { ...q, status: 'ready' } : q));
      }
    } catch {
      setBatchQueue(prev => prev.map(q => q.id === itemId ? { ...q, status: 'ready' } : q));
    }
  };

  // Update a single field on a staged item
  const handleUpdateBatchItem = (id: string, updates: Partial<BatchStagedItem>) => {
    setBatchQueue(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
  };

  // Remove an item from the batch queue
  const handleRemoveBatchItem = (id: string) => {
    setBatchQueue(prev => prev.filter(item => item.id !== id));
    showNotice(isAr ? 'تم استبعاد الصورة من قائمة النشر' : 'Item removed from queue');
  };

  // Confirm & Publish all ready items in batchQueue to currentCaseStudy
  const handlePublishBatchQueue = () => {
    if (!currentCaseStudy) return;
    const readyItems = batchQueue.filter(item => item.dataUrl && item.status !== 'error');
    if (readyItems.length === 0) {
      showNotice(isAr ? 'لا توجد صور جاهزة للنشر' : 'No ready images to publish');
      return;
    }

    const newCreatives: CaseStudyCreative[] = readyItems.map((item, idx) => ({
      id: `${currentCaseStudy.id}-batch-${Date.now()}-${idx}`,
      url: item.dataUrl,
      title: item.title.trim() || (isAr ? 'تصميم / خطة معتمدة' : 'Verified Creative Plan'),
      titleEn: item.titleEn.trim() || item.title.trim() || 'Verified Creative Plan',
      tag: item.tag.trim() || (isAr ? 'خطة تسويقية' : 'Creative Plan'),
      tagEn: item.tagEn?.trim() || item.tag.trim() || 'Creative Plan',
      desc: item.desc.trim() || (isAr ? 'خطة وتصميم ترويجي معتمد تم إضافته لدراسة الحالة.' : 'Newly added creative visual and plan.'),
      descEn: item.descEn.trim() || item.desc.trim() || 'Newly added creative visual and plan.',
      type: 'image'
    }));

    const updatedCreatives = [...creatives, ...newCreatives];
    const updatedGallery = [
      ...(currentCaseStudy.gallery || []),
      ...newCreatives.map(c => c.url)
    ];

    const updatedCaseStudy: CaseStudy = {
      ...currentCaseStudy,
      customCreatives: updatedCreatives,
      gallery: updatedGallery
    };

    updateCaseStudy(updatedCaseStudy);
    showNotice(isAr ? `🎉 تم اعتماد ونشر ${newCreatives.length} صور وخطط جديدة بنجاح في صفحة ${currentCaseStudy.client}!` : `🎉 Successfully published ${newCreatives.length} images to case study!`);
    setBatchQueue([]);
    setIsBatchModalOpen(false);
  };

  // Handle Image File Upload with Auto-compression and Optional AI Auto-Fill
  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // If user selected multiple files in the file picker, automatically route to the Batch Queue!
    if (files.length > 1) {
      setIsAddImageOpen(false);
      processBatchFiles(files);
      return;
    }

    const file = files[0];

    try {
      setIsCompressingImage(true);
      const compressedDataUrl = await compressImageFile(file, 1400, 1400, 0.85);
      setNewImageUrl(compressedDataUrl);

      if (autoAiAnalysis) {
        setIsCompressingImage(false);
        await triggerAiImageAnalysis(compressedDataUrl);
      } else if (!newImageTitle) {
        // extract nice default title from filename
        const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
        setNewImageTitle(cleanName);
        showNotice(isAr ? 'تم تحميل وضغط الصورة بنجاح!' : 'Image optimized successfully!');
      }
    } catch {
      showNotice(isAr ? 'تعذر قراءة الصورة، يرجى تجربة ملف آخر' : 'Failed to process image');
    } finally {
      setIsCompressingImage(false);
    }
  };

  // Handle Video File Upload
  const handleVideoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsProcessingVideo(true);
      const videoDataUrl = await readVideoFileAsDataUrl(file);
      setNewVideoUrl(videoDataUrl);
      if (!newVideoTitle) {
        const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
        setNewVideoTitle(cleanName);
      }
      showNotice(isAr ? 'تم قراءة ملف الفيديو بنجاح!' : 'Video file loaded successfully!');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'تعذر تحميل ملف الفيديو';
      showNotice(msg);
    } finally {
      setIsProcessingVideo(false);
    }
  };

  // Add New Image / Plan
  const handleAddImage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentCaseStudy || !newImageUrl.trim()) {
      showNotice(isAr ? 'يرجى إرفاق صورة أو كتابة رابط صالح' : 'Please provide an image file or URL');
      return;
    }

    const newCreativeItem: CaseStudyCreative = {
      id: `${currentCaseStudy.id}-img-${Date.now()}`,
      url: newImageUrl.trim(),
      title: newImageTitle.trim() || (isAr ? 'تصميم / خطة معتمدة' : 'Verified Creative Plan'),
      titleEn: newImageTitleEn.trim() || newImageTitle.trim() || 'Verified Creative Plan',
      tag: newImageTag.trim() || (isAr ? 'خطة تسويقية' : 'Creative Plan'),
      tagEn: newImageTag.trim() || 'Creative Plan',
      desc: newImageDesc.trim() || (isAr ? 'خطة وتصميم ترويجي تم إضافته حديثاً لدراسة الحالة.' : 'Newly added creative marketing visual and plan.'),
      descEn: newImageDesc.trim() || 'Newly added creative marketing visual and plan.',
      type: 'image'
    };

    // Update case study customCreatives list
    const updatedCreatives = [...creatives, newCreativeItem];
    
    // Also sync to gallery array for backward compatibility
    const updatedGallery = [
      ...(currentCaseStudy.gallery || []),
      newCreativeItem.url
    ];

    const updatedCaseStudy: CaseStudy = {
      ...currentCaseStudy,
      customCreatives: updatedCreatives,
      gallery: updatedGallery
    };

    updateCaseStudy(updatedCaseStudy);
    showNotice(isAr ? 'تمت إضافة الصورة/الخطة بنجاح وحفظها في المشروع!' : 'Image/Plan added successfully!');

    // Reset form
    setNewImageUrl('');
    setNewImageTitle('');
    setNewImageTitleEn('');
    setNewImageTag('');
    setNewImageDesc('');
    setIsAddImageOpen(false);
  };

  // Delete Creative Image
  const handleDeleteCreative = (creativeId: string, url: string) => {
    if (!currentCaseStudy) return;
    if (!window.confirm(isAr ? 'هل أنت متأكد من رغبتك في حذف هذه الصورة من دراسة الحالة؟' : 'Are you sure you want to delete this image?')) {
      return;
    }

    const updatedCreatives = creatives.filter((c) => c.id !== creativeId && c.url !== url);
    const updatedGallery = (currentCaseStudy.gallery || []).filter((u) => u !== url);

    const updatedCaseStudy: CaseStudy = {
      ...currentCaseStudy,
      customCreatives: updatedCreatives,
      gallery: updatedGallery
    };

    updateCaseStudy(updatedCaseStudy);
    showNotice(isAr ? 'تم حذف الصورة من دراسة الحالة وتحديث العرض فورياً!' : 'Image deleted successfully!');
  };

  // Set Creative as Main Thumbnail
  const handleSetAsThumbnail = (url: string) => {
    if (!currentCaseStudy) return;
    const updatedCaseStudy: CaseStudy = {
      ...currentCaseStudy,
      thumbnailUrl: url,
      image: url
    };
    updateCaseStudy(updatedCaseStudy);
    showNotice(isAr ? 'تم تعيين الصورة كصورة رئيسية (Thumbnail) للمشروع!' : 'Thumbnail updated successfully!');
  };

  // Save Edited Creative
  const handleSaveEditedCreative = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentCaseStudy || !editingCreative) return;

    const updatedCreatives = creatives.map((c) => 
      c.id === editingCreative.id ? editingCreative : c
    );

    const updatedCaseStudy: CaseStudy = {
      ...currentCaseStudy,
      customCreatives: updatedCreatives
    };

    updateCaseStudy(updatedCaseStudy);
    showNotice(isAr ? 'تم تحديث بيانات الصورة بنجاح!' : 'Creative updated successfully!');
    setEditingCreative(null);
  };

  // Add New Video
  const handleAddVideo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentCaseStudy || !newVideoUrl.trim()) {
      showNotice(isAr ? 'يرجى إرفاق فيديو أو إدخال رابط يوتيوب/فيميو صالح' : 'Please provide a valid video link or file');
      return;
    }

    const parsed = parseVideoUrl(newVideoUrl.trim());

    const newVideoItem: CaseStudyVideo = {
      id: `${currentCaseStudy.id}-vid-${Date.now()}`,
      url: newVideoUrl.trim(),
      title: newVideoTitle.trim() || (isAr ? 'فيديو الحملة التوثيقي' : 'Campaign Video'),
      titleEn: newVideoTitleEn.trim() || newVideoTitle.trim() || 'Campaign Video',
      desc: newVideoDesc.trim() || (isAr ? 'فيديو ترويجي توثيقي يستعرض نتائج المشروع وتفاصيل الحملة.' : 'Showcase video reel demonstrating project impact and campaign details.'),
      descEn: newVideoDesc.trim() || 'Showcase video reel demonstrating project impact and campaign details.',
      type: parsed.type === 'direct' ? 'direct' : 'embed'
    };

    const updatedVideos = [...videos, newVideoItem];

    const updatedCaseStudy: CaseStudy = {
      ...currentCaseStudy,
      videos: updatedVideos,
      videoUrl: updatedVideos[0]?.url || newVideoItem.url
    };

    updateCaseStudy(updatedCaseStudy);
    showNotice(isAr ? 'تمت إضافة الفيديو بنجاح وربطه بصفحة دراسة الحالة!' : 'Video added successfully!');

    // Reset video form
    setNewVideoUrl('');
    setNewVideoTitle('');
    setNewVideoTitleEn('');
    setNewVideoDesc('');
    setIsAddVideoOpen(false);
  };

  // Delete Video
  const handleDeleteVideo = (videoId: string) => {
    if (!currentCaseStudy) return;
    if (!window.confirm(isAr ? 'هل أنت متأكد من حذف هذا الفيديو؟' : 'Are you sure you want to delete this video?')) {
      return;
    }

    const updatedVideos = videos.filter((v) => v.id !== videoId);
    const updatedCaseStudy: CaseStudy = {
      ...currentCaseStudy,
      videos: updatedVideos,
      videoUrl: updatedVideos[0]?.url || undefined
    };

    updateCaseStudy(updatedCaseStudy);
    showNotice(isAr ? 'تم حذف الفيديو وتحديث صفحة المشروع!' : 'Video removed successfully!');
  };

  // Quick tag recommendations
  const tagSuggestions = [
    isAr ? 'خطة تسويقية' : 'Marketing Plan',
    isAr ? 'تصميم إعلاني' : 'Ad Creative',
    isAr ? 'منشور سوشيال ميديا' : 'Social Post',
    isAr ? 'ريلز وإنتاج مرئي' : 'Reels Plan',
    isAr ? 'الهوية الشاملة' : 'Brand Identity',
    isAr ? 'عروض وتخفيضات' : 'Special Offer',
  ];

  return (
    <div className="space-y-6">
      {/* SECTION 1: TOP PROJECT SELECTOR & FILTER */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-3">
          <div className="space-y-0.5">
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Layers className="w-5 h-5 text-sky-600" />
              <span>{isAr ? 'إدارة وسائط ومعرض دراسات الحالة والمشاريع' : 'Case Study Media & Video Control'}</span>
            </h3>
            <p className="text-xs text-slate-500">
              {isAr 
                ? 'ارفع صور الخطط والتصاميم الجديدة، أضف فيديوهات وروابط يوتيوب، وامسح أو عدّل أي صورة لتظهر فوراً في صفحات المشاريع.'
                : 'Upload creative plan images, add YouTube/Vimeo/direct videos, and curate project galleries with instant live reflection.'}
            </p>
          </div>

          {/* Sector Filters */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-bold shrink-0">
            {(['all', 'b2b', 'b2c', 'medical'] as const).map((sec) => (
              <button
                key={sec}
                type="button"
                onClick={() => setSectorFilter(sec)}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  sectorFilter === sec 
                    ? 'bg-white text-slate-900 shadow-xs font-black' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {sec === 'all' 
                  ? (isAr ? 'الكل' : 'All') 
                  : sec === 'b2b' 
                  ? 'B2B' 
                  : sec === 'b2c' 
                  ? 'B2C' 
                  : (isAr ? 'طبي' : 'Medical')}
              </button>
            ))}
          </div>
        </div>

        {/* Case Study Cards Carousel / Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {filteredStudies.map((cs) => {
            const isSelected = cs.id === currentCaseStudy?.id;
            const csCreatives = getCaseStudyCreatives(cs.id, cs);
            const csVideos = getCaseStudyVideos(cs);
            const thumb = cs.thumbnailUrl || cs.image || csCreatives[0]?.url || '/assets/portfolio_crops/card_passap.png';

            return (
              <div
                key={cs.id}
                onClick={() => setSelectedStudyId(cs.id)}
                className={`p-3 rounded-xl border transition-all cursor-pointer text-start flex flex-col justify-between gap-2.5 ${
                  isSelected
                    ? 'border-sky-500 bg-sky-50/70 ring-2 ring-sky-500/20 shadow-xs'
                    : 'border-slate-200 bg-slate-50/70 hover:bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-12 h-12 rounded-lg bg-slate-200 overflow-hidden shrink-0 border border-slate-200">
                    <img 
                      src={thumb} 
                      alt={cs.client} 
                      className="w-full h-full object-cover" 
                      loading="lazy" 
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded uppercase bg-slate-200/80 text-slate-700">
                        {cs.sector}
                      </span>
                      {isSelected && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-600 text-white">
                          {isAr ? 'محدد حالياً' : 'Selected'}
                        </span>
                      )}
                    </div>
                    <h4 className="text-xs font-bold text-slate-900 truncate mt-1">
                      {isAr ? cs.client : cs.clientEn}
                    </h4>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-600">
                  <span className="inline-flex items-center gap-1 font-semibold">
                    <ImageIcon className="w-3.5 h-3.5 text-sky-600" />
                    <span>{csCreatives.length} {isAr ? 'صور' : 'images'}</span>
                  </span>
                  <span className="inline-flex items-center gap-1 font-semibold">
                    <Film className="w-3.5 h-3.5 text-amber-500" />
                    <span>{csVideos.length} {isAr ? 'فيديو' : 'video'}</span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 2: ACTIVE CASE STUDY HEADER & ACTIONS */}
      {currentCaseStudy && (
        <div className="bg-slate-900 text-white p-6 rounded-2xl sm:rounded-3xl border border-slate-800 shadow-xl space-y-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-md text-[11px] font-black uppercase bg-sky-500/20 text-sky-400 border border-sky-500/30">
                  {currentCaseStudy.sector}
                </span>
                <span className="text-xs text-slate-400">
                  ID: <code className="text-slate-300 font-mono">{currentCaseStudy.id}</code>
                </span>
              </div>
              <h2 className="text-lg sm:text-2xl font-black text-white">
                {isAr ? currentCaseStudy.client : currentCaseStudy.clientEn}
                <span className="text-sky-400 text-sm font-semibold mx-2">
                  — {isAr ? currentCaseStudy.title : currentCaseStudy.titleEn}
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                {isAr 
                  ? `يتضمن هذا المشروع حالياً ${creatives.length} صورة وخطة معتمدة، و ${videos.length} مقطع فيديو معروضين في الصفحة.` 
                  : `Currently active: ${creatives.length} images & plans, ${videos.length} videos deployed on live page.`}
              </p>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex items-center gap-2 flex-wrap">
              {dedicatedRoute && (
                <button
                  type="button"
                  onClick={() => setCurrentPage(dedicatedRoute)}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-300 text-xs font-bold border border-slate-700 flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                >
                  <Eye className="w-4 h-4 text-sky-400" />
                  <span>{isAr ? 'معاينة الصفحة الحية ↗' : 'View Live Page ↗'}</span>
                </button>
              )}

              {/* AI Batch Upload Button */}
              <button
                type="button"
                onClick={() => batchFileInputRef.current?.click()}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-sky-600 hover:from-violet-500 hover:to-sky-500 text-white text-xs font-black flex items-center gap-2 cursor-pointer shadow-lg shadow-indigo-500/25 transition-all"
                title={isAr ? 'رفع مجموعة صور دفعة واحدة وتوليد النصوص بالذكاء الاصطناعي مع المعاينة' : 'Batch upload images with AI text auto-generation'}
              >
                <UploadCloud className="w-4 h-4 text-amber-300" />
                <span>{isAr ? '🚀 رفع دفعة صور بالذكاء الاصطناعي (Batch Upload)' : '🚀 AI Batch Upload'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsAddImageOpen(true);
                  setMediaTypeTab('images');
                }}
                className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-md transition-colors"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>{isAr ? 'إضافة صورة فردية' : '+ Add Single Image'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsAddVideoOpen(true);
                  setMediaTypeTab('videos');
                }}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-md transition-colors"
              >
                <Film className="w-4 h-4 stroke-[3]" />
                <span>{isAr ? 'إضافة فيديو للمشروع' : '+ Add Video'}</span>
              </button>
            </div>
          </div>

          {/* Hidden Batch File Input */}
          <input
            ref={batchFileInputRef}
            type="file"
            multiple
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                processBatchFiles(e.target.files);
                e.target.value = '';
              }
            }}
          />

          {/* Media Sub-tabs Toggle */}
          <div className="flex items-center gap-2 border-t border-slate-800 pt-4">
            <button
              type="button"
              onClick={() => setMediaTypeTab('images')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                mediaTypeTab === 'images'
                  ? 'bg-sky-500 text-slate-950 font-black shadow-md'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
            >
              <ImageIcon className="w-4 h-4" />
              <span>{isAr ? 'معرض الصور والخطط الإعلانية' : 'Creative & Plan Gallery'}</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-900/40">
                {creatives.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setMediaTypeTab('videos')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                mediaTypeTab === 'videos'
                  ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
            >
              <Film className="w-4 h-4" />
              <span>{isAr ? 'فيديوهات الحملة وتوثيق النتائج' : 'Campaign Video Reels'}</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-900/40">
                {videos.length}
              </span>
            </button>
          </div>
        </div>
      )}

      {/* SECTION 3: ADD IMAGE FORM MODAL / POPUP */}
      {isAddImageOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 animate-in fade-in duration-200">
          <div 
            className="bg-white rounded-2xl sm:rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 text-start space-y-5 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <Upload className="w-5 h-5 text-sky-600" />
                  <span>{isAr ? 'إضافة صورة أو خطة جديدة لدراسة الحالة' : 'Add Creative Plan / Image'}</span>
                </h3>
                <p className="text-xs text-slate-500">
                  {isAr ? `إضافة إلى: ${currentCaseStudy?.client}` : `Adding to: ${currentCaseStudy?.clientEn}`}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddImageOpen(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddImage} className="space-y-4">
              {/* Upload mode switcher */}
              <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setImageUploadMode('file')}
                  className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    imageUploadMode === 'file' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{isAr ? 'رفع ملف صورة من الجهاز' : 'Upload from Device'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setImageUploadMode('url')}
                  className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    imageUploadMode === 'url' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <LinkIcon className="w-3.5 h-3.5" />
                  <span>{isAr ? 'إدخال رابط صورة مباشر' : 'Image URL'}</span>
                </button>
              </div>

              {/* File upload picker */}
              {imageUploadMode === 'file' ? (
                <div className="space-y-2">
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-300 hover:border-sky-500 rounded-2xl p-6 text-center bg-slate-50 hover:bg-sky-50/40 transition-colors cursor-pointer flex flex-col items-center justify-center gap-2"
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept="image/png,image/jpeg,image/webp"
                      onChange={handleImageFileChange}
                      className="hidden"
                    />
                    <div className="w-12 h-12 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center">
                      <Upload className="w-6 h-6" />
                    </div>
                    <div className="text-xs font-bold text-slate-800">
                      {isCompressingImage 
                        ? (isAr ? 'جاري ضغط ومعالجة الصورة...' : 'Optimizing image...')
                        : (isAr ? 'انقر لاختيار صورة (أو عدة صور معاً) من جهازك' : 'Click to select image(s) from your device')}
                    </div>
                    <p className="text-[11px] text-slate-500">
                      {isAr ? 'يتم ضغط الصورة تلقائياً لضمان أعلى جودة وخفة تامة عند الحفظ.' : 'Automatically optimized for crisp display.'}
                    </p>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200/60 text-[11px] font-bold text-indigo-700 mt-1">
                      <Wand2 className="w-3.5 h-3.5 text-indigo-600" />
                      <span>{isAr ? 'ميزة جديدة: عند اختيار عدة صور معاً سيتم فتح شاشة المراجعة والتوليد الجماعي بالـ AI!' : 'Batch Tip: Select multiple images to open AI review staging!'}</span>
                    </div>
                  </div>

                  {newImageUrl && (
                    <div className="relative aspect-video rounded-xl overflow-hidden border border-slate-200 bg-slate-100 shadow-xs">
                      <img src={newImageUrl} alt="Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setNewImageUrl('')}
                        className="absolute top-2 end-2 p-1 bg-rose-600 text-white rounded-full hover:bg-rose-700 shadow-sm"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 block">
                    {isAr ? 'رابط الصورة المباشر:' : 'Direct Image URL:'}
                  </label>
                  <input
                    type="url"
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    placeholder="https://example.com/creative-plan.jpg"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none"
                    dir="ltr"
                    required
                  />
                  {newImageUrl && (
                    <div className="relative aspect-video rounded-xl overflow-hidden border border-slate-200 bg-slate-100 mt-2">
                      <img src={newImageUrl} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              )}

              {/* AI Auto-Fill Control Card */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-sky-50 via-indigo-50/70 to-purple-50/50 border border-sky-200/90 shadow-xs space-y-2.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={autoAiAnalysis}
                      onChange={(e) => setAutoAiAnalysis(e.target.checked)}
                      className="w-4 h-4 text-sky-600 rounded border-slate-300 focus:ring-sky-500 cursor-pointer"
                    />
                    <div className="flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-sky-600 animate-pulse" />
                      <span className="text-xs font-black text-slate-800">
                        {isAr ? 'ملء البيانات تلقائياً بالذكاء الاصطناعي (AI Auto-Fill من الصورة)' : 'Auto-fill fields using AI from image'}
                      </span>
                    </div>
                  </label>

                  {/* Manual AI Trigger Button */}
                  {newImageUrl && (
                    <button
                      type="button"
                      onClick={() => triggerAiImageAnalysis(newImageUrl)}
                      disabled={isAnalyzingAi || isCompressingImage}
                      className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white text-[11px] font-bold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                      <span>{isAnalyzingAi ? (isAr ? 'جاري التحليل...' : 'Analyzing...') : (isAr ? 'استخراج البيانات بالـ AI' : 'Extract with AI')}</span>
                    </button>
                  )}
                </div>

                <p className="text-[11px] text-slate-600 leading-relaxed">
                  {isAr 
                    ? 'عند اختيار هذا الخيار، سيقوم الذكاء الاصطناعي فور اختيار الصورة بقراءة النصوص وتفاصيل التصميم/الخطة وملء العنوان، التصنيف، والوصف التسويقي تلقائياً.' 
                    : 'When checked, Gemini Vision reads the image upon selection to automatically populate titles, category tag, and marketing description.'}
                </p>

                {/* AI Loading State */}
                {isAnalyzingAi && (
                  <div className="flex items-center gap-2 text-xs font-bold text-sky-800 bg-sky-100/90 px-3 py-2 rounded-xl animate-pulse border border-sky-300/70">
                    <div className="w-3.5 h-3.5 border-2 border-sky-600 border-t-transparent rounded-full animate-spin shrink-0" />
                    <span>{isAr ? 'جاري فحص وقراءة محتوى الصورة واستخراج العناوين والوصف بالذكاء الاصطناعي...' : 'AI is reading creative visual content and generating marketing details...'}</span>
                  </div>
                )}

                {/* AI Success Badge */}
                {aiAnalysisSuccess && !isAnalyzingAi && (
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{isAr ? 'تم استخراج وتعبئة البيانات بنجاح من الصورة بواسطة الذكاء الاصطناعي! يمكنك تعديلها بحرية.' : 'Data successfully populated by AI! You can customize any field.'}</span>
                  </div>
                )}
              </div>

              {/* Title Input */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">
                  {isAr ? 'عنوان الصورة أو الخطة (عربي):' : 'Creative / Plan Title:'}
                </label>
                <input
                  type="text"
                  value={newImageTitle}
                  onChange={(e) => setNewImageTitle(e.target.value)}
                  placeholder={isAr ? 'مثال: خطة إعلانية شاملة لموسم الصيف' : 'e.g. Summer Campaign Plan'}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  required
                />
              </div>

              {/* Title En Input */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">
                  {isAr ? 'عنوان الصورة (English - اختياري):' : 'English Title (Optional):'}
                </label>
                <input
                  type="text"
                  value={newImageTitleEn}
                  onChange={(e) => setNewImageTitleEn(e.target.value)}
                  placeholder="e.g. Comprehensive Summer Ad Campaign Plan"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  dir="ltr"
                />
              </div>

              {/* Tag / Category */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  {isAr ? 'التصنيف / الوسم:' : 'Tag / Category:'}
                </label>
                <input
                  type="text"
                  value={newImageTag}
                  onChange={(e) => setNewImageTag(e.target.value)}
                  placeholder={isAr ? 'مثال: خطة تسويقية' : 'e.g. Creative Plan'}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
                <div className="flex items-center gap-1.5 flex-wrap pt-1">
                  <span className="text-[10px] text-slate-500">{isAr ? 'اقتراحات سريعة:' : 'Quick tags:'}</span>
                  {tagSuggestions.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => setNewImageTag(tag)}
                      className="px-2 py-0.5 rounded text-[10px] bg-slate-100 hover:bg-sky-100 hover:text-sky-800 text-slate-700 transition-colors cursor-pointer"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Description Input */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">
                  {isAr ? 'شرح تفاصيل الخطة أو التصميم:' : 'Description & Context:'}
                </label>
                <textarea
                  value={newImageDesc}
                  onChange={(e) => setNewImageDesc(e.target.value)}
                  rows={3}
                  placeholder={isAr ? 'اشرح سياق التصميم والهدف الترويجي والنتائج المتوقعة...' : 'Describe creative context and strategic objective...'}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>

              {/* Submit Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddImageOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={!newImageUrl || isCompressingImage}
                  className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-black shadow-md transition-colors disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>{isAr ? 'إضافة الصورة وحفظها' : 'Save & Add Image'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SECTION 4: EDIT IMAGE MODAL */}
      {editingCreative && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 animate-in fade-in duration-200">
          <div 
            className="bg-white rounded-2xl sm:rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 text-start space-y-5 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <Edit3 className="w-5 h-5 text-sky-600" />
                  <span>{isAr ? 'تعديل بيانات الصورة / الخطة' : 'Edit Creative Info'}</span>
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingCreative(null)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditedCreative} className="space-y-4">
              <div className="relative aspect-video rounded-xl overflow-hidden border border-slate-200 bg-slate-950">
                <img src={editingCreative.url} alt={editingCreative.title} className="w-full h-full object-contain" />
              </div>

              {/* AI Re-Analyze Button */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-sky-50 border border-sky-200">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-sky-600" />
                  <span className="text-xs font-bold text-slate-800">
                    {isAr ? 'استخراج وتحسين البيانات بالذكاء الاصطناعي:' : 'Extract details using AI:'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => triggerAiImageAnalysis(editingCreative.url, true)}
                  disabled={isAnalyzingAi}
                  className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>{isAnalyzingAi ? (isAr ? 'جاري التحليل...' : 'Analyzing...') : (isAr ? 'توليد البيانات بالـ AI' : 'Generate with AI')}</span>
                </button>
              </div>

              {/* Title */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">
                  {isAr ? 'عنوان التصميم (عربي):' : 'Title (Arabic):'}
                </label>
                <input
                  type="text"
                  value={editingCreative.title}
                  onChange={(e) => setEditingCreative({ ...editingCreative, title: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  required
                />
              </div>

              {/* Title En */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">
                  {isAr ? 'عنوان التصميم (English):' : 'Title (English):'}
                </label>
                <input
                  type="text"
                  value={editingCreative.titleEn || ''}
                  onChange={(e) => setEditingCreative({ ...editingCreative, titleEn: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  dir="ltr"
                />
              </div>

              {/* Tag */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">
                  {isAr ? 'الوسم / التصنيف:' : 'Tag / Category:'}
                </label>
                <input
                  type="text"
                  value={editingCreative.tag || ''}
                  onChange={(e) => setEditingCreative({ ...editingCreative, tag: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">
                  {isAr ? 'الشرح والتفاصيل:' : 'Description:'}
                </label>
                <textarea
                  value={editingCreative.desc || ''}
                  onChange={(e) => setEditingCreative({ ...editingCreative, desc: e.target.value })}
                  rows={3}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>

              {/* Submit */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingCreative(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-black shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>{isAr ? 'حفظ التعديلات' : 'Save Changes'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SECTION 5: ADD VIDEO FORM MODAL */}
      {isAddVideoOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 animate-in fade-in duration-200">
          <div 
            className="bg-white rounded-2xl sm:rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 text-start space-y-5 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <Film className="w-5 h-5 text-amber-500" />
                  <span>{isAr ? 'إضافة فيديو لدراسة الحالة (رابط أو رفع)' : 'Add Video to Case Study'}</span>
                </h3>
                <p className="text-xs text-slate-500">
                  {isAr ? `إضافة إلى: ${currentCaseStudy?.client}` : `Adding to: ${currentCaseStudy?.clientEn}`}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddVideoOpen(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddVideo} className="space-y-4">
              {/* Video mode switcher */}
              <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setVideoUploadMode('url')}
                  className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    videoUploadMode === 'url' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <LinkIcon className="w-3.5 h-3.5" />
                  <span>{isAr ? 'رابط فيديو (YouTube / Vimeo / MP4)' : 'Video Link (YouTube / Vimeo / Direct)'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setVideoUploadMode('file')}
                  className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    videoUploadMode === 'file' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{isAr ? 'رفع ملف فيديو من الجهاز' : 'Upload Video File'}</span>
                </button>
              </div>

              {videoUploadMode === 'url' ? (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 block">
                    {isAr ? 'رابط الفيديو (يدعم يوتيوب، فيميو، روابط MP4 المباشرة):' : 'Video URL:'}
                  </label>
                  <input
                    type="url"
                    value={newVideoUrl}
                    onChange={(e) => setNewVideoUrl(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    dir="ltr"
                    required
                  />
                  <p className="text-[11px] text-slate-500">
                    {isAr ? 'مثال: https://youtu.be/xxx أو https://vimeo.com/xxx أو رابط MP4 مباشر.' : 'Supports YouTube, Vimeo, or direct MP4 streams.'}
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <div 
                    onClick={() => videoFileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-300 hover:border-amber-500 rounded-2xl p-6 text-center bg-slate-50 hover:bg-amber-50/40 transition-colors cursor-pointer flex flex-col items-center justify-center gap-2"
                  >
                    <input
                      ref={videoFileInputRef}
                      type="file"
                      accept="video/mp4,video/webm"
                      onChange={handleVideoFileChange}
                      className="hidden"
                    />
                    <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center">
                      <Film className="w-6 h-6" />
                    </div>
                    <div className="text-xs font-bold text-slate-800">
                      {isProcessingVideo 
                        ? (isAr ? 'جاري قراءة ملف الفيديو...' : 'Reading video file...')
                        : (isAr ? 'انقر لاختيار ملف فيديو (MP4, WebM)' : 'Click to choose video file')}
                    </div>
                    <p className="text-[11px] text-slate-500">
                      {isAr ? 'يفضل مقاطع فيديو أقل من ٢٠ ميجابايت للسرعة، أو استخدم رابط يوتيوب للمقاطع الأطول.' : 'Max recommended size 20MB or use YouTube link.'}
                    </p>
                  </div>
                </div>
              )}

              {/* Live Video Preview before saving */}
              {newVideoUrl && (
                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold text-slate-700 block">
                    {isAr ? 'معاينة مشغل الفيديو:' : 'Live Video Preview:'}
                  </span>
                  <div className="aspect-video w-full rounded-xl overflow-hidden bg-black relative border border-slate-200">
                    {(() => {
                      const p = parseVideoUrl(newVideoUrl);
                      if (p.type === 'youtube' || p.type === 'vimeo') {
                        return (
                          <iframe
                            src={p.embedUrl}
                            title="Preview"
                            className="w-full h-full border-0 absolute inset-0"
                            allowFullScreen
                          />
                        );
                      }
                      return (
                        <video src={p.embedUrl} controls className="w-full h-full object-contain" />
                      );
                    })()}
                  </div>
                </div>
              )}

              {/* Video Title */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">
                  {isAr ? 'عنوان الفيديو (عربي):' : 'Video Title (Arabic):'}
                </label>
                <input
                  type="text"
                  value={newVideoTitle}
                  onChange={(e) => setNewVideoTitle(e.target.value)}
                  placeholder={isAr ? 'مثال: فيديو الحملة التوثيقي وكواليس التصوير' : 'e.g. Campaign Documentary & Behind the Scenes'}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  required
                />
              </div>

              {/* Video Title En */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">
                  {isAr ? 'عنوان الفيديو (English - اختياري):' : 'English Title (Optional):'}
                </label>
                <input
                  type="text"
                  value={newVideoTitleEn}
                  onChange={(e) => setNewVideoTitleEn(e.target.value)}
                  placeholder="e.g. Campaign Documentary Video"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  dir="ltr"
                />
              </div>

              {/* Video Description */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">
                  {isAr ? 'وصف الفيديو وسياق النتائج:' : 'Video Description:'}
                </label>
                <textarea
                  value={newVideoDesc}
                  onChange={(e) => setNewVideoDesc(e.target.value)}
                  rows={2}
                  placeholder={isAr ? 'نبذة عن الفيديو والهدف منه في الحملة...' : 'Short summary of the video and its strategic role...'}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              {/* Submit */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddVideoOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={!newVideoUrl || isProcessingVideo}
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black shadow-md cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>{isAr ? 'إضافة الفيديو للمشروع' : 'Save & Add Video'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SECTION 6: MAIN GALLERY GRID OR VIDEO LIST */}
      {mediaTypeTab === 'images' ? (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-sky-600" />
              <span>{isAr ? `معرض الصور والخطط الإعلانية (${creatives.length} صورة)` : `Creatives & Plans (${creatives.length})`}</span>
            </h4>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => batchFileInputRef.current?.click()}
                className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-black flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
              >
                <UploadCloud className="w-3.5 h-3.5 text-amber-300" />
                <span>{isAr ? '🚀 رفع دفعة بالـ AI' : '🚀 Batch Upload'}</span>
              </button>

              <button
                type="button"
                onClick={() => setIsAddImageOpen(true)}
                className="px-3 py-1.5 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer border border-sky-200"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{isAr ? 'إضافة صورة فردية' : '+ Add Image'}</span>
              </button>
            </div>
          </div>

          {creatives.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
                <ImageIcon className="w-6 h-6" />
              </div>
              <h5 className="text-sm font-bold text-slate-800">
                {isAr ? 'لا توجد صور مضافة لهذا المشروع حتى الآن' : 'No images or plans found for this study'}
              </h5>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                {isAr ? 'انقر على زر "إضافة صورة / خطة جديدة" لرفع تصاميم الحملة أو الخطط التسويقية.' : 'Click Add Image to upload new campaign plans or creatives.'}
              </p>
              <button
                type="button"
                onClick={() => setIsAddImageOpen(true)}
                className="px-4 py-2 rounded-xl bg-sky-600 text-white text-xs font-bold hover:bg-sky-700"
              >
                {isAr ? '+ إضافة أول صورة للمشروع' : '+ Add First Image'}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {creatives.map((item, idx) => {
                const isThumbnail = currentCaseStudy?.thumbnailUrl === item.url;

                return (
                  <div
                    key={item.id || idx}
                    className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
                  >
                    {/* Image Preview & Actions Overlay */}
                    <div className="relative aspect-[4/3] bg-slate-950 overflow-hidden">
                      <img
                        src={item.url}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />

                      {/* Tag Badge */}
                      <span className="absolute top-2.5 end-2.5 px-2.5 py-1 rounded-md bg-slate-950/80 backdrop-blur-md border border-slate-700/80 text-[10px] font-bold text-amber-400">
                        {item.tag || (isAr ? 'خطة معتمدة' : 'Creative')}
                      </span>

                      {/* Thumbnail Star Badge */}
                      {isThumbnail && (
                        <span className="absolute top-2.5 start-2.5 px-2 py-1 rounded-md bg-amber-500 text-slate-950 text-[10px] font-black flex items-center gap-1 shadow-md">
                          <Star className="w-3 h-3 fill-current" />
                          <span>{isAr ? 'غلاف رئيسي' : 'Thumbnail'}</span>
                        </span>
                      )}

                      {/* Zoom trigger */}
                      <button
                        type="button"
                        onClick={() => setPreviewImage({ url: item.url, title: item.title })}
                        className="absolute bottom-2.5 end-2.5 p-1.5 rounded-lg bg-slate-950/80 text-white hover:bg-sky-600 transition-colors shadow-sm cursor-pointer"
                        title={isAr ? 'عرض مكبّر' : 'Zoom'}
                      >
                        <Maximize2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Content Details */}
                    <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                      <div>
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900 line-clamp-2 leading-snug">
                          {isAr ? item.title : (item.titleEn || item.title)}
                        </h4>
                        {(item.desc || item.descEn) && (
                          <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                            {isAr ? item.desc : (item.descEn || item.desc)}
                          </p>
                        )}
                      </div>

                      {/* Action buttons bar */}
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-1">
                        {!isThumbnail && (
                          <button
                            type="button"
                            onClick={() => handleSetAsThumbnail(item.url)}
                            className="text-[11px] font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1 cursor-pointer"
                            title={isAr ? 'تعيين كغلاف رئيسي' : 'Set as Thumbnail'}
                          >
                            <Star className="w-3 h-3" />
                            <span>{isAr ? 'تعيين كغلاف' : 'Set Cover'}</span>
                          </button>
                        )}

                        <div className="flex items-center gap-1 ms-auto">
                          <button
                            type="button"
                            onClick={() => setEditingCreative(item)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-sky-600 hover:bg-sky-50 transition-colors cursor-pointer"
                            title={isAr ? 'تعديل البيانات' : 'Edit info'}
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteCreative(item.id, item.url)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            title={isAr ? 'حذف الصورة' : 'Delete image'}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* VIDEOS SUB-TAB */
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <Film className="w-4 h-4 text-amber-500" />
              <span>{isAr ? `فيديوهات الحملة التوثيقية (${videos.length} مقطع)` : `Campaign Videos (${videos.length})`}</span>
            </h4>
            <button
              type="button"
              onClick={() => setIsAddVideoOpen(true)}
              className="px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer border border-amber-200"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isAr ? 'إضافة فيديو للمشروع' : 'Add Video'}</span>
            </button>
          </div>

          {videos.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 space-y-3">
              <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-500 mx-auto flex items-center justify-center">
                <Film className="w-6 h-6" />
              </div>
              <h5 className="text-sm font-bold text-slate-800">
                {isAr ? 'لا توجد مقاطع فيديو مضافة لهذا المشروع حتى الآن' : 'No videos added for this case study yet'}
              </h5>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                {isAr ? 'يمكنك ربط فيديو يوتيوب أو فيميو أو رفع فيديو توثيقي مباشر ليظهر في المشغل التفاعلي.' : 'Add YouTube, Vimeo, or direct MP4 video link to show on live page.'}
              </p>
              <button
                type="button"
                onClick={() => setIsAddVideoOpen(true)}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black shadow-md cursor-pointer"
              >
                {isAr ? '+ إضافة أول فيديو للمشروع' : '+ Add First Video'}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {videos.map((vid) => {
                const parsed = parseVideoUrl(vid.url);

                return (
                  <div
                    key={vid.id}
                    className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs flex flex-col justify-between"
                  >
                    <div className="relative aspect-video w-full bg-black">
                      {parsed.type === 'youtube' || parsed.type === 'vimeo' ? (
                        <iframe
                          src={parsed.embedUrl}
                          title={vid.title}
                          className="w-full h-full border-0 absolute inset-0"
                          allowFullScreen
                        />
                      ) : (
                        <video src={parsed.embedUrl} controls className="w-full h-full object-contain" />
                      )}
                    </div>

                    <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-700">
                            {parsed.type === 'youtube' ? 'YouTube HD' : parsed.type === 'vimeo' ? 'Vimeo' : 'Direct MP4'}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-900 leading-snug">
                          {isAr ? vid.title : (vid.titleEn || vid.title)}
                        </h4>
                        {(vid.desc || vid.descEn) && (
                          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                            {isAr ? vid.desc : (vid.descEn || vid.desc)}
                          </p>
                        )}
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                        {vid.url.startsWith('http') && (
                          <a
                            href={vid.url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs text-sky-600 hover:text-sky-700 font-semibold inline-flex items-center gap-1"
                          >
                            <span>{isAr ? 'فتح الرابط الأصلي' : 'Open Link'}</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}

                        <button
                          type="button"
                          onClick={() => handleDeleteVideo(vid.id)}
                          className="px-2.5 py-1 rounded-lg text-rose-600 hover:bg-rose-50 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 ms-auto"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>{isAr ? 'حذف الفيديو' : 'Delete'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* SECTION 6.5: BATCH STAGING & REVIEW MODAL */}
      {isBatchModalOpen && (
        <div 
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200"
          onClick={() => {
            if (!isProcessingBatch && window.confirm(isAr ? 'هل تريد إغلاق نافذة المعاينة؟ لن يتم حذف الصور غير المنشورة إلا إذا أكدت ذلك.' : 'Close review staging?')) {
              setIsBatchModalOpen(false);
            }
          }}
        >
          <div 
            className="bg-white rounded-2xl sm:rounded-3xl max-w-5xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden text-start"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-4 sm:p-6 bg-slate-900 text-white border-b border-slate-800 flex flex-col gap-4 shrink-0">
              <div className="flex items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-md text-[11px] font-black uppercase bg-violet-500/20 text-violet-300 border border-violet-500/30 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                      <span>{isAr ? 'الذكاء الاصطناعي — مراجعة الدفعة' : 'AI Batch Staging'}</span>
                    </span>
                    <span className="text-xs text-slate-400 font-bold">
                      {isAr ? `مشروع: ${currentCaseStudy?.client}` : `Project: ${currentCaseStudy?.clientEn}`}
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                    <UploadCloud className="w-5 h-5 text-sky-400" />
                    <span>{isAr ? 'مراجعة وتعديل دفعة الصور قبل النشر (Batch Review & Preview)' : 'Review & Edit AI Batch Before Publishing'}</span>
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
                    {isAr
                      ? `تم فحص ${batchQueue.length} صورة واستخراج العناوين والتصنيفات والوصف التسويقي بالذكاء الاصطناعي. يمكنك مراجعتها وتعديلها ومعاينة مظهرها الحي قبل النشر.`
                      : `AI analyzed ${batchQueue.length} images. Review, edit texts, or preview the live layout before publishing to the case study.`}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsBatchModalOpen(false)}
                  disabled={isProcessingBatch}
                  className="p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer disabled:opacity-50 shrink-0"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Top View Mode Tabs */}
              <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-800/80 flex-wrap">
                <div className="flex items-center gap-2 bg-slate-800/80 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setBatchActiveTab('editor')}
                    className={`px-3 sm:px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                      batchActiveTab === 'editor'
                        ? 'bg-sky-500 text-slate-950 font-black shadow-md'
                        : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    <ListChecks className="w-3.5 h-3.5" />
                    <span>{isAr ? 'تعديل البطاقات والنصوص (Editor)' : 'Edit Cards & Copy'}</span>
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-900/40">
                      {batchQueue.length}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setBatchActiveTab('preview')}
                    className={`px-3 sm:px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                      batchActiveTab === 'preview'
                        ? 'bg-sky-500 text-slate-950 font-black shadow-md'
                        : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>{isAr ? 'المعاينة الحية في الموقع (Live Preview)' : 'Live Page Preview'}</span>
                  </button>
                </div>

                {/* Counter indicator */}
                <div className="text-xs text-slate-300 font-semibold flex items-center gap-1.5">
                  <CheckCheck className="w-4 h-4 text-emerald-400" />
                  <span>
                    {isAr 
                      ? `${batchQueue.filter(q => q.status === 'ready').length} من أصل ${batchQueue.length} صورة جاهزة للنشر` 
                      : `${batchQueue.filter(q => q.status === 'ready').length} of ${batchQueue.length} images ready to publish`}
                  </span>
                </div>
              </div>
            </div>

            {/* AI Progress Bar (if processing) */}
            {isProcessingBatch && (
              <div className="bg-gradient-to-r from-violet-900/90 via-indigo-900/90 to-sky-900/90 text-white p-3.5 px-6 border-b border-indigo-700/50 space-y-2 shrink-0">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 font-bold">
                    <div className="w-3.5 h-3.5 border-2 border-amber-300 border-t-transparent rounded-full animate-spin shrink-0" />
                    <span>{isAr ? 'جاري فحص وضغط وتحليل الصور بواسطة الذكاء الاصطناعي (Gemini Vision)...' : 'Analyzing images and extracting details with AI...'}</span>
                  </div>
                  <span className="font-mono text-amber-300 font-bold text-xs">
                    {batchOverallProgress.current} / {batchOverallProgress.total}
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-amber-400 via-sky-400 to-emerald-400 transition-all duration-300"
                    style={{ width: `${Math.round((batchOverallProgress.current / Math.max(1, batchOverallProgress.total)) * 100)}%` }}
                  />
                </div>
              </div>
            )}

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50 space-y-4">
              {batchQueue.length === 0 ? (
                <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 space-y-4 my-4">
                  <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
                    <UploadCloud className="w-8 h-8" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-800">
                    {isAr ? 'قائمة المراجعة فارغة حالياً' : 'Batch queue is empty'}
                  </h4>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    {isAr ? 'اختر مجموعة صور من جهازك لتوليد نصوصها تلقائياً بالذكاء الاصطناعي ومراجعتها هنا قبل النشر.' : 'Select images from your device to analyze and stage them with AI.'}
                  </p>
                  <button
                    type="button"
                    onClick={() => batchFileInputRef.current?.click()}
                    className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs cursor-pointer shadow-md"
                  >
                    {isAr ? '+ اختيار صور للدفعة' : '+ Select Images'}
                  </button>
                </div>
              ) : batchActiveTab === 'editor' ? (
                /* TAB 1: EDITOR MODE */
                <div className="space-y-4">
                  {batchQueue.map((item, idx) => {
                    const isItemBusy = item.status === 'compressing' || item.status === 'analyzing';

                    return (
                      <div 
                        key={item.id}
                        className="bg-white rounded-2xl border border-slate-200 hover:border-slate-300 shadow-xs p-4 sm:p-5 transition-all flex flex-col md:flex-row gap-5 items-start"
                      >
                        {/* Image Preview & Quick Actions */}
                        <div className="w-full md:w-56 shrink-0 space-y-2.5">
                          <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-slate-900 border border-slate-200 shadow-inner group">
                            {item.dataUrl ? (
                              <img 
                                src={item.dataUrl} 
                                alt={item.title} 
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-500 text-xs">
                                {isAr ? 'جاري المعالجة...' : 'Processing...'}
                              </div>
                            )}

                            {/* Status Overlay Badge */}
                            <div className="absolute top-2 start-2">
                              {item.status === 'analyzing' && (
                                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-600 text-white flex items-center gap-1 shadow-xs">
                                  <div className="w-2.5 h-2.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                  <span>{isAr ? 'AI يفحص الصورة' : 'AI Analyzing'}</span>
                                </span>
                              )}
                              {item.status === 'compressing' && (
                                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500 text-slate-950 flex items-center gap-1 shadow-xs">
                                  <span>{isAr ? 'جاري الضغط' : 'Compressing'}</span>
                                </span>
                              )}
                              {item.status === 'ready' && (
                                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-600 text-white flex items-center gap-1 shadow-xs">
                                  <Sparkles className="w-3 h-3 text-amber-300" />
                                  <span>{isAr ? 'تم استخراج النصوص ✨' : 'AI Ready'}</span>
                                </span>
                              )}
                              {item.status === 'error' && (
                                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-600 text-white flex items-center gap-1 shadow-xs">
                                  <AlertCircle className="w-3 h-3" />
                                  <span>{item.errorMessage || (isAr ? 'خطأ' : 'Error')}</span>
                                </span>
                              )}
                            </div>

                            {/* Full Zoom button */}
                            {item.dataUrl && (
                              <button
                                type="button"
                                onClick={() => setPreviewImage({ url: item.dataUrl, title: item.title })}
                                className="absolute bottom-2 end-2 p-1.5 rounded-lg bg-slate-950/80 text-white hover:bg-sky-600 transition-colors shadow-sm cursor-pointer"
                                title={isAr ? 'تكبير الصورة' : 'Zoom'}
                              >
                                <Maximize2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>

                          <div className="text-[11px] text-slate-500 truncate" title={item.fileName}>
                            <span className="font-semibold text-slate-700">#{idx + 1} </span>
                            {item.fileName}
                          </div>

                          {/* Item Action Buttons */}
                          <div className="grid grid-cols-2 gap-1.5 pt-1 border-t border-slate-100">
                            <button
                              type="button"
                              onClick={() => handleRetryItemAi(item.id)}
                              disabled={isItemBusy || !item.dataUrl}
                              className="px-2 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[11px] font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer disabled:opacity-50"
                              title={isAr ? 'إعادة استخراج النصوص بالذكاء الاصطناعي' : 'Regenerate copy with AI'}
                            >
                              <RotateCcw className="w-3 h-3" />
                              <span>{isAr ? 'إعادة AI' : 'Retry AI'}</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleRemoveBatchItem(item.id)}
                              className="px-2 py-1 rounded-lg text-rose-600 hover:bg-rose-50 text-[11px] font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                              title={isAr ? 'استبعاد الصورة من النشر' : 'Remove item'}
                            >
                              <Trash2 className="w-3 h-3" />
                              <span>{isAr ? 'استبعاد' : 'Remove'}</span>
                            </button>
                          </div>
                        </div>

                        {/* Editable Form Fields */}
                        <div className="flex-1 w-full space-y-3">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {/* Title Arabic */}
                            <div className="space-y-1">
                              <label className="text-xs font-bold text-slate-700 block flex items-center justify-between">
                                <span>{isAr ? 'عنوان الصورة أو الخطة (عربي):' : 'Title (Arabic):'}</span>
                                <span className="text-[10px] text-sky-600 font-semibold">{isAr ? 'مولد بالـ AI' : 'AI generated'}</span>
                              </label>
                              <input
                                type="text"
                                value={item.title}
                                onChange={(e) => handleUpdateBatchItem(item.id, { title: e.target.value })}
                                placeholder={isAr ? 'عنوان التصميم أو الخطة' : 'Creative Plan Title'}
                                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none bg-white font-medium"
                              />
                            </div>

                            {/* Title English */}
                            <div className="space-y-1">
                              <label className="text-xs font-bold text-slate-700 block">
                                {isAr ? 'عنوان الصورة (English):' : 'Title (English):'}
                              </label>
                              <input
                                type="text"
                                value={item.titleEn}
                                onChange={(e) => handleUpdateBatchItem(item.id, { titleEn: e.target.value })}
                                placeholder="e.g. Campaign Plan & Visuals"
                                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none bg-white font-medium"
                                dir="ltr"
                              />
                            </div>
                          </div>

                          {/* Tag / Category */}
                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-700 block">
                              {isAr ? 'التصنيف / الوسم:' : 'Category / Tag:'}
                            </label>
                            <div className="flex flex-col sm:flex-row gap-2">
                              <input
                                type="text"
                                value={item.tag}
                                onChange={(e) => handleUpdateBatchItem(item.id, { tag: e.target.value })}
                                placeholder={isAr ? 'مثال: خطة تسويقية' : 'e.g. Marketing Plan'}
                                className="w-full sm:w-1/2 px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none bg-white font-medium"
                              />
                              <div className="flex items-center gap-1 flex-wrap pt-0.5">
                                {tagSuggestions.slice(0, 4).map((tag) => (
                                  <button
                                    key={tag}
                                    type="button"
                                    onClick={() => handleUpdateBatchItem(item.id, { tag })}
                                    className="px-2 py-1 rounded text-[10px] bg-slate-100 hover:bg-sky-100 hover:text-sky-800 text-slate-700 transition-colors cursor-pointer"
                                  >
                                    {tag}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>

                          {/* Strategic Description */}
                          <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-700 block flex items-center justify-between">
                              <span>{isAr ? 'شرح تفاصيل الخطة وسياق التصميم:' : 'Strategic Context & Description:'}</span>
                              <span className="text-[10px] text-slate-400">{isAr ? 'استخرجه الـ AI من محتوى الصورة' : 'Extracted from visual by AI'}</span>
                            </label>
                            <textarea
                              rows={2}
                              value={item.desc}
                              onChange={(e) => handleUpdateBatchItem(item.id, { desc: e.target.value })}
                              placeholder={isAr ? 'سياق الخطة والهدف الترويجي...' : 'Marketing strategy and campaign context...'}
                              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none bg-white font-medium leading-relaxed"
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* TAB 2: LIVE PREVIEW MODE */
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-sky-50 border border-sky-200 text-sky-900 text-xs flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <Eye className="w-4 h-4 text-sky-600 shrink-0" />
                      <span>
                        {isAr 
                          ? `هكذا ستظهر هذه الصور والخطط الجديدة فور اعتمادها في دراسة حالة "${currentCaseStudy?.client}" على الموقع:` 
                          : `Live appearance of these new cards upon publishing in ${currentCaseStudy?.clientEn}:`}
                      </span>
                    </div>
                    <span className="font-bold text-[11px] text-sky-700 bg-sky-100 px-2.5 py-1 rounded-full">
                      {batchQueue.filter(q => q.status === 'ready').length} {isAr ? 'بطاقات جديدة' : 'new cards'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {batchQueue.filter(item => item.dataUrl).map((item, idx) => (
                      <div 
                        key={item.id}
                        className="bg-white rounded-2xl border-2 border-indigo-400/80 shadow-md overflow-hidden flex flex-col justify-between group relative"
                      >
                        {/* New Staged Highlight Badge */}
                        <span className="absolute top-2.5 start-2.5 z-10 px-2 py-0.5 rounded-md bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-[10px] font-black flex items-center gap-1 shadow-md">
                          <Sparkles className="w-3 h-3 text-amber-300" />
                          <span>{isAr ? 'جديد للنشر' : 'Staged'}</span>
                        </span>

                        <div className="relative aspect-[4/3] bg-slate-950 overflow-hidden">
                          <img 
                            src={item.dataUrl} 
                            alt={item.title} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                          />
                          <span className="absolute top-2.5 end-2.5 px-2.5 py-1 rounded-md bg-slate-950/80 backdrop-blur-md border border-slate-700/80 text-[10px] font-bold text-amber-400">
                            {item.tag || (isAr ? 'خطة معتمدة' : 'Creative')}
                          </span>

                          <button
                            type="button"
                            onClick={() => setPreviewImage({ url: item.dataUrl, title: item.title })}
                            className="absolute bottom-2.5 end-2.5 p-1.5 rounded-lg bg-slate-950/80 text-white hover:bg-sky-600 transition-colors shadow-sm cursor-pointer"
                          >
                            <Maximize2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="p-4 flex-1 flex flex-col justify-between space-y-2">
                          <div>
                            <h4 className="text-xs sm:text-sm font-bold text-slate-900 line-clamp-2 leading-snug">
                              {isAr ? item.title : (item.titleEn || item.title)}
                            </h4>
                            <p className="text-[11px] text-slate-500 mt-1 line-clamp-3 leading-relaxed">
                              {isAr ? item.desc : (item.descEn || item.desc)}
                            </p>
                          </div>
                          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-semibold">
                            <span>#{idx + 1} {item.fileName}</span>
                            <span className="text-emerald-600 font-bold flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>{isAr ? 'جاهز' : 'Ready'}</span>
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Sticky Footer */}
            <div className="p-4 sm:p-5 bg-white border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => batchFileInputRef.current?.click()}
                  disabled={isProcessingBatch}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>{isAr ? '+ إضافة صور أخرى للدفعة' : '+ Add More Images'}</span>
                </button>
                <span className="text-xs text-slate-500">
                  {batchQueue.filter(q => q.status === 'ready').length} {isAr ? 'صورة معتمدة' : 'ready images'}
                </span>
              </div>

              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsBatchModalOpen(false)}
                  disabled={isProcessingBatch}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isAr ? 'إغلاق ومتابعة لاحقاً' : 'Close'}
                </button>

                <button
                  type="button"
                  onClick={handlePublishBatchQueue}
                  disabled={isProcessingBatch || batchQueue.filter(q => q.dataUrl && q.status !== 'error').length === 0}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs shadow-lg shadow-emerald-600/25 flex items-center gap-2 cursor-pointer disabled:opacity-50 transition-all"
                >
                  <CheckCheck className="w-4 h-4 stroke-[3]" />
                  <span>
                    {isAr 
                      ? `🚀 اعتماد ونشر دفعة الصور (${batchQueue.filter(q => q.dataUrl && q.status !== 'error').length} صورة) في المشروع فوراً`
                      : `Publish ${batchQueue.filter(q => q.dataUrl && q.status !== 'error').length} Images to Case Study`}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 7: FULL IMAGE LIGHTBOX MODAL */}
      {previewImage && (
        <div 
          className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setPreviewImage(null)}
        >
          <div className="max-w-4xl w-full max-h-[90vh] flex flex-col items-center gap-3" onClick={(e) => e.stopPropagation()}>
            <div className="w-full flex items-center justify-between text-white px-2">
              <span className="text-sm font-bold">{previewImage.title}</span>
              <button
                type="button"
                onClick={() => setPreviewImage(null)}
                className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="rounded-2xl overflow-hidden border border-slate-700 bg-black shadow-2xl max-h-[80vh] flex items-center justify-center">
              <img src={previewImage.url} alt={previewImage.title} className="max-h-[80vh] w-auto object-contain" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
