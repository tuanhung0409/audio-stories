"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
  AlertCircle,
  ImageIcon,
  ChevronRight,
  ChevronLeft,
  Sparkles,
} from "lucide-react";

interface Story {
  id: string;
  title: string;
  coverImage: string;
  textContent: string;
  audioUrl: string;
  isNew: boolean;
  createdAt: string;
}

interface StoryForm {
  title: string;
  coverImage: string;
  textContent: string;
}

const emptyForm: StoryForm = { title: "", coverImage: "", textContent: "" };

/** Emotion label color config */
const EMOTION_COLORS: Record<string, { bg: string; border: string; text: string; label: string }> = {
  storytelling: {
    bg: "rgba(59, 130, 246, 0.08)",
    border: "rgba(59, 130, 246, 0.4)",
    text: "#93c5fd",
    label: "📖 storytelling",
  },
  happy: {
    bg: "rgba(234, 179, 8, 0.08)",
    border: "rgba(234, 179, 8, 0.4)",
    text: "#fde047",
    label: "😊 happy",
  },
  sad: {
    bg: "rgba(99, 102, 241, 0.08)",
    border: "rgba(99, 102, 241, 0.4)",
    text: "#a5b4fc",
    label: "😢 sad",
  },
  angry: {
    bg: "rgba(239, 68, 68, 0.08)",
    border: "rgba(239, 68, 68, 0.4)",
    text: "#fca5a5",
    label: "😠 angry",
  },
  neutral: {
    bg: "rgba(107, 114, 128, 0.08)",
    border: "rgba(107, 114, 128, 0.4)",
    text: "#d1d5db",
    label: "😐 neutral",
  },
};

/** Parses labeled content string into colored segments for preview */
function parseLabeledSegments(
  content: string
): { emotion: string; text: string }[] {
  const regex = /\[(storytelling|happy|sad|angry|neutral)\]([\s\S]*?)\[\/\1\]/g;
  const segments: { emotion: string; text: string }[] = [];
  let match;
  while ((match = regex.exec(content)) !== null) {
    segments.push({ emotion: match[1], text: match[2].trim() });
  }
  return segments;
}

export default function AdminDashboardPage() {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingStory, setEditingStory] = useState<Story | null>(null);
  const [form, setForm] = useState<StoryForm>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // 2-step create flow state
  const [step, setStep] = useState<1 | 2>(1);
  const [labeledContent, setLabeledContent] = useState("");
  const [labeling, setLabeling] = useState(false);
  const [labelError, setLabelError] = useState("");
  const [previewMode, setPreviewMode] = useState(true);

  // Delete confirmation state
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchStories = useCallback(async () => {
    try {
      setError("");
      const res = await fetch("/api/stories");
      if (!res.ok) throw new Error("Failed to fetch stories");
      const data = await res.json();
      setStories(data);
    } catch {
      setError("Không thể tải danh sách truyện. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStories();
  }, [fetchStories]);

  const openCreateDialog = () => {
    setEditingStory(null);
    setForm(emptyForm);
    setSubmitError("");
    setLabelError("");
    setLabeledContent("");
    setStep(1);
    setPreviewMode(true);
    setDialogOpen(true);
  };

  const openEditDialog = (story: Story) => {
    setEditingStory(story);
    setForm({
      title: story.title,
      coverImage: story.coverImage,
      textContent: story.textContent,
    });
    setSubmitError("");
    setLabelError("");
    setLabeledContent("");
    setStep(1);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setStep(1);
    setLabeledContent("");
    setLabelError("");
    setSubmitError("");
  };

  /** Step 1 → Step 2: just copy raw content over and advance (no AI call) */
  const handleGoToStep2 = () => {
    setLabeledContent(form.textContent);
    setPreviewMode(false);
    setLabelError("");
    setSubmitError("");
    setStep(2);
  };

  /** Optional: call Gemini AI to label the content currently in labeledContent textarea */
  const handleLabelWithAI = async () => {
    setLabeling(true);
    setLabelError("");

    try {
      const res = await fetch("/api/label", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Always label from the original raw text (form.textContent)
        body: JSON.stringify({ textContent: form.textContent }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data?.isQuotaError) {
          throw new Error(
            "Gemini hết quota hôm nay. Thử lại sau vài phút hoặc kích hoạt billing tại https://ai.dev/rate-limit"
          );
        }
        throw new Error(data.error || "Gán nhãn thất bại");
      }

      setLabeledContent(data.labeledContent);
      setPreviewMode(true);
    } catch (err) {
      setLabelError(
        err instanceof Error ? err.message : "Lỗi khi gán nhãn cảm xúc"
      );
    } finally {
      setLabeling(false);
    }
  };


  /** Step 2: Final submit – create story with labeled content */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError("");

    const payload = {
      title: form.title,
      coverImage: form.coverImage,
      // Always save the original raw content (step 1) to DB
      textContent: form.textContent,
      // Only sent when creating new — used for TTS audio generation only
      ...(editingStory ? {} : { labeledContent }),
    };

    try {
      if (editingStory) {
        const res = await fetch(`/api/stories/${editingStory.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Failed to update story");
        }

        const updated = await res.json();
        setStories((prev) =>
          prev.map((s) => (s.id === updated.id ? updated : s))
        );
      } else {
        const res = await fetch("/api/stories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Failed to create story");
        }

        const created = await res.json();
        setStories((prev) => [created, ...prev]);
      }

      handleCloseDialog();
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "Có lỗi xảy ra"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);

    try {
      const res = await fetch(`/api/stories/${deleteId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Failed to delete story");
      }

      setStories((prev) => prev.filter((s) => s.id !== deleteId));
      setDeleteId(null);
    } catch {
      setError("Không thể xóa truyện. Vui lòng thử lại.");
    } finally {
      setDeleting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const segments = parseLabeledSegments(labeledContent);

  return (
    <div className="mx-auto max-w-6xl">
      {/* Page header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Quản lý truyện
          </h1>
          <p className="mt-1 text-sm text-gray-400">
            {stories.length} truyện trong hệ thống
          </p>
        </div>
        <Button
          onClick={openCreateDialog}
          className="bg-orange-500 text-white hover:bg-orange-600"
        >
          <Plus className="mr-1.5 h-4 w-4" />
          Tạo truyện mới
        </Button>
      </div>

      {/* Error message */}
      {error && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
          <button
            onClick={() => setError("")}
            className="ml-auto text-red-400 hover:text-red-300"
          >
            ✕
          </button>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
        </div>
      )}

      {/* Empty state */}
      {!loading && stories.length === 0 && !error && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-gray-800 bg-gray-900 py-20">
          <ImageIcon className="mb-4 h-12 w-12 text-gray-600" />
          <p className="text-lg font-medium text-gray-400">
            Chưa có truyện nào
          </p>
          <p className="mt-1 text-sm text-gray-500">
            Bấm &quot;Tạo truyện mới&quot; để bắt đầu
          </p>
        </div>
      )}

      {/* Stories table */}
      {!loading && stories.length > 0 && (
        <div className="rounded-xl border border-gray-800 bg-gray-900">
          <Table>
            <TableHeader>
              <TableRow className="border-gray-800 hover:bg-transparent">
                <TableHead className="text-gray-400">Cover</TableHead>
                <TableHead className="text-gray-400">Tiêu đề</TableHead>
                <TableHead className="text-gray-400">Ngày tạo</TableHead>
                <TableHead className="text-gray-400">Trạng thái</TableHead>
                <TableHead className="text-right text-gray-400">
                  Hành động
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stories.map((story) => (
                <TableRow
                  key={story.id}
                  className="border-gray-800 hover:bg-gray-800/50"
                >
                  <TableCell>
                    <div className="h-12 w-12 overflow-hidden rounded-lg border border-gray-700 bg-gray-800">
                      {story.coverImage ? (
                        <img
                          src={story.coverImage}
                          alt={story.title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <ImageIcon className="h-5 w-5 text-gray-600" />
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium text-white">
                      {story.title}
                    </span>
                  </TableCell>
                  <TableCell className="text-gray-400">
                    {formatDate(story.createdAt)}
                  </TableCell>
                  <TableCell>
                    {story.isNew && (
                      <Badge className="bg-orange-500/10 text-orange-400 border-orange-500/20">
                        Mới
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => openEditDialog(story)}
                        className="text-gray-400 hover:text-white"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => setDeleteId(story.id)}
                        className="text-gray-400 hover:text-red-400"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* ─── Create/Edit Dialog ─── */}
      <Dialog open={dialogOpen} onOpenChange={handleCloseDialog}>
        <DialogContent className="flex max-h-[90vh] flex-col border-gray-800 bg-gray-900 text-white sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-white">
              {editingStory ? (
                "Chỉnh sửa truyện"
              ) : (
                <>
                  Tạo truyện mới
                  {/* Step indicator */}
                  <span className="ml-auto flex items-center gap-1.5 text-sm font-normal">
                    <span
                      className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                        step === 1
                          ? "bg-orange-500 text-white"
                          : "bg-green-500 text-white"
                      }`}
                    >
                      1
                    </span>
                    <span className={step === 1 ? "text-white" : "text-gray-400"}>
                      Nội dung
                    </span>
                    <ChevronRight className="h-3.5 w-3.5 text-gray-600" />
                    <span
                      className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                        step === 2
                          ? "bg-orange-500 text-white"
                          : "bg-gray-700 text-gray-400"
                      }`}
                    >
                      2
                    </span>
                    <span className={step === 2 ? "text-white" : "text-gray-500"}>
                      Gán nhãn
                    </span>
                  </span>
                </>
              )}
            </DialogTitle>
          </DialogHeader>

          {/* ── STEP 1: Basic info + raw content ── */}
          {(editingStory || step === 1) && (
            <form
              id="step1-form"
              className="flex min-h-0 flex-1 flex-col"
              onSubmit={
                editingStory
                  ? handleSubmit
                  : (e) => {
                      e.preventDefault();
                      handleGoToStep2();
                    }
              }
            >
              <div className="flex flex-col gap-4 overflow-y-auto py-4 pr-1">
                {/* Title */}
                <div className="flex flex-col gap-2">
                  <Label htmlFor="title" className="text-gray-300">
                    Tiêu đề
                  </Label>
                  <Input
                    id="title"
                    value={form.title}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, title: e.target.value }))
                    }
                    placeholder="Nhập tiêu đề truyện..."
                    required
                    className="border-gray-700 bg-gray-800 text-white placeholder:text-gray-500 focus-visible:border-orange-500 focus-visible:ring-orange-500/30"
                  />
                </div>

                {/* Cover Image URL */}
                <div className="flex flex-col gap-2">
                  <Label htmlFor="coverImage" className="text-gray-300">
                    URL ảnh bìa
                  </Label>
                  <Input
                    id="coverImage"
                    value={form.coverImage}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, coverImage: e.target.value }))
                    }
                    placeholder="https://example.com/image.jpg"
                    required
                    className="border-gray-700 bg-gray-800 text-white placeholder:text-gray-500 focus-visible:border-orange-500 focus-visible:ring-orange-500/30"
                  />
                  {form.coverImage && (
                    <div className="mt-1 h-20 w-20 overflow-hidden rounded-lg border border-gray-700">
                      <img
                        src={form.coverImage}
                        alt="Preview"
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                    </div>
                  )}
                </div>

                {/* Text Content */}
                <div className="flex flex-col gap-2">
                  <Label htmlFor="textContent" className="text-gray-300">
                    Nội dung truyện
                  </Label>
                  <Textarea
                    id="textContent"
                    value={form.textContent}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, textContent: e.target.value }))
                    }
                    placeholder="Nhập nội dung truyện..."
                    required
                    rows={8}
                    className="border-gray-700 bg-gray-800 text-white placeholder:text-gray-500 focus-visible:border-orange-500 focus-visible:ring-orange-500/30"
                  />
                </div>

                {/* Submit error (edit mode) */}
                {submitError && (
                  <div className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-400">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    {submitError}
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCloseDialog}
                  className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
                >
                  Hủy
                </Button>

                {editingStory ? (
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="bg-orange-500 text-white hover:bg-orange-600"
                  >
                    {submitting ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Đang lưu...
                      </span>
                    ) : (
                      "Lưu thay đổi"
                    )}
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={!form.textContent.trim()}
                    className="bg-orange-500 text-white hover:bg-orange-600"
                  >
                    <span className="flex items-center gap-2">
                      Tiếp theo
                      <ChevronRight className="h-4 w-4" />
                    </span>
                  </Button>
                )}
              </DialogFooter>
            </form>
          )}

          {/* ── STEP 2: Review / edit content before creating audio ── */}
          {!editingStory && step === 2 && (
            <form className="flex min-h-0 flex-1 flex-col" onSubmit={handleSubmit}>
              <div className="flex flex-col gap-4 overflow-y-auto py-4 pr-1">

                {/* AI label button + hint */}
                <div className="flex items-start justify-between gap-3 rounded-lg border border-gray-700 bg-gray-800/60 px-3 py-2.5">
                  <div className="flex flex-col gap-0.5">
                    <p className="text-sm font-medium text-gray-200">
                      Gán nhãn cảm xúc
                    </p>
                    <p className="text-xs text-gray-500">
                      Bạn có thể tự thêm nhãn thủ công hoặc dùng AI để tự động gán.
                    </p>
                  </div>
                  <Button
                    type="button"
                    disabled={labeling}
                    onClick={handleLabelWithAI}
                    className="shrink-0 bg-violet-600 text-white hover:bg-violet-700"
                  >
                    {labeling ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Đang gán nhãn...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4" />
                        Gán nhãn AI
                      </span>
                    )}
                  </Button>
                </div>

                {/* AI label error */}
                {labelError && (
                  <div className="flex items-start gap-2 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-400">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                    <span className="whitespace-pre-line">{labelError}</span>
                  </div>
                )}

                {/* Legend */}
                <div className="flex flex-wrap gap-2">
                  {Object.entries(EMOTION_COLORS).map(([key, cfg]) => (
                    <span
                      key={key}
                      className="rounded-full px-2.5 py-0.5 text-xs font-medium"
                      style={{
                        background: cfg.bg,
                        border: `1px solid ${cfg.border}`,
                        color: cfg.text,
                      }}
                    >
                      {cfg.label}
                    </span>
                  ))}
                </div>

                {/* 2-column side-by-side layout */}
                <div className="grid grid-cols-2 gap-4" style={{ height: "500px" }}>

                  {/* LEFT: Editable textarea */}
                  <div className="flex flex-col gap-1.5 min-h-0">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="labeledContent" className="text-gray-300">
                        Nội dung (có thể chỉnh sửa)
                      </Label>
                      <span className="text-xs text-gray-500">
                        [happy] · [sad] · [angry] · [neutral] · [storytelling]
                      </span>
                    </div>
                    <Textarea
                      id="labeledContent"
                      value={labeledContent}
                      onChange={(e) => {
                        setLabeledContent(e.target.value);
                        // Reset preview if user edits manually
                        if (previewMode) setPreviewMode(false);
                      }}
                      className="flex-1 resize-none border-gray-700 bg-gray-800 font-mono text-xs text-gray-200 placeholder:text-gray-500 focus-visible:border-orange-500 focus-visible:ring-orange-500/30"
                      placeholder={"Nhập nội dung có nhãn cảm xúc, ví dụ:\n[storytelling]Ngày xửa ngày xưa...[/storytelling]\n[happy]Con tìm thấy vàng rồi![/happy]"}
                    />
                  </div>

                  {/* RIGHT: Colored preview panel */}
                  <div className="flex flex-col gap-1.5 min-h-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-300">Xem trước màu nhãn</p>
                      {segments.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setPreviewMode((v) => !v)}
                          className="text-xs text-orange-400 hover:text-orange-300 transition-colors"
                        >
                          {previewMode ? "Ẩn" : "Hiện"}
                        </button>
                      )}
                    </div>
                    {segments.length === 0 ? (
                      <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed border-gray-700 bg-gray-800/40 py-12 text-center">
                        <div>
                          <p className="text-sm text-gray-500">Chưa có nội dung để xem trước</p>
                          <p className="mt-1 text-xs text-gray-600">Gán nhãn AI hoặc thêm tag thủ công</p>
                        </div>
                      </div>
                    ) : previewMode ? (
                      <div className="flex-1 overflow-y-auto rounded-lg border border-gray-700 bg-gray-800 p-3">
                        <div className="flex flex-col gap-2">
                          {segments.map((seg, i) => {
                            const cfg =
                              EMOTION_COLORS[seg.emotion] ??
                              EMOTION_COLORS.neutral;
                            return (
                              <div
                                key={i}
                                className="rounded-md px-3 py-2 text-sm leading-relaxed"
                                style={{
                                  background: cfg.bg,
                                  border: `1px solid ${cfg.border}`,
                                  color: "#f3f4f6",
                                }}
                              >
                                <span
                                  className="mb-1 block text-xs font-semibold uppercase tracking-wider"
                                  style={{ color: cfg.text }}
                                >
                                  {cfg.label}
                                </span>
                                {seg.text}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed border-gray-700 bg-gray-800/40 py-12 text-center">
                        <p className="text-sm text-gray-500">Preview đang ẩn</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Submit error */}
                {submitError && (
                  <div className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-400">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    {submitError}
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setStep(1);
                    setLabelError("");
                    setSubmitError("");
                  }}
                  className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
                >
                  <ChevronLeft className="mr-1 h-4 w-4" />
                  Quay lại
                </Button>
                <Button
                  type="submit"
                  disabled={submitting || !labeledContent.trim()}
                  className="bg-orange-500 text-white hover:bg-orange-600"
                >
                  {submitting ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Đang tạo audio...
                    </span>
                  ) : (
                    "🎙 Tạo audio"
                  )}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteId !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteId(null);
        }}
      >
        <DialogContent className="border-gray-800 bg-gray-900 text-white sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-white">Xác nhận xóa</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-400">
            Bạn có chắc chắn muốn xóa truyện này? Hành động này không thể hoàn
            tác và sẽ xóa cả file audio liên quan.
          </p>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteId(null)}
              className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
            >
              Hủy
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              {deleting ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Đang xóa...
                </span>
              ) : (
                "Xóa truyện"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
