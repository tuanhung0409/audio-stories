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
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError("");

    try {
      if (editingStory) {
        // Update existing story
        const res = await fetch(`/api/stories/${editingStory.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
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
        // Create new story
        const res = await fetch("/api/stories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Failed to create story");
        }

        const created = await res.json();
        setStories((prev) => [created, ...prev]);
      }

      setDialogOpen(false);
      setForm(emptyForm);
      setEditingStory(null);
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

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="border-gray-800 bg-gray-900 text-white sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-white">
              {editingStory ? "Chỉnh sửa truyện" : "Tạo truyện mới"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-4 py-4">
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
                onClick={() => setDialogOpen(false)}
                className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
              >
                Hủy
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="bg-orange-500 text-white hover:bg-orange-600"
              >
                {submitting ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {editingStory ? "Đang lưu..." : "Đang tạo..."}
                  </span>
                ) : editingStory ? (
                  "Lưu thay đổi"
                ) : (
                  "Tạo truyện"
                )}
              </Button>
            </DialogFooter>
          </form>
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
